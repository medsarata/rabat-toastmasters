(function(){
const f=document.getElementById('guest-form');if(!f)return;
const sel=document.getElementById('f-session'),G=window.RTC_AGENDA;
const loc={fr:'fr-FR',en:'en-GB',ar:'ar-MA'};
const U={fr:{unsure:"Je ne sais pas encore",send:"Envoi en cours…"},en:{unsure:"Not sure yet",send:"Sending…"},ar:{unsure:"لم أحدد بعد",send:"جارٍ الإرسال…"}};
function fill(){
  const l=window.RTC_LANG||'fr',keep=sel.value,now=Date.now();
  [...sel.options].slice(1).forEach(o=>o.remove());
  if(G)G.cycles.forEach(c=>c.sessions.forEach(s=>{const d=new Date(s.date+'T'+G.time+':00');if(d.getTime()+2*3600e3<now)return;
    const o=document.createElement('option');o.value=s.date+' – '+s.theme;
    o.textContent=new Intl.DateTimeFormat(loc[l],{weekday:'short',day:'numeric',month:'long'}).format(d)+' — '+s.theme;sel.appendChild(o)}));
  const o=document.createElement('option');o.value='Pas encore décidé';o.textContent=U[l].unsure;sel.appendChild(o);
  if(keep)sel.value=keep;
  document.getElementById('f-sitelang').value=l;
}
document.addEventListener('langchange',fill);fill();
f.addEventListener('submit',async e=>{
  e.preventDefault();const b=document.getElementById('f-btn'),err=document.getElementById('f-err'),t=b.textContent;
  err.hidden=true;b.disabled=true;b.textContent=U[window.RTC_LANG||'fr'].send;
  try{const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()});
    if(!r.ok)throw 0;f.hidden=true;const ok=document.getElementById('f-ok');ok.hidden=false;ok.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(_){err.hidden=false;b.disabled=false;b.textContent=t}
});
})();
