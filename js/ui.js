

// ═══════════════════════════ CLOCK ═══════════════════════════
function tickClock(){
  const el=document.getElementById('tb-clock'); if(!el) return;
  const n=new Date();
  el.textContent=n.toLocaleDateString('en-GH',{weekday:'short',year:'numeric',month:'short',day:'numeric'})
    +'  '+n.toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
setInterval(tickClock,1000); tickClock();

// ═══════════════════════════ DARK MODE ═══════════════════════════
function toggleDark(){
  DARK=!DARK; localStorage.setItem('bt_dk',DARK?'1':'0');
  document.documentElement.setAttribute('data-theme',DARK?'dark':'light');
  const p=document.getElementById('dk-pill'); if(p) p.classList.toggle('on',DARK);
}

// ═══════════════════════════ TOAST ═══════════════════════════
function toast(msg,t='i'){
  const w=document.getElementById('toast-wrap');
  const d=document.createElement('div');
  d.className=`ti ${t}`;
  const imap={s:'check-circle',e:'alert-triangle',w:'alert-triangle',i:'bell'};
  d.innerHTML=`${ic(imap[t]||'bell',14)} ${msg}`;
  w.appendChild(d); setTimeout(()=>d.remove(),3400);
}

// ═══════════════════════════ HELPERS ═══════════════════════════
function ph(title,sub=''){return`<div class="ph"><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>`}
function sc(ico,lbl,val,ch='',cls=''){return`<div class="sc"><div class="sc-ico">${ic(ico,20)}</div><div class="sc-lbl">${lbl}</div><div class="sc-val">${val}</div>${ch?`<div class="sc-ch ${cls}">${ch}</div>`:''}</div>`}
function bDot(status){return status==='present'?'bg':status==='late'?'ba':status==='absent'?'br':'bn'}
function perfColor(s){return s>=80?'var(--accent)':s>=60?'var(--amber)':'var(--red)'}
// ═══════════════════════════ MODAL ═══════════════════════════
function openModal(title,body,actions=[]){
  document.getElementById('m-title').innerHTML=title;
  document.getElementById('m-body').innerHTML=body;
  const f=document.getElementById('m-foot');
  f.innerHTML=`<button class="btn b-ol" onclick="closeModal()">Cancel</button>`;
  actions.forEach(a=>{const b=document.createElement('button');b.className=`btn ${a.c||'b-nv'}`;b.innerHTML=a.l;b.onclick=a.fn;f.appendChild(b);});
  document.getElementById('modal-ov').classList.add('open');
}
function closeModal(){document.getElementById('modal-ov').classList.remove('open')}

