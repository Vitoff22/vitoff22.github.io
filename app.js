'use strict';

const DOMAINS = {
  systemes: { number:'01', title:'Faire fonctionner les systèmes.', text:'Windows Server, Linux et virtualisation : les bases de mon parcours.' },
  reseaux: { number:'02', title:'Relier les environnements.', text:'Cisco, DNS, DHCP et VLAN : des technologies présentes dans ma formation et mes projets.' },
  cyber: { number:'03', title:'Comprendre pour mieux protéger.', text:'Sécurisation, analyse de vulnérabilités et veille : les notions que j’approfondis.' }
};
const EMAIL = 'julien.fretille@gmail.com';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let toastTimer;
let entrance = null;
document.documentElement.classList.add('js');
$('.filters').hidden=false;
$('.orbit-controls').hidden=false;
$('#motion-toggle').hidden=false;

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 5000);
}
/* Mobile navigation: logical focus order and an explicit return on Escape. */
const menu=$('.menu'), nav=$('#nav'), header=$('.header');
// A missing navigation must not stop projects, contact or the entrance controller.
if(menu && nav && header) {
function setMenuSurface(open) {
  document.documentElement?.classList.toggle('menu-open',open);
  $$('main,footer,.skip').forEach(element=>element.inert=open);
  const label=$('.menu-word',menu);
  if(label) label.textContent=open?'Fermer':'Menu';
}
function closeMenu(restoreFocus=false) {
  const wasOpen=menu.getAttribute('aria-expanded')==='true';
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Ouvrir le menu');
  setMenuSurface(false);
  if(wasOpen && restoreFocus) menu.focus();
}
menu.addEventListener('click', () => {
  if(menu.getAttribute('aria-expanded')==='true') { closeMenu(true); return; }
  nav.classList.add('open');
  menu.setAttribute('aria-expanded','true');
  menu.setAttribute('aria-label','Fermer le menu');
  setMenuSurface(true);
  $('a',nav)?.focus();
});
$$('a',header).forEach(link => link.addEventListener('click', () => {
  const section=link.hash ? $(link.hash) : null;
  closeMenu(!section);
  if(section) {
    section.tabIndex=-1;
    section.focus({preventScroll:true});
  }
}));
document.addEventListener('keydown', e => {
  if(e.key==='Escape') closeMenu(true);
  if(e.key==='Tab' && menu.getAttribute('aria-expanded')==='true') {
    const controls=$$('a,button',header);
    const first=controls[0],last=controls.at(-1);
    if(e.shiftKey && document.activeElement===first) { e.preventDefault();last.focus(); }
    else if(!e.shiftKey && document.activeElement===last) { e.preventDefault();first.focus(); }
  }
});
document.addEventListener('click', e => { if(!header.contains(e.target)) closeMenu(); });
window.matchMedia('(min-width:761px)').addEventListener('change', e => { if(e.matches) closeMenu(); });

} // Navigation is optional; the rest of the page initializes independently.

/* Project filters */
const projectCards=$$('.project');
const allCount=$('[data-filter="all"] span');
if(allCount) allCount.textContent=String(projectCards.length).padStart(2,'0');
$$('.filters button').forEach(button => button.addEventListener('click', () => {
  const filter=button.dataset.filter;
  $$('.filters button').forEach(item => {
    const selected=item===button;
    item.classList.toggle('active',selected);
    item.setAttribute('aria-pressed',String(selected));
  });
  let count=0;
  projectCards.forEach(card => {
    card.hidden=filter!=='all'&&!card.dataset.category.split(' ').includes(filter);
    if(!card.hidden) { count++; card.classList.add('visible'); }
  });
  $('.project-grid').classList.toggle('filtered',filter!=='all');
  $('#project-count').textContent=`${count} projet${count>1?'s':''}${filter==='all'?' au total':' affiché'+(count>1?'s':'')}`;
  const firstVisible=projectCards.find(card=>!card.hidden);
  if(firstVisible) firstVisible.dispatchEvent(new Event('projectpreview'));
  const selected=projectFromHash();
  if(selected?.closest('.project').hidden) {
    history.pushState(null,'','#projets');
    syncProjectRoute();
  }
}));

