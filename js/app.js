// ═══════════════════════════ STATE ═══════════════════════════
let JWT=localStorage.getItem('bt_jwt');
let CU=JSON.parse(localStorage.getItem('bt_cu')||'null');
let ROLE=null;
let DARK=localStorage.getItem('bt_dk')==='1';
if(DARK) document.documentElement.setAttribute('data-theme','dark');
let _cpUser=null;
let _cpSelectedJob=null;

// ═══════════════════════════ SEED ═══════════════════════════
function seed(){
  if(DB.g('seeded')) return;
  DB.s('employees',[]);
  DB.s('costs',[]);
  DB.s('revenue',[]);
  DB.s('tasks',[]);
  DB.s('attendance',[]);
  DB.s('leaves',[]);
  DB.s('advances',[]);
  DB.s('promos',[]);
  DB.s('complaints',[]);
  DB.s('applicants',[]);
  DB.s('job_postings',[]);
  DB.s('rec_stage','collecting');
  DB.s('company',{name:'My Business Ltd',address:'Accra, Ghana',phone:'+233 XX XXX XXXX',email:'info@mybusiness.com',web:'www.mybusiness.com',signatory:'The Director',sigTitle:'Managing Director',logo:''});
  DB.s('work_location',{lat:5.6037,lng:-0.1870,radius:500,name:'Head Office, Accra'});
  DB.s('seeded',true);
}

// ═══════════════════════════ HELPERS ═══════════════════════════
async function safeJson(res){
  const text=await res.text();
  try{return JSON.parse(text);}catch{return {};}
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

async function apiFetch(method,path,body){
  const opts={method,headers:{'Content-Type':'application/json','Authorization':`Bearer ${JWT}`}};
  if(body!==undefined) opts.body=JSON.stringify(body);
  const res=await fetch(`${API}${path}`,opts);
  if(!res.ok){
    const err=await safeJson(res);
    throw new Error(err.error||`HTTP ${res.status}`);
  }
  return safeJson(res);
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
    const data=await safeJson(res);
    if(res.ok){JWT=data.token;user=data.user;localStorage.setItem('bt_jwt',JWT);}
    else{err.textContent=data.error||'Invalid credentials.';err.style.display='block';}
  }catch(e){err.textContent='Could not reach the server. Check your connection.';err.style.display='block';}
  if(user){CU=user;ROLE=user.role;localStorage.setItem('bt_cu',JSON.stringify(CU));launchApp();}
  btn.textContent='Sign In';btn.disabled=false;
}

function logout(){
  JWT=null;CU=null;ROLE=null;
  localStorage.removeItem('bt_jwt');localStorage.removeItem('bt_cu');
  if(window._pollInterval){clearInterval(window._pollInterval);window._pollInterval=null;}
  window.location.href='/';
}

