'use strict';

// Executes the actual entrance controller with deterministic event/timer fixtures.
// These tests do not launch a browser or validate visual animation, CSS rendering,
// screen-reader output, native event ordering, or actual back/forward cache behavior.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(base, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(base, 'style.css'), 'utf8');
const marker = '/* Entrance choreography:';
const start = source.indexOf(marker);
assert.ok(start >= 0, 'Actual entrance controller found in app.js');
const controllerSource = source.slice(start);
// Small declaration reader for this CSS region only; not a CSS layout engine.
const introCssStart=css.indexOf('/* One entrance sequence,');
assert.ok(introCssStart>=0,'Actual entrance CSS region found');
const introCss=css.slice(introCssStart).replace(/\/\*[\s\S]*?\*\//g,'');
const cssRules=[...introCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match=>({selectors:match[1].trim().split(',').map(selector=>selector.trim()),body:match[2]}));
function declarations(selector) {
  const properties={};
  for(const rule of cssRules.filter(rule=>rule.selectors.includes(selector)))for(const declaration of rule.body.split(';')){
    const colon=declaration.indexOf(':');if(colon>=0)properties[declaration.slice(0,colon).trim()]=declaration.slice(colon+1).trim();
  }
  return properties;
}
function milliseconds(value) {
  const match=String(value).trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/);assert.ok(match,'Explicit CSS duration required: '+value);return Number(match[1])*(match[2]==='s'?1000:1);
}
function animationDuration(selector,name) {
  const value=declarations(selector).animation||'';
  const match=value.match(new RegExp('(?:^|,\\s*)'+name+'\\s+(\\d+(?:\\.\\d+)?(?:ms|s))\\b'));
  assert.ok(match,'Actual '+name+' duration found for '+selector);return milliseconds(match[1]);
}
function keyframeBody(name) {
  const marker='@keyframes '+name,offset=introCss.indexOf(marker);assert.ok(offset>=0,'Actual '+name+' keyframes found');
  const open=introCss.indexOf('{',offset);let depth=1,index=open+1;
  while(index<introCss.length&&depth){if(introCss[index]==='{')depth++;else if(introCss[index]==='}')depth--;index++;}
  assert.equal(depth,0,'Balanced keyframe block');return introCss.slice(open+1,index-1);
}
function frameTransform(name,step) {
  const match=keyframeBody(name).match(new RegExp('(?:^|})\\s*'+step+'\\s*\\{([^}]*)\\}'));
  assert.ok(match,'Actual '+step+' frame found for '+name);return match[1].match(/transform:\s*([^;]+);/)?.[1].replace(/\s/g,'');
}
// Responsive reduced-motion rules intentionally disable .site-intro. Read its
// ordinary first animation declaration for the normal duration comparison.
const exitDuration=milliseconds(introCss.match(/animation:\s*portfolio-intro-exit\s+(\d+(?:\.\d+)?(?:ms|s))\b/)?.[1]);
const backupDelay=Number(controllerSource.match(/setTimeout\(finish,\s*(\d+)\)/)?.[1]);

