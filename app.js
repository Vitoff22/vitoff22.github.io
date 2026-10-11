'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const projects = {
 vinci:{title:'VINCI-INDUS',date:'03 / 2026',description:'Mise en place d’une infrastructure réseau et système complète (AD, DNS, DHCP, GPO, VLAN, serveur web).',tags:['Active Directory','DNS','DHCP','GPO','VLAN','Serveur web'],detail:'Un projet académique consacré à l’infrastructure : services d’annuaire, résolution de noms, attribution d’adresses, stratégies de groupe, réseaux virtuels et serveur web.'},
 gymshark:{title:'Gymshark Sync',date:'04 / 2026',description:'Développement d’un site internet avec NodeJS et intégration d’un assistant IA.',tags:['NodeJS','Site internet','Assistant IA'],detail:'Un projet académique à la croisée du développement web et de l’intelligence artificielle, avec un assistant intégré au site.'},
 python:{title:'Python + MongoDB',date:'02 / 2026',description:'Création d’un jeu en ligne avec base de données et gestion de scores.',tags:['Python','MongoDB','Jeu en ligne','Gestion de scores'],detail:'Un projet académique qui associe un jeu en ligne à une base de données et à la gestion des scores.'},
 flutter:{title:'FlutterFlow',date:'05 / 2026',description:'Application mobile de diagnostic végétal avec IA.',tags:['FlutterFlow','Application mobile','Diagnostic végétal','IA'],detail:'Un projet académique d’application mobile consacré au diagnostic végétal grâce à l’intelligence artificielle.'}
};
const skills = {
 systemes:{title:'Systèmes & réseaux',description:'Administration systèmes et réseaux.',tech:['Windows Server','Linux','Cisco'],symbol:'⌘',note:'À explorer dans le projet VINCI-INDUS.'},
 virtualisation:{title:'Virtualisation',description:'Des environnements virtuels pour travailler sur les systèmes.',tech:['VMware','VirtualBox'],symbol:'▱',note:'Technologies de virtualisation présentes dans mon parcours.'},
 cyber:{title:'Cybersécurité',description:'Notions de cybersécurité : sécurisation et analyse de vulnérabilités.',tech:['Sécurisation','Analyse de vulnérabilités','Veille technologique'],symbol:'◎',note:'Un domaine au cœur de ma formation et de mes centres d’intérêt.'},
 dev:{title:'Développement',description:'Des langages pour créer des applications, des sites et des projets.',tech:['Python','PHP','HTML / CSS','JavaScript'],symbol:'⌥',note:'À explorer dans mes projets web, mobile et jeu en ligne.'},
 auto:{title:'Automatisation',description:'Des outils de script et d’automatisation.',tech:['PowerShell','VBA','Make'],symbol:'↻',note:'L’automatisation fait partie de ma boîte à outils technique.'}
};
function addTags(el, tags){el.replaceChildren(...tags.map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));}
const menu=$('.menu'), nav=$('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Ouvrir le menu');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
$$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$$('.filters button').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;let count=0;
 $$('.filters button').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $$('.project').forEach(p=>{const show=filter==='all'||p.dataset.category.split(' ').includes(filter);p.hidden=!show;if(show)count++;});
 $('#project-count').textContent=`${count} projet${count>1?'s':''}`;
}));
const dialog=$('#project-dialog');let currentProject='vinci';let opener=null;
function displayProject(key){currentProject=key;const p=projects[key];$('#dialog-title').textContent=p.title;$('#dialog-meta').textContent=`PROJET ACADÉMIQUE · ${p.date}`;$('#dialog-description').textContent=p.description;$('#dialog-detail').textContent=p.detail;addTags($('#dialog-tags'),p.tags);dialog.scrollTop=0;}
$$('[data-project]').forEach(b=>b.addEventListener('click',()=>{opener=b;displayProject(b.dataset.project);dialog.showModal();document.body.style.overflow='hidden';$('#close-dialog').focus();}));
function closeDialog(){dialog.close();}
$('#close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('close',()=>{document.body.style.overflow='';if(opener)opener.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
$('#next-project').addEventListener('click',()=>{const keys=Object.keys(projects);displayProject(keys[(keys.indexOf(currentProject)+1)%keys.length]);$('#dialog-title').setAttribute('tabindex','-1');$('#dialog-title').focus({preventScroll:true});});
$('#dialog-contact').addEventListener('click',()=>{closeDialog();setTimeout(()=>$('#sender').focus({preventScroll:true}),100);});
function selectSkill(button){const s=skills[button.dataset.skill];$$('[data-skill]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});$('#skill-panel').setAttribute('aria-labelledby',button.id);$('#skill-title').textContent=s.title;$('#skill-description').textContent=s.description;$('.panel-symbol').textContent=s.symbol;$('#skill-note').textContent=s.note;addTags($('#skill-tech'),s.tech);}
$$('[data-skill]').forEach((b,i,all)=>{b.addEventListener('click',()=>selectSkill(b));b.addEventListener('keydown',e=>{let index=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')index=(i+1)%all.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')index=(i-1+all.length)%all.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=all.length-1;else return;e.preventDefault();selectSkill(all[index]);all[index].focus();});});
let toastTimer;function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4500);}
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('julien.fretille@gmail.com');toast('Adresse e-mail copiée.');}catch{const selection=window.getSelection();const range=document.createRange();range.selectNodeContents($('.email-link'));selection.removeAllRanges();selection.addRange(range);toast('Adresse sélectionnée : utilisez Copier sur votre appareil.');}});
$('#contact-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const name=$('#sender').value.trim(),message=$('#message').value.trim();if(!name||!message){toast('Merci de renseigner votre nom et votre message.');return;}const subject=encodeURIComponent(`Contact portfolio — ${name}`),body=encodeURIComponent(`${message}\n\n${name}`);window.location.href=`mailto:julien.fretille@gmail.com?subject=${subject}&body=${body}`;toast('E-mail préparé. Finalisez l’envoi dans votre messagerie.');});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.section-heading,.project,.timeline-row,.about-profile,.about-extras,.watch').forEach(el=>{el.classList.add('reveal');observer.observe(el);});const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('#nav a').forEach(a=>{const active=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('current',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -55% 0px'});$$('main section[id]').forEach(s=>sectionObserver.observe(s));}

// An original, pointer-responsive wireframe sphere. It illustrates connections,
// rather than presenting live infrastructure or fabricated project telemetry.
const canvas=$('#globe'),ctx=canvas.getContext('2d');
let width=0,height=0,rotation=.35,tilt=-.22,pointerX=0,pointerY=0,paused=reduced.matches,visible=true,last=0;
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function point(lat,lon,rad=1){const c=Math.cos(lat);let x=c*Math.cos(lon),y=Math.sin(lat),z=c*Math.sin(lon);const a=rotation+pointerX*.22,b=tilt+pointerY*.12;const xx=x*Math.cos(a)-z*Math.sin(a),zz=x*Math.sin(a)+z*Math.cos(a),yy=y*Math.cos(b)-zz*Math.sin(b),z2=y*Math.sin(b)+zz*Math.cos(b);const radius=Math.min(width*.355,height*.36)*rad;return {x:width/2+xx*radius,y:height/2+yy*radius,z:z2};}
function traceLine(points,color){ctx.beginPath();points.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.strokeStyle=color;ctx.lineWidth=.65;ctx.stroke();}
function draw(){if(!width||!ctx)return;ctx.clearRect(0,0,width,height);const centerX=width/2,centerY=height/2,radius=Math.min(width*.355,height*.36);
 ctx.save();ctx.translate(centerX,centerY);ctx.rotate(-.47);ctx.strokeStyle='rgba(186,217,169,.14)';ctx.lineWidth=.65;ctx.beginPath();ctx.ellipse(0,0,radius*1.23,radius*.43,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 for(let lat=-75;lat<=75;lat+=15){let front=[],back=[];for(let i=0;i<=100;i++){const p=point(lat*Math.PI/180,i/100*Math.PI*2);front.push(p);if(i>0){const q=front[i-1];traceLine([q,p],p.z>0?'rgba(207,237,173,.36)':'rgba(123,155,135,.12)');}}}
 for(let l=0;l<20;l++){const lon=l/20*Math.PI*2;let previous=null;for(let i=0;i<=65;i++){const p=point(-Math.PI/2+i/65*Math.PI,lon);if(previous)traceLine([previous,p],p.z>0?'rgba(207,237,173,.3)':'rgba(123,155,135,.1)');previous=p;}}
 const nodes=[[-.26,.25],[.52,1.45],[-.56,2.4],[.1,3.7],[.65,4.8],[-.8,5.3],[.03,5.75]];
 nodes.forEach(([lat,lon],i)=>{const p=point(lat,lon);if(p.z<-.1)return;ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,Math.PI*2);ctx.fillStyle=i%3===1?'#80ccca':'#d4f57a';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=13;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.strokeStyle='rgba(211,243,170,.22)';ctx.lineWidth=.7;ctx.stroke();});
 ctx.fillStyle='rgba(188,210,190,.4)';ctx.font='9px Manrope, Arial';ctx.fillText('+',centerX-radius*1.25,centerY+radius*.8);ctx.fillText('+',centerX+radius*1.18,centerY-radius*.7);
}
function frame(time){if(!paused&&visible&&!document.hidden&&time-last>32){rotation+=.0038;draw();last=time;}requestAnimationFrame(frame);}
canvas.addEventListener('pointermove',e=>{if(paused)return;const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;});
canvas.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
const motionToggle=$('#motion-toggle');function updateMotion(){document.body.classList.toggle('motion-off',paused);motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.setAttribute('aria-label',paused?'Reprendre les animations':'Mettre les animations en pause');motionToggle.textContent=paused?'▷':'Ⅱ';draw();}
motionToggle.addEventListener('click',()=>{paused=!paused;updateMotion();});reduced.addEventListener('change',e=>{paused=e.matches;updateMotion();});
new ResizeObserver(resize).observe(canvas);if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;}).observe(canvas);updateMotion();requestAnimationFrame(frame);
