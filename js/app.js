// ═══════════════════════════ SVG ICONS ═══════════════════════════
const IP={
  grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  'trending-up':'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  package:'<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'message-square':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'bar-chart-2':'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  'credit-card':'<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  'arrow-up':'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  printer:'<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  'check-circle':'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'alert-triangle':'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  'refresh-cw':'<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  percent:'<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  gift:'<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'dollar-sign':'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  tag:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  layers:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  award:'<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'map-pin':'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  'edit-2':'<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'external-link':'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  'log-out':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
};
const ic=(n,s=16)=>`<span class="ico"><svg width="${s}" height="${s}" viewBox="0 0 24 24">${IP[n]||'<circle cx="12" cy="12" r="10"/>'}</svg></span>`;

// ═══════════════════════════ CONSTANTS ═══════════════════════════
const GHS='₵';
const fmt=v=>`${GHS}${Number(v||0).toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const today=()=>new Date().toISOString().split('T')[0];
const API='/api';

// ═══════════════════════════ STATE ═══════════════════════════
let JWT=localStorage.getItem('bt_jwt');
let CU=JSON.parse(localStorage.getItem('bt_cu')||'null');
let ROLE=null;
let DARK=localStorage.getItem('bt_dk')==='1';
if(DARK) document.documentElement.setAttribute('data-theme','dark');
let _cpUser = null;
let _cpSelectedJob = null;
// ═══════════════════════════ DB ═══════════════════════════
const DB={
  g(k){try{return JSON.parse(localStorage.getItem('bt_'+k))||null}catch{return null}},
  s(k,v){localStorage.setItem('bt_'+k,JSON.stringify(v));return v},
  push(k,v){const a=this.g(k)||[];a.push(v);return this.s(k,a)},
  upd(k,pred,patch){const a=this.g(k)||[];const i=a.findIndex(pred);if(i>=0)a[i]={...a[i],...patch};return this.s(k,a)},
};

// ═══════════════════════════ SEED ═══════════════════════════
function seed(){
  if(DB.g('seeded')) return;
  
  DB.s('employees', []);
  DB.s('costs', []);
  DB.s('revenue', []);
  DB.s('tasks', []);
  DB.s('attendance', []);
  DB.s('leaves', []);
  DB.s('advances', []);
  DB.s('promos', []);
  DB.s('complaints', []);
  DB.s('applicants', []);
  
  // Keep the configuration defaults so the app doesn't break
  DB.s('rec_stage','collecting');
  DB.s('rec_link','https://biztrack.app/apply/'+Math.random().toString(36).substr(2,9));
  DB.s('offer_link','https://biztrack.app/offer/'+Math.random().toString(36).substr(2,9));
  DB.s('company',{name:'My Business Ltd',address:'Accra, Ghana',phone:'+233 XX XXX XXXX',email:'info@mybusiness.com',web:'www.mybusiness.com',signatory:'The Director',sigTitle:'Managing Director',logo:''});
  DB.s('work_location',{lat:5.6037,lng:-0.1870,radius:500,name:'Head Office, Accra'});
  
  DB.s('seeded',true);
}
// ═══════════════════════════ AUTH ═══════════════════════════
let loginRole='employer';
function setRole(r){
  loginRole=r;
  document.querySelectorAll('.login-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&r==='employer')||(i===1&&r==='employee')));
  document.getElementById('id-lbl').textContent=r==='employer'?'Username':'Employee ID';
  document.getElementById('l-id').value=''; 
  document.getElementById('l-pw').value='';
  document.getElementById('l-hint').innerHTML=''; 
}

async function apiFetch(method, path, body){
  const opts={method,headers:{'Content-Type':'application/json','Authorization':`Bearer ${JWT}`}};
  if(body!==undefined) opts.body=JSON.stringify(body);
  const res=await fetch(`${API}${path}`,opts);
  if(!res.ok){
    const err=await res.json().catch(()=>({}));
    throw new Error(err.error||`HTTP ${res.status}`);
  }
  return res.json();
}

async function doLogin(){
  const id=document.getElementById('l-id').value.trim();
  const pw=document.getElementById('l-pw').value;
  const err=document.getElementById('l-err');
  const btn=document.getElementById('l-btn');
  err.style.display='none'; btn.textContent='Signing in…'; btn.disabled=true;

  let user=null;
  try{
    const res=await fetch(`${API}/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,password:pw,role:loginRole})});
    const data=await res.json();
    if(res.ok){JWT=data.token; user=data.user; localStorage.setItem('bt_jwt',JWT);}
    else{err.textContent=data.error||'Invalid credentials.';err.style.display='block';}
  }catch(e){err.textContent='Could not reach the server. Check your connection.';err.style.display='block';}

  if(user){CU=user; ROLE=user.role; localStorage.setItem('bt_cu',JSON.stringify(CU)); launchApp();}
  btn.textContent='Sign In'; btn.disabled=false;
}