// ═══════════════════════════ SYNC HELPERS ═══════════════════════════
async function syncData(headers){
  try {
    const [uRes,tRes,aRes,cRes,rRes,lRes,adRes,prRes,cmRes,apRes,jpRes,stRes]=await Promise.all([
      fetch(`${API}/users`,          {headers}),
      fetch(`${API}/data/tasks`,     {headers}),
      fetch(`${API}/data/attendance`,{headers}),
      fetch(`${API}/data/costs`,     {headers}),
      fetch(`${API}/data/revenue`,   {headers}),
      fetch(`${API}/data/leaves`,    {headers}),
      fetch(`${API}/data/advances`,  {headers}),
      fetch(`${API}/data/promos`,    {headers}),
      fetch(`${API}/data/complaints`,{headers}),
      fetch(`${API}/data/applicants`,{headers}),
      fetch(`${API}/data/job_postings`,{headers}),
      fetch(`${API}/settings`,       {headers}),
    ]);

    // Users — employer gets all, employee gets own record
    if(uRes.ok){
      const d=await safeJson(uRes);
      const freshUsers=d.users||[];
      DB.s('employees',freshUsers);
      const me=freshUsers.find(e=>e.id===CU?.id);
      if(me){CU={...CU,...me};localStorage.setItem('bt_cu',JSON.stringify(CU));}
    } else if(uRes.status===403){
      try{
        const meRes=await fetch(`${API}/users/me`,{headers});
        if(meRes.ok){
          const d=await safeJson(meRes);
          const me=d.user;
          if(me){
            const emps=DB.g('employees')||[];
            const idx=emps.findIndex(e=>e.id===me.id);
            if(idx>=0) emps[idx]=me; else emps.push(me);
            DB.s('employees',emps);
            CU={...CU,...me};
            localStorage.setItem('bt_cu',JSON.stringify(CU));
          }
        }
      }catch(e){console.warn('Could not fetch own profile',e);}
    }

    if(tRes.ok)   DB.s('tasks',       (await safeJson(tRes)).records  ||[]);
    if(aRes.ok)   DB.s('attendance',  (await safeJson(aRes)).records  ||[]);
    if(cRes.ok)   DB.s('costs',       (await safeJson(cRes)).records  ||[]);
    if(rRes.ok)   DB.s('revenue',     (await safeJson(rRes)).records  ||[]);
    if(lRes.ok)   DB.s('leaves',      (await safeJson(lRes)).records  ||[]);
    if(adRes.ok)  DB.s('advances',    (await safeJson(adRes)).records ||[]);
    if(prRes.ok)  DB.s('promos',      (await safeJson(prRes)).records ||[]);
    if(cmRes.ok)  DB.s('complaints',  (await safeJson(cmRes)).records ||[]);
    if(apRes.ok)  DB.s('applicants',  (await safeJson(apRes)).records ||[]);
    if(jpRes.ok)  DB.s('job_postings',(await safeJson(jpRes)).records ||[]);
    
    if(stRes.ok){
      const stData=await safeJson(stRes);
      const records=stData.records||[];
      // att_settings (flat keys)
      const attFields=['shift_start','shift_end','work_lat','work_lng','work_radius','work_address'];
      const attObj={};
      records.filter(r=>attFields.includes(r.key)).forEach(r=>attObj[r.key]=r.value);
      if(Object.keys(attObj).length) DB.s('att_settings',attObj);
      // company
      const co=records.find(r=>r.key==='company');
      if(co) DB.s('company',typeof co.value==='string'?JSON.parse(co.value):co.value);
      // work_location
      const wl=records.find(r=>r.key==='work_location');
      if(wl) DB.s('work_location',typeof wl.value==='string'?JSON.parse(wl.value):wl.value);
    }
  } catch (error) {
    console.error("Critical error during initial sync:", error);
  }
}


// ═══════════════════════════ LAUNCH ═══════════════════════════
async function launchApp(){
  // FIX 1: Prevent the infinite loop! Only redirect if we are on the login page.
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.location.href = '/app';
    return; 
  }

  const headers={'Content-Type':'application/json','Authorization':`Bearer ${JWT}`};

  try{
    await syncData(headers);
  }catch(e){
    console.error('Initial sync failed',e);
  }

  // Update UI with fresh CU data
  document.getElementById('sb-nm').textContent=CU.name;
  document.getElementById('sb-em').textContent=CU.email||CU.id||'';
  document.getElementById('sb-av').textContent=CU.initials||CU.name.slice(0,2).toUpperCase();
  ROLE=CU.role;
  document.getElementById('sb-role').textContent=ROLE==='employer'?'Employer Portal':'Employee Portal';
  document.getElementById('yr').textContent=new Date().getFullYear();
  const p=document.getElementById('dk-pill');if(p) p.classList.toggle('on',DARK);
  buildNav();
  
  // FIX 2: If the user refreshes on a specific page (like /e_finance), keep them there!
  const currentPath = window.location.pathname.substring(1);
  if (PT[currentPath]) {
    showPage(currentPath, true); // The 'true' stops it from pushing to history again
  } else {
    showPage(ROLE==='employer'?'e_dash':'emp_dash');
  }
  
  updNotif();

  // Start polling
  if(window._pollInterval) clearInterval(window._pollInterval);
  window._pollInterval=setInterval(async()=>{
    if(!JWT) return;
    const h={'Authorization':`Bearer ${JWT}`};
    try{
      await syncData(h);
      // Update sidebar name/avatar in case profile changed
      document.getElementById('sb-nm').textContent=CU.name;
      document.getElementById('sb-av').textContent=CU.initials||CU.name.slice(0,2).toUpperCase();
      // Silently refresh current page if user isn't typing
      const cur=document.querySelector('.nav-item.active');
      if(cur&&cur.dataset.page){
        const tag=document.activeElement?document.activeElement.tagName:'';
        const typing=tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT';
        if(!typing) showPage(cur.dataset.page,true,true);
      }
      updNotif();
    }catch(e){console.warn('Poll failed',e);}
  },5000);
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