/* Project anchors: normal HTML first, progressive history and filtering. */
const projectDetails=$$('.project-details');
function projectFromHash() { return projectDetails.find(detail => '#'+detail.id===location.hash); }
function syncProjectRoute({focus=false,scroll=false}={}) {
  const selected=projectFromHash();
  const focusedDetail=projectDetails.find(detail=>detail.contains(document.activeElement));
  projectDetails.forEach(detail => detail.open=detail===selected);
  if(!selected) {
    if(focusedDetail) $('summary',focusedDetail).focus({preventScroll:true});
    return;
  }
  const card=selected.closest('.project');
  if(card.hidden) $('[data-filter="all"]').click();
  card.classList.add('visible');
  card.dispatchEvent(new Event('projectpreview'));
  if(scroll) selected.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});
  if(focus || (focusedDetail && focusedDetail!==selected)) $('summary',selected).focus({preventScroll:true});
}
function navigateProject(id) {
  if(location.hash!=='#'+id) history.pushState(null,'','#'+id);
  syncProjectRoute({focus:true,scroll:true});
}
$$('a[href^="#projet-"]').forEach(link => link.addEventListener('click',e => {
  e.preventDefault(); navigateProject(link.hash.slice(1));
}));
projectDetails.forEach(detail => $('summary',detail).addEventListener('click',e => {
  e.preventDefault();
  if(!detail.open) { navigateProject(detail.id); return; }
  history.pushState(null,'','#projets');
  syncProjectRoute();
  $('summary',detail).focus({preventScroll:true});
}));
window.addEventListener('popstate',()=>syncProjectRoute({scroll:true}));
window.addEventListener('hashchange',()=>syncProjectRoute({scroll:true}));
syncProjectRoute();
// Wait for layout before positioning a direct link opened in a new tab.
if(projectFromHash()) requestAnimationFrame(()=>syncProjectRoute({scroll:true}));
$$('[data-copy-project]').forEach(button => {
  button.hidden=false;
  button.addEventListener('click',async()=>{
    const url=new URL(location.href); url.hash=button.dataset.copyProject;
    try {
      await navigator.clipboard.writeText(url.href);
      toast(url.protocol==='file:'?'Lien local copié. Partagez aussi le fichier HTML.':'Lien du projet copié.');
    } catch {
      let input=$('.project-link-fallback',button.parentElement);
      if(!input) { input=document.createElement('input');input.className='project-link-fallback';input.readOnly=true;input.setAttribute('aria-label','Lien du projet à copier');button.parentElement.append(input); }
      input.value=url.href;input.focus();input.select();toast('Lien sélectionné. Utilisez la commande Copier.');
    }
  });
});
$$('[data-project-contact]').forEach(link => link.addEventListener('click',()=>{
  const field=$('#message');
  if(!field.value.trim()) field.value=`Bonjour Julien,\n\nJe souhaite échanger avec vous au sujet du projet ${link.dataset.projectContact}.\n`;
  requestAnimationFrame(()=>$('#sender').focus({preventScroll:true}));
}));

/* A decorative desktop preview. Original illustrations stay in each HTML sheet.
   Pointer and keyboard share the same preview; touching a row opens its sheet. */