class Events {
  constructor(name) { this.name=name; this.listeners=[]; }
  addEventListener(type, handler, options={}) { this.listeners.push({type,handler,options}); }
  removeEventListener(type, handler, options={}) {
    const capture=typeof options==='boolean'?options:Boolean(options?.capture);
    this.listeners=this.listeners.filter(item=>!(item.type===type&&item.handler===handler&&Boolean(typeof item.options==='boolean'?item.options:item.options?.capture)===capture));
  }
  emit(type, fields={}) {
    const event={type,target:this,currentTarget:this,defaultPrevented:false,preventDefaultCalls:0,preventDefault(){this.defaultPrevented=true;this.preventDefaultCalls++;},...fields};
    // Snapshot matches dispatch: listeners may remove themselves during the event.
    for(const item of [...this.listeners].filter(item=>item.type===type))item.handler(event);
    return event;
  }
}
class Element extends Events {
  constructor(name, document) {
    super(name);this.document=document;this.hidden=false;this.children=[];this.parentElement=null;
    const classes=new Set(),properties=new Map();
    this.classList={add:(...names)=>names.forEach(name=>classes.add(name)),remove:(...names)=>names.forEach(name=>classes.delete(name)),contains:name=>classes.has(name)};
    this.style={setProperty:(name,value)=>properties.set(name,String(value)),getPropertyValue:name=>properties.get(name)||''};
    this.focusCalls=[];
  }
  append(child){this.children.push(child);child.parentElement=this;}
  contains(element){return element===this||this.children.some(child=>child.contains(element));}
  querySelector(selector){return this.children.find(child=>child.selector===selector)||null;}
  focus(options){this.focusCalls.push(options);this.document.activeElement=this;this.document.emit('focusin',{target:this});}
}
function fixture(options={}) {
  const document=new Events('document'),window=new Events('window'),reduced=new Events('reduced');
  const fontChecks=[];let fontReady=Boolean(options.fontReady);
  if(options.fontAPI!==false){document.fonts=new Events('fonts');document.fonts.check=(spec,text)=>{fontChecks.push({spec,text});return fontReady;};}
  document.hidden=Boolean(options.hidden);reduced.matches=Boolean(options.reduced);
  document.documentElement=new Element('html',document);
  const surface=new Element('surface',document);surface.hidden=true;
  const skip=new Element('skip',document);skip.selector='.intro-skip';surface.append(skip);
  const scene=new Element('scene',document);surface.append(scene);
  const main=new Element('main',document),header=new Element('header',document),externalLink=new Element('externalLink',document);
  header.getBoundingClientRect=()=>({bottom:options.headerBottom??102});
  document.activeElement=externalLink;
  const elements={'#site-intro':options.missingSurface?null:surface,'#main':main,'.header':header};
  document.querySelector=selector=>elements[selector]||null;
  const scrollChanges=[];let scrollPosition=options.scrollY??0;
  Object.defineProperty(window,'scrollY',{get:()=>scrollPosition,set:value=>{scrollChanges.push({kind:'assignment',value});scrollPosition=value;}});
  window.scrollTo=(...args)=>scrollChanges.push({kind:'scrollTo',args});
  window.scrollBy=(...args)=>scrollChanges.push({kind:'scrollBy',args});
  const storage=options.storage||new Map();
  window.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>{if(options.storageBlocked)throw new Error('Storage blocked');storage.set(key,value);}};
  window.performance={getEntriesByType:type=>type==='navigation'?[{type:options.navigationType||'navigate'}]:[]};
  const location={hash:options.hash||''};
  const networkCalls=[];
  const network=options.noNetwork?null:{suspend:()=>networkCalls.push('suspend'),sync:()=>networkCalls.push('sync')};
  let now=0,nextTimer=1;
  const timers=new Map(),clearedTimers=[];
  function setTimeoutFixture(handler,delay){const id=nextTimer++;timers.set(id,{handler,due:now+delay});return id;}
  function clearTimeoutFixture(id){clearedTimers.push(id);timers.delete(id);}
  function advance(milliseconds){
    const target=now+milliseconds;
    while(true){const next=[...timers].filter(([,timer])=>timer.due<=target).sort((a,b)=>a[1].due-b[1].due)[0];if(!next)break;now=next[1].due;timers.delete(next[0]);next[1].handler();}
    now=target;
  }
  const context=vm.createContext({document,window,reduced,location,network,Math,paused:Boolean(options.paused),setTimeout:setTimeoutFixture,clearTimeout:clearTimeoutFixture,getComputedStyle:()=>({getPropertyValue:name=>name==='--intro-ready'?(options.cssReady===false?'':'1'):''}),console});
  vm.runInContext('const $=(selector,root=document)=>root.querySelector(selector);let entrance=null;',context);
  vm.runInContext(controllerSource,context,{filename:'app.js:actual-entrance-controller'});
  const entrance=vm.runInContext('entrance',context);
  const emitters=[document,window,reduced,surface,skip,...(document.fonts?[document.fonts]:[])];
  function setFontReady(ready){fontReady=ready;document.fonts?.emit('loadingdone');}
  return {document,window,reduced,location,surface,skip,scene,main,header,externalLink,entrance,networkCalls,timers,clearedTimers,advance,scrollChanges,emitters,fontChecks,setFontReady};
}
function assertActive(f) {
  assert.ok(f.entrance&&typeof f.entrance.finish==='function');assert.equal(f.surface.hidden,false);
  assert.ok(f.document.documentElement.classList.contains('intro-active'));assert.equal(f.timers.size,1);
  assert.deepEqual(f.networkCalls,['suspend']);
}
function assertReleased(f) {
  assert.equal(f.surface.hidden,true);assert.ok(!f.document.documentElement.classList.contains('intro-active'));
  assert.equal(f.timers.size,0,'No pending safety timer after finish');
  assert.equal(f.emitters.reduce((sum,target)=>sum+target.listeners.length,0),0,'All entrance listeners removed');
  assert.deepEqual(f.networkCalls,['suspend','sync'],'Network resumes exactly once');
  assert.deepEqual(f.scrollChanges,[],'Entrance never changes the scroll position');
}
const tests=[];
function test(name,fn){tests.push({name,fn});}
test('HTML intro is hidden before JavaScript executes',()=>{
  const opening=html.match(/<div\b[^>]*id="site-intro"[^>]*>/)?.[0];assert.ok(opening);assert.match(opening,/\bhidden(?:\s|=|>)/);
});
test('Normal start activates an optional surface below the available header',()=>{
  const f=fixture();assertActive(f);assert.equal(f.surface.style.getPropertyValue('--intro-top'),'102px');assert.equal(f.document.activeElement,f.externalLink);assert.deepEqual(f.scrollChanges,[]);
});
for(const [name,options] of [
  ['project anchor',{hash:'#projet-agriscan'}],['section anchor',{hash:'#contact'}],['reduced motion',{reduced:true}],['manual pause',{paused:true}],
  ['hidden document',{hidden:true}],['restored scroll',{scrollY:120}],['back/forward navigation',{navigationType:'back_forward'}],['missing CSS',{cssReady:false}],['missing optional surface',{missingSurface:true}]
])test('Does not start for '+name,()=>{
  const f=fixture(options);assert.equal(f.entrance,null);assert.equal(f.surface.hidden,true);assert.ok(!f.document.documentElement.classList.contains('intro-active'));
  assert.equal(f.timers.size,0);assert.deepEqual(f.networkCalls,[]);assert.equal(f.emitters.reduce((sum,target)=>sum+target.listeners.length,0),0);assert.deepEqual(f.scrollChanges,[]);
});
test('Only the matching surface animation end naturally finishes the intro',()=>{
  const f=fixture();assertActive(f);
  const event=f.surface.emit('animationend',{target:f.surface,animationName:'portfolio-intro-exit'});assertReleased(f);assert.equal(event.preventDefaultCalls,0);
});
test('Child animation end and unrelated surface animation end are ignored',()=>{
  const f=fixture();f.surface.emit('animationend',{target:f.scene,animationName:'portfolio-intro-exit'});assertActive(f);
  f.surface.emit('animationend',{target:f.surface,animationName:'portfolio-word-in'});assertActive(f);
  f.entrance.finish();assertReleased(f);
});
test('The independent safety timer releases an intro with no animation event',()=>{
  const f=fixture();f.advance(5099);assertActive(f);f.advance(1);assertReleased(f);
});
for(const type of ['pointerdown','keydown','focusin','wheel','touchstart'])test('First '+type+' restores content without preventing the visitor action',()=>{
  const f=fixture();const event=f.document.emit(type,{target:f.externalLink,key:'Tab'});assertReleased(f);assert.equal(event.defaultPrevented,false);assert.equal(event.preventDefaultCalls,0);assert.equal(f.document.activeElement,f.externalLink);
});
for(const type of ['scroll','resize','hashchange','pagehide'])test('Window '+type+' stops the entrance and cleans up',()=>{
  const f=fixture();const event=f.window.emit(type);assertReleased(f);assert.equal(event.preventDefaultCalls,0);
});
test('Changing to reduced motion stops an active intro',()=>{
  const f=fixture();f.reduced.matches=true;const event=f.reduced.emit('change',{matches:true});assertReleased(f);assert.equal(event.preventDefaultCalls,0);
});
test('A non-reducing preference change does not interrupt the intro',()=>{
  const f=fixture();f.reduced.emit('change',{matches:false});assertActive(f);f.entrance.finish();assertReleased(f);
});
test('A hidden-document transition releases the intro, while a visible transition does not',()=>{
  const f=fixture();f.document.emit('visibilitychange');assertActive(f);f.document.hidden=true;f.document.emit('visibilitychange');assertReleased(f);
});
test('bfcache pageshow releases an active intro, ordinary pageshow does not restart it',()=>{
  const f=fixture();f.window.emit('pageshow',{persisted:false});assertActive(f);f.window.emit('pageshow',{persisted:true});assertReleased(f);
  f.window.emit('pageshow',{persisted:false});f.window.emit('pageshow',{persisted:true});assertReleased(f);
});
test('Surface animation cancellation releases the intro; child cancellation is ignored',()=>{
  const f=fixture();f.surface.emit('animationcancel',{target:f.scene});assertActive(f);f.surface.emit('animationcancel',{target:f.surface});assertReleased(f);
});
test('Skip button finishes the intro without preventing its click',()=>{
  const f=fixture();const event=f.skip.emit('click');assertReleased(f);assert.equal(event.preventDefaultCalls,0);
});
test('Focus already inside the closing intro moves to main with preventScroll',()=>{
  const f=fixture();f.document.activeElement=f.skip;f.entrance.finish();assertReleased(f);assert.equal(f.document.activeElement,f.main);assert.equal(f.main.focusCalls.length,1);assert.equal(f.main.focusCalls[0].preventScroll,true);
});
test('External focus is preserved and repeated finish/events/timers stay inert',()=>{
  const f=fixture();f.entrance.finish();assertReleased(f);f.entrance.finish();f.document.emit('keydown',{key:'Tab'});f.surface.emit('animationend',{animationName:'portfolio-intro-exit'});f.advance(10000);assertReleased(f);assert.equal(f.document.activeElement,f.externalLink);assert.equal(f.main.focusCalls.length,0);
});
test('Input interruption listeners are passive and capture the first action',()=>{
  const f=fixture();for(const type of ['pointerdown','keydown','focusin','wheel','touchstart']){const listener=f.document.listeners.find(item=>item.type===type);assert.ok(listener);assert.equal(listener.options.capture,true);assert.equal(listener.options.passive,true);}f.entrance.finish();assertReleased(f);
});
test('Controller works when the decorative network is unavailable',()=>{
  const f=fixture({noNetwork:true});assert.equal(f.surface.hidden,false);f.entrance.finish();assert.equal(f.surface.hidden,true);assert.equal(f.timers.size,0);assert.deepEqual(f.networkCalls,[]);assert.deepEqual(f.scrollChanges,[]);
});
test('HTML provides exactly three scenes, counter-translation wrappers and central objects',()=>{
  const region=html.slice(html.indexOf('id="site-intro"'),html.indexOf('<main'));
  assert.equal((region.match(/class="intro-scene"/g)||[]).length,3);
  assert.equal((region.match(/class="intro-content"/g)||[]).length,3);
  assert.equal((region.match(/class="intro-object"/g)||[]).length,3);
  assert.equal((region.match(/<div class="intro-scene">\s*<div class="intro-content">/g)||[]).length,3);
  assert.equal((region.match(/<div class="intro-object">\s*<svg class="intro-art"/g)||[]).length,3);
});
test('CSS isolates and clips the opaque scene layers while keeping objects above their titles',()=>{
  const surface=declarations('.site-intro'),group=declarations('.intro-scenes'),panel=declarations('.intro-scene'),content=declarations('.intro-content');
  for(const layer of [surface,group,panel,content])assert.equal(layer.isolation,'isolate');
  assert.equal(surface.overflow,'hidden');assert.equal(panel.overflow,'hidden');assert.equal(Number(group['z-index']),0);
  const layers=[Number(panel['z-index']),Number(declarations('.intro-scene:nth-child(2)')['z-index']),Number(declarations('.intro-scene:nth-child(3)')['z-index'])];
  assert.deepEqual(layers,[1,2,3]);assert.ok(Number(declarations('.intro-skip')['z-index'])>Number(group['z-index']));
  const title=declarations('.intro-title'),object=declarations('.intro-object');
  assert.ok(Number(object['z-index'])>Number(title['z-index']));assert.equal(title.left,'50%');assert.equal(object.left,'50%');
  for(const selector of ['.intro-scene','.intro-scene:nth-child(2)','.intro-scene:nth-child(3)']){const fill=declarations(selector).background;assert.ok(fill&&!/transparent|\//.test(fill),'Opaque background required for '+selector);}
});
test('Incoming panel and composition use exactly opposite translations with matching duration, easing and delay',()=>{
  const panelSelector='.intro-scene + .intro-scene',counterSelector='.intro-scene + .intro-scene > .intro-content';
  const panel=declarations(panelSelector),counter=declarations(counterSelector);
  assert.equal(panel.animation.replace('portfolio-panel-in','paired-motion'),counter.animation.replace('portfolio-panel-counter','paired-motion'));
  assert.equal(animationDuration(panelSelector,'portfolio-panel-in'),600);assert.match(panel.animation,/var\(--intro-delay\)\s+both$/);
  assert.equal(frameTransform('portfolio-panel-in','from'),'translate3d(100%,0,0)');assert.equal(frameTransform('portfolio-panel-counter','from'),'translate3d(-100%,0,0)');
  assert.equal(frameTransform('portfolio-panel-in','to'),'translate3d(0,0,0)');assert.equal(frameTransform('portfolio-panel-counter','to'),'translate3d(0,0,0)');
  for(const selector of ['.intro-scene','.intro-content']){const props=declarations(selector);assert.equal(props.position,'absolute');assert.equal(props.inset,'0');assert.ok(!props.width&&!props.padding&&!props.border,'Equal-size translation reference boxes: '+selector);}
});
test('Panel timing gives at least 800ms to each installed scene before the next movement',()=>{
  const duration=animationDuration('.intro-scene + .intro-scene','portfolio-panel-in');
  const delay2=milliseconds(declarations('.intro-scene:nth-child(2)')['--intro-delay']),delay3=milliseconds(declarations('.intro-scene:nth-child(3)')['--intro-delay']);
  const exitStart=exitDuration*Number(keyframeBody('portfolio-intro-exit').match(/0%,\s*([\d.]+)%/)?.[1])/100;
  const rests=[delay2,delay3-(delay2+duration),exitStart-(delay3+duration)];
  assert.ok(rests.every(rest=>rest>=800),'Scene reading intervals: '+rests.join(', '));
  assert.ok(delay3+duration<exitStart);assert.ok(delay3+animationDuration('.intro-art','portfolio-object-turn')<exitDuration,'Final object movement ends before the whole sequence finishes');
  assert.equal(exitDuration,4800);assert.equal(backupDelay,5100);assert.ok(backupDelay>exitDuration);
  const f=fixture();assert.equal([...f.timers.values()][0].due,backupDelay);f.entrance.finish();assertReleased(f);
});
test('Entrance content has no outgoing opacity animation or artificial blank phases',()=>{
  assert.doesNotMatch(introCss,/portfolio-content-(?:in|out)|--intro-(?:enter|leave)/);
  assert.doesNotMatch(introCss,/opacity\s*:/,'Opacity animation is absent throughout the current entrance CSS');
  for(const selector of ['.intro-title','.intro-object','.intro-number','.intro-caption','.intro-topics'])assert.ok(!declarations(selector).animation,'Content is revealed by its opaque panel: '+selector);
});
test('An already available web font is chosen once and remains fixed for the sequence',()=>{
  const f=fixture({fontReady:true});assertActive(f);assert.equal(f.surface.style.getPropertyValue('--intro-display'),"'Unbounded', Arial, sans-serif");
  assert.equal(f.fontChecks.length,1);assert.match(f.fontChecks[0].spec,/Unbounded/);f.setFontReady(false);f.advance(1800);
  assert.equal(f.fontChecks.length,1);assert.equal(f.surface.style.getPropertyValue('--intro-display'),"'Unbounded', Arial, sans-serif");f.entrance.finish();assertReleased(f);
});
test('A late web font never replaces the initial fallback midway through the intro',()=>{
  const f=fixture({fontReady:false});assertActive(f);assert.equal(f.surface.style.getPropertyValue('--intro-display'),"'Arial Black', Arial, sans-serif");
  f.setFontReady(true);f.advance(2600);assert.equal(f.fontChecks.length,1);assert.equal(f.surface.style.getPropertyValue('--intro-display'),"'Arial Black', Arial, sans-serif");f.entrance.finish();assertReleased(f);
});
test('Missing optional Font Loading API keeps the system fallback and the intro usable',()=>{
  const f=fixture({fontAPI:false});assertActive(f);assert.equal(f.fontChecks.length,0);assert.equal(f.surface.style.getPropertyValue('--intro-display'),"'Arial Black', Arial, sans-serif");f.entrance.finish();assertReleased(f);
});

test('Reload in the same session does not replay the intro',()=>{
  const storage=new Map();const first=fixture({storage});assertActive(first);first.entrance.finish();
  assert.equal(fixture({storage,navigationType:'reload'}).entrance,null);
});
test('Skipping counts as seen for subsequent visits',()=>{
  const storage=new Map();const first=fixture({storage});first.document.emit('pointerdown');
  assert.equal(fixture({storage}).entrance,null);
});
test('A new session can play again',()=>{assertActive(fixture({storage:new Map()}));});
test('Blocked storage skips the decorative intro without throwing',()=>{
  assert.equal(fixture({storageBlocked:true}).entrance,null);
});
let passed=0,failed=0;
for(const {name,fn} of tests){try{fn();passed++;console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+'\n'+error.stack);}}
console.log(`\n${passed} passed; ${failed} failed. Actual entrance JavaScript in isolated fixtures; no browser, rendering, native event ordering or accessibility certification claims.`);
process.exitCode=failed?1:0;
