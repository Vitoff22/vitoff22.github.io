'use strict';

// Static security contracts plus actual contact-handler execution in a small VM.
// Browser CSP enforcement and rendering still need a real-browser smoke test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const css = read('style.css');
const js = read('app.js');
let checks = 0;
function check(label, run) { run(); checks++; console.log(`PASS: ${label}`); }
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(m => [m[1].toLowerCase(), m[2]]));
const tags = [...html.matchAll(/<([a-z][\w-]*)\b[^>]*>/gi)].map(m => ({name:m[1].toLowerCase(), raw:m[0], attrs:attrs(m[0]), index:m.index}));
const cspMeta = tags.find(tag => tag.name === 'meta' && tag.attrs['http-equiv']?.toLowerCase() === 'content-security-policy');
assert.ok(cspMeta, 'CSP meta exists');
const csp = Object.fromEntries(cspMeta.attrs.content.split(';').map(s => s.trim().split(/\s+/)).filter(parts => parts[0]).map(([key, ...values]) => [key, values]));

check('CSP is parsed before every loaded resource', () => {
  const resource = tags.find(tag => ['script','link','img','iframe','object','embed','style','base'].includes(tag.name));
  assert.ok(cspMeta.index < resource.index);
});
check('scripts, styles, fonts and images are limited to the site origin', () => {
  for(const directive of ['script-src','style-src','font-src','img-src']) assert.deepEqual(csp[directive], ["'self'"]);
  for(const directive of ['default-src','base-uri','object-src','script-src-attr','style-src-attr','connect-src','frame-src','worker-src','form-action']) assert.deepEqual(csp[directive], ["'none'"]);
  assert.doesNotMatch(cspMeta.attrs.content, /unsafe-inline|unsafe-eval|\*|data:|blob:/);
  assert.equal(csp['frame-ancestors'], undefined, 'frame-ancestors must be an HTTP header, not an ineffective meta promise');
});
check('no referrer URL is disclosed to linked sites', () => {
  assert.ok(tags.some(tag => tag.name === 'meta' && tag.attrs.name === 'referrer' && tag.attrs.content === 'no-referrer'));
});
check('no inline executable content or style attributes conflict with CSP', () => {
  for(const tag of tags) {
    assert.ok(!Object.keys(tag.attrs).some(name => /^on[a-z]+$/.test(name)), tag.raw);
    assert.equal(tag.attrs.style, undefined, tag.raw);
    assert.ok(!['iframe','object','embed','base','style'].includes(tag.name), tag.raw);
    if(tag.name === 'script') assert.ok(tag.attrs.src && !/^(?:[a-z]+:|\/\/|\/)/i.test(tag.attrs.src));
    for(const name of ['href','src','action']) if(tag.attrs[name]) assert.doesNotMatch(tag.attrs[name], /^\s*(?:javascript|data|blob):/i);
  }
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) assert.equal(match[1].trim(), '');
});
check('all automatic page resources are local and exist', () => {
  for(const tag of tags) {
    const resource = tag.name === 'script' || tag.name === 'img' ? tag.attrs.src : tag.name === 'link' ? tag.attrs.href : null;
    if(!resource) continue;
    assert.doesNotMatch(resource, /^(?:[a-z]+:|\/\/|\/)/i);
    assert.ok(fs.existsSync(path.join(root, resource.split(/[?#]/)[0])), resource);
  }
  assert.doesNotMatch(css, /@import\b/);
  for(const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi)) {
    assert.doesNotMatch(match[1], /^(?:[a-z]+:|\/\/|\/)/i);
    assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
  }
  assert.doesNotMatch(html + css, /fonts\.(?:googleapis|gstatic)\.com/);
});
check('original fonts ship as WOFF2 with redistribution licenses', () => {
  for(const family of ['manrope','unbounded']) {
    for(const subset of ['latin','latin-ext']) assert.equal(fs.readFileSync(path.join(root,'assets','fonts',`${family}-${subset}.woff2`)).subarray(0,4).toString(), 'wOF2');
    assert.match(read(`assets/fonts/OFL-${family[0].toUpperCase()+family.slice(1)}.txt`), /SIL OPEN FONT LICENSE Version 1\.1/);
  }
  assert.match(css, /font-family: 'Manrope';[\s\S]*?font-weight: 400 800/);
  assert.match(css, /font-family: 'Unbounded';[\s\S]*?font-weight: 400 700/);
});
check('new-tab links cannot access the original window', () => {
  for(const tag of tags.filter(tag => tag.name === 'a' && tag.attrs.target === '_blank')) {
    const rel = (tag.attrs.rel || '').split(/\s+/);
    assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), tag.raw);
  }
});
check('the public CV remains a normal same-origin PDF link', () => {
  const links = tags.filter(tag => tag.name === 'a' && /\bdata-cv-view\b/.test(tag.raw));
  assert.ok(links.length > 0);
  for(const link of links) assert.ok(link.attrs.href === 'assets/CV_Julien_Fretille.pdf' && fs.existsSync(path.join(root, link.attrs.href)));
  assert.doesNotMatch(js, /createObjectURL|atob\(|innerHTML\s*=|outerHTML\s*=|document\.write\(|\beval\(/);
});

const contactStart = js.indexOf('/* Contact uses');
const contactEnd = js.indexOf('/* Scroll state,');
assert.ok(contactStart >= 0 && contactEnd > contactStart);
function submit(senderValue, messageValue) {
  const elements = {};
  for(const id of ['copy-email','sender','message','form-feedback','contact-form']) elements['#'+id] = {
    value: '', textContent:'', hidden:true, events:{}, validity:'',
    addEventListener(name, handler) { this.events[name] = handler; },
    setCustomValidity(message) { this.validity = message; }
  };
  const location = {href:'https://example.test/'};
  vm.runInNewContext(js.slice(contactStart, contactEnd), {$:s=>elements[s], EMAIL:'julien.fretille@gmail.com', window:{location}, encodeURIComponent});
  elements['#sender'].value = senderValue;
  elements['#message'].value = messageValue;
  let prevented = false;
  elements['#contact-form'].events.submit({preventDefault(){prevented=true;},currentTarget:{reportValidity(){return !elements['#sender'].validity && !elements['#message'].validity;}}});
  assert.ok(prevented);
  return {location, elements};
}
check('contact payloads remain text and cannot add recipients or URL parameters', () => {
  const sender = 'Alice &bcc=other@example.test <img src=x onerror=alert(1)>';
  const message = '<script>alert(1)</script>\n?cc=other@example.test&body=replace#fragment';
  const result = submit(sender, message);
  const uri = new URL(result.location.href);
  assert.equal(uri.protocol, 'mailto:');
  assert.equal(uri.pathname, 'julien.fretille@gmail.com');
  assert.deepEqual([...uri.searchParams.keys()], ['subject','body']);
  assert.equal(uri.searchParams.get('subject'), `Contact portfolio — ${sender}`);
  assert.equal(uri.searchParams.get('body'), `${message}\n\n${sender}`);
  assert.equal(uri.hash, '');
  assert.match(result.elements['#form-feedback'].textContent, /Message préparé/);
  assert.doesNotMatch(result.elements['#form-feedback'].textContent, /message envoyé/i);
});
check('empty contact fields never navigate or claim an email was sent', () => {
  for(const input of [[' ','hello'],['Alice','\n ']]) {
    const result=submit(...input);
    assert.equal(result.location.href,'https://example.test/');
    assert.equal(result.elements['#form-feedback'].textContent,'');
  }
});
console.log(`Security contracts: ${checks} groups passed (static checks and contact VM; not a browser certification).`);