const preview=$('.project-preview'), previewStage=$('.project-preview-stage');
if(preview && previewStage) {
  let previewed=null;
  function showProjectPreview(card) {
    if(!card || card===previewed || card.hidden) return;
    const art=$('.project-art',card), detail=$('.project-details',card);
    if(!art || !detail) return;
    previewed=card;
    const clone=art.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    previewStage.replaceChildren(clone);
    $('.preview-title',preview).textContent=detail.dataset.projectTitle;
    $('.preview-index',preview).textContent=String(projectCards.indexOf(card)+1).padStart(2,'0')+' / '+String(projectCards.length).padStart(2,'0');
    projectCards.forEach(item=>item.classList.toggle('previewing',item===card));
    previewStage.classList.remove('preview-change');
    if(!paused) requestAnimationFrame(()=>previewStage.classList.add('preview-change'));
  }
  projectCards.forEach(card=>{
    card.addEventListener('pointerenter',()=>showProjectPreview(card));
    card.addEventListener('focusin',()=>showProjectPreview(card));
    card.addEventListener('projectpreview',()=>showProjectPreview(card));
  });
  showProjectPreview(projectFromHash()?.closest('.project')||projectCards.find(card=>!card.hidden));
  preview.hidden=false;
  document.documentElement.classList.add('gallery-ready');
}

/* PDF viewing: normal file links online, a PDF Blob in the standalone file.
   Native links open the viewer directly; no asynchronous blank popup. */
const pdfViewers=$$('[data-cv-view]');
const sourcePDF=pdfViewers[0]?.getAttribute('href');
if(sourcePDF?.startsWith('data:application/pdf;base64,')) {
  try {
    const binary=atob(sourcePDF.split(',')[1]);
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    const pdfURL=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    pdfViewers.forEach(link=>link.href=pdfURL);
    // The browser retains this URL for this page's lifetime, including new tabs.
  } catch {
    pdfViewers.forEach(link=>link.addEventListener('click',e=>{
      e.preventDefault();toast('L’aperçu est indisponible. Utilisez Télécharger le PDF dans la section Contact.');
      $('#contact').scrollIntoView({behavior:paused?'instant':'smooth'});
      $('.contact-links a[download$=".pdf"]').focus({preventScroll:true});
    }));
  }
}

/* Contact uses the visitor's mail application; it never claims to send mail. */
$('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(EMAIL); toast('Adresse e-mail copiée.'); }
  catch {
    const selection=window.getSelection(), range=document.createRange();
    range.selectNodeContents($('.email-link')); selection?.removeAllRanges(); selection?.addRange(range);
    toast('Adresse sélectionnée. Utilisez la commande Copier de votre appareil.');
  }
});
['sender','message'].forEach(id => $('#'+id).addEventListener('input', e => { e.target.setCustomValidity(''); $('#form-feedback').textContent=''; }));
$('#contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const sender=$('#sender'), message=$('#message');
  sender.setCustomValidity(sender.value.trim()?'':'Indiquez votre nom.');
  message.setCustomValidity(message.value.trim()?'':'Écrivez votre message.');
  if(!e.currentTarget.reportValidity()) return;
  const subject=encodeURIComponent(`Contact portfolio — ${sender.value.trim()}`);
  const body=encodeURIComponent(`${message.value.trim()}\n\n${sender.value.trim()}`);
  window.location.href=`mailto:${EMAIL}?subject=${subject}&body=${body}`;
  $('#form-feedback').textContent='Message préparé. Confirmez son envoi dans votre messagerie. Si elle ne s’ouvre pas, utilisez l’adresse e-mail ci-contre.';
});
$('#contact-form').hidden=false;

