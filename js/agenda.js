(function(){
const G=window.RTC_AGENDA,box=document.getElementById('agenda-list');if(!G)return;
const loc={fr:'fr-FR',en:'en-GB',ar:'ar-MA'};
const U={fr:{next:"Prochaine réunion",past:"Passée",cal:"Ajouter à mon agenda",at:"à",today:"Aujourd'hui"},
en:{next:"Next meeting",past:"Past",cal:"Add to calendar",at:"at",today:"Today"},
ar:{next:"اللقاء القادم",past:"انتهى",cal:"أضف إلى التقويم",at:"على الساعة",today:"اليوم"}};
const [hh,mm]=G.time.split(':').map(Number);
const all=[];G.cycles.forEach(c=>c.sessions.forEach(s=>{const d=new Date(s.date+'T00:00:00');d.setHours(hh,mm);s._d=d;s._c=c;all.push(s)}));
const now=new Date();const next=all.find(s=>s._d.getTime()+2*3600e3>now);
function fmt(d,l,o){return new Intl.DateTimeFormat(loc[l],o).format(d)}
function tstr(l){return l==='en'?fmt(all[0]._d,'en',{hour:'numeric',minute:'2-digit'}):l==='ar'?G.time:G.time.replace(':','h')}
function gcal(s){const p=n=>String(n).padStart(2,'0'),d=s._d,e=new Date(d.getTime()+2*3600e3);
 const f=x=>`${x.getFullYear()}${p(x.getMonth()+1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
 return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('Rabat Toastmasters – '+s.theme)+'&dates='+f(d)+'/'+f(e)+'&ctz=Africa/Casablanca&location='+encodeURIComponent('Centre culturel Iklyle, Av. Allal Al Fassi, Rabat')+'&details='+encodeURIComponent(s.obj.fr+' · https://rabat-toastmasters.netlify.app')}
function render(){
 const l=window.RTC_LANG||'fr',u=U[l];
 box.innerHTML=G.cycles.map(c=>{const m=new Date(c.month+'-01T12:00:00');
  return `<article class="cycle reveal in"><div class="cy-head"><span class="cy-ico">${c.icon}</span><div><div class="cy-m">${fmt(m,l,{month:'long',year:'numeric'})}</div><h3>${c.title}</h3></div></div><p class="cy-g">${c.goal[l]}</p><ol>`+
  c.sessions.map(s=>{const past=s._d.getTime()+2*3600e3<now,isN=s===next;
   return `<li class="${past?'past':''} ${isN?'next':''}"><div class="sd"><b>${fmt(s._d,l,{day:'numeric'})}</b><span>${fmt(s._d,l,{month:'short'})}</span></div><div class="si">${isN?`<span class="tag">${u.next}</span>`:past?`<span class="tag t-past">${u.past}</span>`:''}<h4>${s.theme}</h4><p>${s.obj[l]}</p>${isN?`<a class="cal" href="${gcal(s)}" target="_blank" rel="noopener">＋ ${u.cal}</a>`:''}</div></li>`}).join('')+`</ol></article>`}).join('');
 document.getElementById('agenda-room').textContent=G.room[l]+' · '+tstr(l);
 if(next){const isToday=next._d.toDateString()===now.toDateString();
  document.getElementById('next-t').textContent=u.next;
  document.getElementById('next-big').textContent=(isToday?u.today:fmt(next._d,l,{weekday:'long',day:'numeric',month:'long'}))+' · '+tstr(l);
  document.getElementById('next-sub').innerHTML='<bdi>“'+next.theme+'”</bdi> — '+next.obj[l];}
}
document.addEventListener('langchange',render);render();
})();