function logout(){
  JWT=null; CU=null; ROLE=null;
  localStorage.removeItem('bt_jwt'); localStorage.removeItem('bt_cu');
  if(window._pollInterval){clearInterval(window._pollInterval);window._pollInterval=null;}
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
}

// ═══════════════════════════ LAUNCH (SUPABASE SYNC) ═══════════════════════════
async function launchApp(){
  document.getElementById('login-screen').style.display='none';
  ['applicant-portal','offer-portal'].forEach(id=>document.getElementById(id).classList.remove('open'));
  document.getElementById('app').style.display='block';

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT}`
  };

  try {
    const [uRes, tRes, aRes, cRes, rRes, lRes, adRes, prRes, cmRes, apRes, jpRes] = await Promise.all([
      fetch(`${API}/users`,              { headers: authHeaders }),
      fetch(`${API}/data/tasks`,         { headers: authHeaders }),
      fetch(`${API}/data/attendance`,    { headers: authHeaders }),
      fetch(`${API}/data/costs`,         { headers: authHeaders }),
      fetch(`${API}/data/revenue`,       { headers: authHeaders }),
      fetch(`${API}/data/leaves`,        { headers: authHeaders }),
      fetch(`${API}/data/advances`,      { headers: authHeaders }),
      fetch(`${API}/data/promos`,        { headers: authHeaders }),
      fetch(`${API}/data/complaints`,    { headers: authHeaders }),
      fetch(`${API}/data/applicants`,    { headers: authHeaders }),
      fetch(`${API}/data/job_postings`,  { headers: authHeaders }), // ADD THIS LINE
    ]);

    // ... (keep the existing 'if' statements below it, and add this at the end) ...
    if (apRes.ok) DB.s('applicants', (await apRes.json()).records || []);
    if (jpRes.ok) DB.s('job_postings', (await jpRes.json()).records || []); // ADD THIS LINE

    if (uRes.ok) {
  const freshUsers = (await uRes.json()).users || [];
  DB.s('employees', freshUsers);
} else if (uRes.status === 403) {
  // Employee — fetch only their own record
  try {
    const meRes = await fetch(`${API}/users/me`, { headers: authHeaders });
    if (meRes.ok) {
      const me = (await meRes.json()).user;
      if (me) {
        const emps = DB.g('employees') || [];
        const idx = emps.findIndex(e => e.id === me.id);
        if (idx >= 0) emps[idx] = me;
        else emps.push(me);
        DB.s('employees', emps);
        // Also update CU with fresh data
        CU = {...CU, ...me};
        localStorage.setItem('bt_cu', JSON.stringify(CU));
      }
    }
  } catch(e) { console.warn('Could not fetch own profile on launch', e); }
}
    if (tRes.ok)  DB.s('tasks',      (await tRes.json()).records  || []);
    if (aRes.ok)  DB.s('attendance', (await aRes.json()).records  || []);
    if (cRes.ok)  DB.s('costs',      (await cRes.json()).records  || []);
    if (rRes.ok)  DB.s('revenue',    (await rRes.json()).records  || []);
    if (lRes.ok)  DB.s('leaves',     (await lRes.json()).records  || []);
    if (adRes.ok) DB.s('advances',   (await adRes.json()).records || []);
    if (prRes.ok) DB.s('promos',     (await prRes.json()).records || []);
    if (cmRes.ok) DB.s('complaints', (await cmRes.json()).records || []);
    if (apRes.ok) DB.s('applicants', (await apRes.json()).records || []);
    const stRes = await fetch(`${API}/settings`, { headers: authHeaders });
    if (stRes.ok) DB.s('att_settings', (await stRes.json()).settings || {});
    if(window._pollInterval) clearInterval(window._pollInterval);
window._pollInterval = setInterval(async()=>{
  if(!JWT) return;
  const h={'Authorization':`Bearer ${JWT}`};
  try{
    const [uRes, tRes, aRes, lRes, adRes, prRes, cmRes, apRes, cRes, rRes, jpRes] = await Promise.all([
      fetch(`${API}/users`,             {headers:h}),
      fetch(`${API}/data/tasks`,        {headers:h}),
      fetch(`${API}/data/attendance`,   {headers:h}),
      fetch(`${API}/data/leaves`,       {headers:h}),
      fetch(`${API}/data/advances`,     {headers:h}),
      fetch(`${API}/data/promos`,       {headers:h}),
      fetch(`${API}/data/complaints`,   {headers:h}),
      fetch(`${API}/data/applicants`,   {headers:h}),
      fetch(`${API}/data/costs`,        {headers:h}),
      fetch(`${API}/data/revenue`,      {headers:h}),
      fetch(`${API}/data/job_postings`, {headers:h}), // ADD THIS LINE
    ]);

    // ... (keep the existing 'if' statements below it, and add this at the end) ...
    if(cRes.ok) DB.s('costs',   (await cRes.json()).records ||[]);
    if(rRes.ok) DB.s('revenue', (await rRes.json()).records ||[]);
    if(jpRes.ok) DB.s('job_postings', (await jpRes.json()).records ||[]); // ADD THIS LINE
    if(uRes.ok){
  const freshUsers = (await uRes.json()).users || [];
  DB.s('employees', freshUsers);
  const updatedMe = freshUsers.find(e => e.id === CU?.id);
  if(updatedMe){
    CU = {...CU, ...updatedMe};
    localStorage.setItem('bt_cu', JSON.stringify(CU));
    document.getElementById('sb-nm').textContent = CU.name;
    document.getElementById('sb-av').textContent = CU.initials || CU.name.slice(0,2).toUpperCase();
  }
} else if(uRes.status === 403) {
  try {
    const meRes = await fetch(`${API}/users/me`, {headers: h});
    if(meRes.ok){
      const updatedMe = (await meRes.json()).user;
      if(updatedMe){
        CU = {...CU, ...updatedMe};
        localStorage.setItem('bt_cu', JSON.stringify(CU));
        const emps = DB.g('employees') || [];
        const idx = emps.findIndex(e => e.id === CU.id);
        if(idx >= 0) emps[idx] = {...emps[idx], ...updatedMe};
        else emps.push(updatedMe);
        DB.s('employees', emps);
        document.getElementById('sb-nm').textContent = CU.name;
        document.getElementById('sb-av').textContent = CU.initials || CU.name.slice(0,2).toUpperCase();
      }
    }
  } catch(e){ console.warn('Could not fetch own profile', e); }
}   
    if(tRes.ok)  DB.s('tasks',      (await tRes.json()).records  ||[]);
    if(aRes.ok)  DB.s('attendance', (await aRes.json()).records  ||[]);
    if(lRes.ok)  DB.s('leaves',     (await lRes.json()).records  ||[]);
    if(adRes.ok) DB.s('advances',   (await adRes.json()).records ||[]);
    if(prRes.ok) DB.s('promos',     (await prRes.json()).records ||[]);
    if(cmRes.ok) DB.s('complaints', (await cmRes.json()).records ||[]);
    if(apRes.ok) DB.s('applicants', (await apRes.json()).records ||[]);
    if(cRes.ok) DB.s('costs',   (await cRes.json()).records ||[]);
    if(rRes.ok) DB.s('revenue', (await rRes.json()).records ||[]);
    
    // 👇 Replace the old showPage call with this:
    const cur=document.querySelector('.nav-item.active');
    if(cur && cur.dataset.page) {
      // Check if the user is actively typing in a form
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
      
      // Only refresh the page silently if they aren't typing
      if (!isTyping) {
        showPage(cur.dataset.page, true, true);
      }
    }
    
    updNotif();
  }catch(e){console.warn('Poll failed',e);}
},5000);
  }
  catch(e) {
    console.error('Failed to sync with Supabase', e);
  }

  ROLE=CU.role;
  document.getElementById('sb-nm').textContent=CU.name;
  document.getElementById('sb-em').textContent=CU.email||CU.id||'';
  document.getElementById('sb-av').textContent=CU.initials||CU.name.slice(0,2).toUpperCase();
  document.getElementById('sb-role').textContent=ROLE==='employer'?'Employer Portal':'Employee Portal';
  document.getElementById('yr').textContent=new Date().getFullYear();
  const p=document.getElementById('dk-pill'); if(p) p.classList.toggle('on',DARK);
  buildNav(); showPage(ROLE==='employer'?'e_dash':'emp_dash'); updNotif();
} 
  // ═══════════════════════════ NAV ═══════════════════════════
const EMP_NAV=[
  {s:'MAIN',items:[{id:'e_dash',ic:'grid',l:'Dashboard'},{id:'notifications',ic:'bell',l:'Notifications'}]},
  {s:'BUSINESS',items:[{id:'e_finance',ic:'dollar-sign',l:'Finance & Revenue'},{id:'e_performance',ic:'trending-up',l:'Performance'},{id:'e_attendance_mgr',ic:'clock',l:'Attendance'}]},
  {s:'PEOPLE',items:[{id:'e_employees',ic:'users',l:'Employees'},{id:'e_recruitment',ic:'search',l:'Recruitment'},{id:'e_leaves',ic:'calendar',l:'Leave Management'},{id:'e_benefits',ic:'gift',l:'Benefits'},{id:'e_complaints',ic:'message-square',l:'Complaints'}]},
  {s:'SYSTEM',items:[{id:'e_settings',ic:'settings',l:'Settings'}]},
];
const EE_NAV=[
  {s:'MAIN',items:[{id:'emp_dash',ic:'home',l:'My Dashboard'},{id:'notifications',ic:'bell',l:'Notifications'}]},
  {s:'FINANCE',items:[{id:'emp_finance',ic:'dollar-sign',l:'My Finance'},{id:'emp_advance',ic:'credit-card',l:'Request Advance'},{id:'emp_promo',ic:'arrow-up',l:'Request Promotion'}]},
  {s:'WORK',items:[{id:'emp_attendance',ic:'clock',l:'Attendance'},{id:'emp_tasks',ic:'check-square',l:'My Tasks'},{id:'emp_leave',ic:'calendar',l:'Request Leave'},{id:'emp_complaints',ic:'message-square',l:'Complaints'}]},
  {s:'PROFILE',items:[{id:'emp_profile',ic:'user',l:'My Profile'}]},
];
const PT={
  e_dash:'Dashboard',notifications:'Notifications',e_finance:'Finance & Revenue',
  e_performance:'Performance',e_attendance_mgr:'Attendance Management',
  e_employees:'Employees',e_recruitment:'Recruitment',
  e_leaves:'Leave Management',e_benefits:'Benefits',e_complaints:'Complaints & Suggestions',
  e_settings:'Settings',emp_dash:'My Dashboard',emp_finance:'My Finance',
  emp_advance:'Salary Advance',emp_promo:'Promotion Request',emp_attendance:'Attendance',
  emp_tasks:'My Tasks',emp_leave:'Leave Request',emp_complaints:'Complaints',emp_profile:'My Profile',
};
function buildNav(){
  const nav=document.getElementById('sidebar-nav');
  nav.innerHTML=(ROLE==='employer'?EMP_NAV:EE_NAV).map(s=>`
    <div class="nav-sec">${s.s}</div>
    ${s.items.map(it=>`<div class="nav-item" data-page="${it.id}" id="n-${it.id}" onclick="showPage('${it.id}')">${ic(it.ic,16)}<span>${it.l}</span></div>`).join('')}
  `).join('');
}
function showPage(pid, skipHistory = false, isPoll = false){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav=document.getElementById('n-'+pid); if(nav) nav.classList.add('active');
  document.getElementById('tb-title').textContent=PT[pid]||'BizTrack';
  
  const mc=document.getElementById('mc');
  let pg=document.getElementById('pg');
  
  // Only rebuild the container (which triggers the fade-in animation) if it's NOT a poll
  if (!isPoll || !pg) {
    mc.innerHTML='<div class="page active" id="pg"></div>';
    pg=document.getElementById('pg');
  }
  
  const R={
    e_dash:pEDash,notifications:pNotifications,e_finance:pFinance,
    e_performance:pPerformance,e_attendance_mgr:pAttMgr,
    e_employees:pEmployees,e_recruitment:pRecruitment,e_leaves:pLeaves,
    e_benefits:pBenefits,e_complaints:pComplaints,e_settings:pSettings,
    emp_dash:pEmpDash,emp_finance:pEmpFinance,emp_advance:pAdvance,
    emp_promo:pPromo,emp_attendance:pMyAtt,emp_tasks:pMyTasks,
    emp_leave:pMyLeave,emp_complaints:pMyComplaints,emp_profile:pProfile,
  };
  if(R[pid]) R[pid](pg); else pg.innerHTML='<p style="color:var(--text-muted)">Page not found.</p>';
  
  if (!skipHistory && !isPoll) {
    history.pushState({ page: pid }, '', '#' + pid);
  }

  // Auto-close mobile menu after selecting a page
  if (window.innerWidth <= 768 && !isPoll) {
    document.querySelector('.sidebar').classList.remove('mobile-open');
    document.getElementById('mobile-overlay').classList.remove('active');
  }
}
function updNotif(){
  let cnt=0;
  if(ROLE==='employer'){
    cnt=(DB.g('advances')||[]).filter(a=>a.status==='pending').length
      +(DB.g('leaves')||[]).filter(l=>l.status==='pending').length
      +(DB.g('promos')||[]).filter(p=>p.status==='pending').length
      +(DB.g('applicants')||[]).filter(a=>a.offerStatus==='negotiated').length;
  } else if(ROLE==='employee'&&CU){
    cnt=(DB.g('tasks')||[]).filter(t=>t.empId===CU.id&&t.status==='pending').length
      +(DB.g('leaves')||[]).filter(l=>l.empId===CU.id&&(l.status==='approved'||l.status==='rejected')&&!l.empAccepted&&l.status!=='declined').length
      +(DB.g('advances')||[]).filter(a=>a.empId===CU.id&&(a.status==='approved'||a.status==='rejected')).length
      +(DB.g('promos')||[]).filter(p=>p.empId===CU.id&&(p.status==='approved'||p.status==='rejected')).length;
  }
  const d=document.getElementById('nb-dot'); if(d) d.style.display=cnt>0?'block':'none';
}

// ═══════════════════════════════════════════════
// ══════════ INIT ══════════════════════════════
// ═══════════════════════════════════════════════
seed();
document.getElementById('yr').textContent=new Date().getFullYear();

// Resume session if JWT and user are stored
if(JWT&&CU){
  ROLE=CU.role;
  launchApp();
}

// Offer portal link support (e.g. ?offer=email@test.com)
const params=new URLSearchParams(window.location.search);
if(params.get('offer')){
  const email=params.get('offer');
  loadOfferPortal(email);
  document.getElementById('offer-portal').classList.add('open');
}

// Listen for Back/Forward button clicks
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    // The 'true' stops it from infinitely looping the history
    showPage(event.state.page, true); 
  }
});

function toggleMobileMenu() {
  document.querySelector('.sidebar').classList.toggle('mobile-open');
  document.getElementById('mobile-overlay').classList.toggle('active');
}