function showPage(pid,skipHistory=false,isPoll=false){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav=document.getElementById('n-'+pid);if(nav) nav.classList.add('active');
  document.getElementById('tb-title').textContent=PT[pid]||'BizTrack';
  const mc=document.getElementById('mc');
  let pg=document.getElementById('pg');
  if(!isPoll||!pg){
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
  if(!skipHistory&&!isPoll) history.pushState({page:pid},'','/'+pid);
  if(window.innerWidth<=768&&!isPoll){
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
  const d=document.getElementById('nb-dot');if(d) d.style.display=cnt>0?'block':'none';
}

// ═══════════════════════════ DARK MODE ═══════════════════════════
function toggleDark(){
  DARK=!DARK;
  document.documentElement.setAttribute('data-theme',DARK?'dark':'light');
  localStorage.setItem('bt_dk',DARK?'1':'0');
  const p=document.getElementById('dk-pill');if(p) p.classList.toggle('on',DARK);
}

// ═══════════════════════════ MODAL ═══════════════════════════
function openModal(title,body,btns=[]){
  document.getElementById('m-title').innerHTML=title;
  document.getElementById('m-body').innerHTML=body;
  const f=document.getElementById('m-foot');
  f.innerHTML=btns.map((b,i)=>`<button class="btn ${b.c}" id="mb-${i}">${b.l}</button>`).join('');
  btns.forEach((b,i)=>document.getElementById('mb-'+i).onclick=b.fn);
  document.getElementById('modal-ov').classList.add('open');
}
function closeModal(){document.getElementById('modal-ov').classList.remove('open');}

// ═══════════════════════════ TOAST ═══════════════════════════
function toast(msg,type='i'){
  const w=document.getElementById('toast-wrap');
  const t=document.createElement('div');
  t.className=`ti ${type}`;
  t.innerHTML=msg;
  w.appendChild(t);
  setTimeout(()=>t.remove(),3200);
}



// ═══════════════════════════ INIT ═══════════════════════════
seed();
document.getElementById('yr').textContent=new Date().getFullYear();

const params=new URLSearchParams(window.location.search);
if(params.get('offer')){
  const email=params.get('offer');
  loadOfferPortal(email);
  document.getElementById('offer-portal').classList.add('open');
}

window.addEventListener('popstate',(event)=>{
  if(event.state&&event.state.page) showPage(event.state.page,true);
});

function toggleMobileMenu(){
  document.querySelector('.sidebar').classList.toggle('mobile-open');
  document.getElementById('mobile-overlay').classList.toggle('active');
}

// ==========================================
// INITIALIZATION 
// ==========================================
if (JWT && CU) {
  ROLE = CU.role;
  launchApp(); 
} else if (window.location.pathname !== '/' && window.location.pathname !== '/careers') {
  // If NOT logged in, and trying to access an app page, redirect to login
  window.location.href = '/';
}