/* Scroll state, reveals and illustration visibility. No content depends on them. */
if('IntersectionObserver' in window) {
  const revealObserver=new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }),{threshold:.06});
  if(!reduced.matches) $$('.section-heading,.project,.timeline-row,.about-profile,.about-extras').forEach(el => {
    // Already-visible content never disappears during initialisation.
    if(el.getBoundingClientRect().top>innerHeight) { el.classList.add('reveal-ready'); revealObserver.observe(el); }
  });
  const artObserver=new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view',entry.isIntersecting)));
  projectCards.forEach(card => artObserver.observe(card));
}
// Match the highlighted link to the actual reading position, even in long sections.
const sections=$$('main>section[id]'), sectionLinks=$$('#nav a');
let scrollFrame=0, activeSection='';
function updateCurrentSection() {
  scrollFrame=0;
  const active=sections.filter(section => section.getBoundingClientRect().top<=160).at(-1)||sections[0];
  if(active.id===activeSection) return;
  activeSection=active.id;
  sectionLinks.forEach(link => {
    const selected=link.hash==='#'+activeSection;
    link.classList.toggle('current',selected);
    if(selected) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleSectionUpdate() { if(!scrollFrame) scrollFrame=requestAnimationFrame(updateCurrentSection); }
window.addEventListener('scroll',scheduleSectionUpdate,{passive:true});
window.addEventListener('resize',scheduleSectionUpdate);
updateCurrentSection();

/* Canvas model. Geometry is cached; front/back strokes are batched.
   The animation loop exists only while the visible canvas needs it. */
function createNetwork() {
  const canvas=$('#globe'), ctx=canvas.getContext('2d');
  if(!ctx) return null;
  document.documentElement.classList.add('canvas-ready');
  const rings=[];
  function xyz(lat,lon){const c=Math.cos(lat);return [c*Math.cos(lon),Math.sin(lat),c*Math.sin(lon)];}
  for(let lat=-75;lat<=75;lat+=15) rings.push(Array.from({length:73},(_,i)=>xyz(lat*Math.PI/180,i/72*Math.PI*2)));
  for(let lon=0;lon<18;lon++) rings.push(Array.from({length:49},(_,i)=>xyz(-Math.PI/2+i/48*Math.PI,lon/18*Math.PI*2)));
  const nodes=[xyz(-.26,.25),xyz(.52,1.45),xyz(-.56,2.4),xyz(.1,3.7),xyz(.65,4.8),xyz(-.8,5.3),xyz(.03,5.75)];
  let width=0,height=0,rotation=.35,pointerX=0,pointerY=0,inView=true,frameId=0,last=0,accent='#b0df91';
  const project=(p,a,b,r) => {
    const x=p[0]*a.cos-p[2]*a.sin, z=p[0]*a.sin+p[2]*a.cos;
    return {x:width/2+x*r,y:height/2+(p[1]*b.cos-z*b.sin)*r,z:p[1]*b.sin+z*b.cos};
  };
  function draw() {
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const radius=Math.min(width*.36,height*.38), a={cos:Math.cos(rotation+pointerX*.26),sin:Math.sin(rotation+pointerX*.26)}, b={cos:Math.cos(-.22+pointerY*.13),sin:Math.sin(-.22+pointerY*.13)};
    const paths=rings.map(ring=>ring.map(p=>project(p,a,b,radius)));
    for(const front of [false,true]) {
      ctx.beginPath();
      paths.forEach(points=>points.forEach((p,i)=>{if(i&&((p.z>=0)===front)){ctx.moveTo(points[i-1].x,points[i-1].y);ctx.lineTo(p.x,p.y);}}));
      ctx.lineWidth=front?.75:.55;
      ctx.strokeStyle=front?'rgba(207,237,173,.43)':'rgba(123,155,135,.14)';ctx.stroke();
    }
    ctx.save();ctx.translate(width/2,height/2);ctx.rotate(-.47);ctx.beginPath();ctx.ellipse(0,0,radius*1.22,radius*.42,0,0,Math.PI*2);ctx.strokeStyle='rgba(190,220,176,.2)';ctx.lineWidth=.7;ctx.stroke();ctx.restore();
    nodes.forEach((p,i)=>{const point=project(p,a,b,radius);if(point.z<-.1)return;ctx.beginPath();ctx.arc(point.x,point.y,3,0,Math.PI*2);ctx.fillStyle=i%3===1?'#86c9ad':accent;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=11;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(point.x,point.y,8,0,Math.PI*2);ctx.strokeStyle='rgba(211,243,170,.24)';ctx.stroke();});
  }
  function suspend(){if(frameId)cancelAnimationFrame(frameId);frameId=0;last=0;}
  function shouldRun(){return !paused&&inView&&!document.hidden&&!document.documentElement.classList.contains('intro-active');}
  function tick(time){frameId=0;if(!shouldRun())return;if(!last||time-last>=32){rotation+=.00011*(last?Math.min(time-last,65):32);draw();last=time;}frameId=requestAnimationFrame(tick);}
  function sync(){suspend();draw();if(shouldRun())frameId=requestAnimationFrame(tick);}
  function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  canvas.addEventListener('pointermove',e=>{if(paused)return;const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;});
  canvas.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(canvas);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(canvas);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',suspend);
  window.addEventListener('pageshow',sync);
  resize();sync();
  return {sync,suspend,setDomain(key){accent=key==='reseaux'?'#86c9ad':'#b0df91';rotation+=.13;draw();}};
}
let network=createNetwork();
$$('[data-domain]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.domain,item=DOMAINS[key];
  $$('[data-domain]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $('.domain-number').textContent=item.number;
  $('#domain-title').textContent=item.title;
  $('#domain-text').textContent=item.text;
  network?.setDomain(key);
}));
function updateMotion() {
  if(paused) entrance?.finish();
  document.documentElement.classList.toggle('motion-off',paused);
  $('#motion-toggle').setAttribute('aria-pressed',String(paused));
  $('#motion-toggle').setAttribute('aria-label',paused?'Reprendre les animations':'Mettre les animations en pause');
  $('#motion-toggle>span:first-child').textContent=paused?'▷':'Ⅱ';
  $('.motion-label').textContent=paused?'Reprendre':'Pause';
  network?.sync();
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;updateMotion();});
reduced.addEventListener('change',e=>{paused=e.matches;updateMotion();});
updateMotion();

/* Entrance choreography: decorative, optional, and never a loading gate. */
function createEntrance() {
  const surface = $('#site-intro');
  const navigation = window.performance?.getEntriesByType?.('navigation')?.[0];
  if (!surface || reduced.matches || paused || location.hash || window.scrollY > 0 ||
      document.hidden || navigation?.type === 'back_forward' ||
      getComputedStyle(surface).getPropertyValue('--intro-ready').trim() !== '1') return null;

  let running = true;
  let timer;
  const listeners = [];
  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  }
  function finish() {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    listeners.splice(0).forEach(remove => remove());
    const focusWasInside = surface.contains(document.activeElement);
    surface.hidden = true;
    document.documentElement.classList.remove('intro-active');
    if (focusWasInside) $('#main').focus({preventScroll: true});
    network?.sync();
  }

  // The header stays available. A first interaction immediately restores the page,
  // without preventing its default action or changing the scroll/focus position.
  ['pointerdown', 'keydown', 'focusin', 'wheel', 'touchstart'].forEach(event => {
    listen(document, event, finish, {capture: true, passive: true});
  });
  ['scroll', 'resize', 'hashchange', 'pagehide'].forEach(event => {
    listen(window, event, finish, {passive: true});
  });
  listen(window, 'pageshow', event => { if (event.persisted) finish(); });
  listen(document, 'visibilitychange', () => { if (document.hidden) finish(); });
  listen(reduced, 'change', event => { if (event.matches) finish(); });
  listen($('.intro-skip', surface), 'click', finish);
  listen(surface, 'animationend', event => {
    if (event.target === surface && event.animationName === 'portfolio-intro-exit') finish();
  });
  listen(surface, 'animationcancel', event => { if (event.target === surface) finish(); });

  surface.style.setProperty('--intro-top', Math.max(0, $('.header').getBoundingClientRect().bottom) + 'px');
  // Keep one typeface for the whole sequence, even if a web font arrives midway.
  const displayReady = document.fonts?.check('700 16px Unbounded', 'SYSTEMES RESEAUX CYBER');
  surface.style.setProperty('--intro-display', displayReady ? "'Unbounded', Arial, sans-serif" : "'Arial Black', Arial, sans-serif");
  document.documentElement.classList.add('intro-active');
  surface.hidden = false;
  network?.suspend();
  // CSS also hides the surface at its last frame. This independent timeout
  // releases it if the animation-end event is dropped or styles are changed.
  timer = setTimeout(finish, 5100);
  return {finish};
}
entrance = createEntrance();
