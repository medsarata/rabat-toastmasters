(function(){
// YouTube : chargement au clic (plus léger, pas de cookies avant lecture)
document.querySelectorAll('.yt').forEach(b=>b.addEventListener('click',()=>{
  const f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';
  f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;f.title='YouTube';
  b.replaceWith(f)}));
// une seule vidéo à la fois
document.querySelectorAll('.vid video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('.vid video').forEach(o=>{if(o!==v)o.pause()})));
// vidéos : défilement horizontal avec flèches
const row=document.getElementById('vid-row');
if(row){const ar=[...document.querySelectorAll('.vid-arrow')],AL={fr:['Précédent','Suivant'],en:['Previous','Next'],ar:['السابق','التالي']};
  const upd=()=>{const max=row.scrollWidth-row.clientWidth-2,x=Math.abs(row.scrollLeft);ar.forEach(b=>{b.disabled=+b.dataset.dir<0?x<=2:x>=max})};
  ar.forEach(b=>b.addEventListener('click',()=>row.scrollBy({left:(+b.dataset.dir)*(document.documentElement.dir==='rtl'?-1:1)*Math.max(280,row.clientWidth*.8),behavior:'smooth'})));
  row.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
  document.addEventListener('langchange',e=>{const l=AL[e.detail]||AL.fr;ar.forEach((b,i)=>b.setAttribute('aria-label',l[i]));row.scrollLeft=0;upd()});upd()}
// témoignages
const g=document.getElementById('te-grid'),D=window.RTC_TEMOIGNAGES||[];
const U={fr:{h:"Vous êtes membre ?",p:"Partagez votre expérience : votre témoignage apparaîtra ici.",b:"Envoyer mon témoignage"},
en:{h:"Are you a member?",p:"Share your experience: your testimonial will appear here.",b:"Send my testimonial"},
ar:{h:"هل أنت عضو؟",p:"شاركنا تجربتك وسيظهر رأيك هنا.",b:"أرسل شهادتي"}};
function pick(o,l){return o[l]||o.fr||o.en||o.ar||''}
function render(){if(!g)return;const l=window.RTC_LANG||'fr',u=U[l];
  g.innerHTML=D.map(t=>`<figure class="te reveal in"><svg class="qm" width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M10 7H6a3 3 0 0 0-3 3v4h5v5l2-5V7zm11 0h-4a3 3 0 0 0-3 3v4h5v5l2-5V7z"/></svg><blockquote>${pick(t.texte,l)}</blockquote><figcaption>${t.photo?`<img src="${t.photo}" alt="">`:''}<span><b>${t.nom}</b><small>${pick(t.role,l)}</small></span></figcaption></figure>`).join('')+
  `<div class="te te-cta reveal in"><h4>${u.h}</h4><p>${u.p}</p><a class="btn btn-primary" href="https://wa.me/212772182258?text=${encodeURIComponent('Bonjour, voici mon témoignage pour le site du Rabat Toastmasters Club : ')}" target="_blank" rel="noopener">${u.b}</a></div>`}
document.addEventListener('langchange',render);render();
// présidents
const pl=document.getElementById('pres-list'),P=window.RTC_PRESIDENTS||[];
const PU={fr:"Président en exercice",en:"Current president",ar:"الرئيس الحالي"};
function ini(n){return n.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase()}
function renderP(){if(!pl)return;const l=window.RTC_LANG||'fr';
  pl.innerHTML=P.map(p=>`<div class="pres ${p.actuel?'now':''}"><div class="pa">${p.photo?`<img src="${p.photo}" alt="${p.nom}" loading="lazy">`:`<span>${ini(p.nom)}</span>`}</div><div class="py">${p.annee}</div><b>${p.nom}</b>${p.actuel?`<small class="pn">${PU[l]}</small>`:p.note?`<small>${p.note[l]||p.note.fr}</small>`:''}</div>`).join('')}
document.addEventListener('langchange',renderP);renderP();
})();
