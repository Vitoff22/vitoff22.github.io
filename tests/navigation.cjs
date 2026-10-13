// Regression: an incomplete navigation must not crash the rest of app.js.
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(join(__dirname, '..', 'app.js'), 'utf8');
const start = source.indexOf('/* Mobile navigation:');
const end = source.indexOf('/* Project filters */');
assert.ok(start >= 0 && end > start);
const navigation = source.slice(start, end);
for (const missing of ['.menu', '#nav', '.header']) {
  let continued = false;
  vm.runInNewContext(navigation + '\ncontinuePage();', {
    $: selector => selector === missing ? null : {},
    continuePage: () => { continued = true; }
  });
  assert.equal(continued, true, `Initialization continues without ${missing}`);
}
const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');
assert.match(html, /<script src="app\.js\?v=[^"]+" defer><\/script>/);
assert.match(html, /href="style\.css\?v=[^"]+"/);
assert.match(html, /id="nav"/);
assert.match(html, /class="menu"/);
console.log('PASS: 3 missing-navigation cases; versioned resources and deferred script.');
