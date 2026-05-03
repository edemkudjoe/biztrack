// ─── CAREERS PORTAL ───

function openCareersPortal(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='none';
  const co=DB.g('company')||{};
  document.getElementById('cp-company-name').textContent=co.name?'Careers at '+co.name:'Join Our Team';
  const saved=localStorage.getItem('cp_jwt');
  const savedUser=localStorage.getItem('cp_user');
  if(saved&&savedUser){_cpUser=JSON.parse(savedUser);setCPLoggedIn();}
  else{setCPLoggedOut();}
  showJobsList();
  document.getElementById('careers-portal').classList.add('open');
}

function closeCareersPortal(){
  document.getElementById('careers-portal').classList.remove('open');
  document.getElementById('login-screen').style.display='flex';
}

function setCPLoggedIn(){
  document.getElementById('cp-login-btn').style.display='none';
  document.getElementById('cp-signup-btn').style.display='none';
  document.getElementById('cp-logout-btn').style.display='inline-flex';
  const s=document.getElementById('cp-auth-status');
  s.style.display='block';
  s.textContent='Hi, '+(_cpUser?.name?.split(' ')[0]||'there')+'!';
}

function setCPLoggedOut(){
  _cpUser=null;
  localStorage.removeItem('cp_jwt');
  localStorage.removeItem('cp_user');
  document.getElementById('cp-login-btn').style.display='inline-flex';
  document.getElementById('cp-signup-btn').style.display='inline-flex';
  document.getElementById('cp-logout-btn').style.display='none';
  document.getElementById('cp-auth-status').style.display='none';
}

function cpLogout(){setCPLoggedOut();showJobsList();toast('Logged out','i');}

function showCPAuth(tab){
  document.getElementById('cp-jobs-view').style.display='none';
  document.getElementById('cp-apply-view').style.display='none';
  document.getElementById('cp-track-view').style.display='none';
  document.getElementById('cp-offer-view').style.display='none';
  document.getElementById('cp-auth-view').style.display='block';
  document.getElementById('cp-login-form').style.display=tab==='login'?'block':'none';
  document.getElementById('cp-signup-form').style.display=tab==='signup'?'block':'none';
  document.getElementById('cp-forgot-form').style.display=tab==='forgot'?'block':'none';
}

async function doCPLogin(){
  const email=document.getElementById('cpl-email').value.trim();
  const pw=document.getElementById('cpl-pw').value;
  const msg=document.getElementById('cpl-msg');
  if(!email||!pw){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  msg.innerHTML='<div class="al al-b">Logging in…</div>';
  try{
    const r=await fetch(`${API}/portal-login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
    const text=await r.text();
    let d;try{d=JSON.parse(text);}catch{msg.innerHTML='<div class="al al-r">Server error. Try again.</div>';return;}
    if(!r.ok){msg.innerHTML=`<div class="al al-r">${d.error||'Login failed.'}</div>`;return;}
    _cpUser=d.applicant;
    localStorage.setItem('cp_jwt',d.token);
    localStorage.setItem('cp_user',JSON.stringify(d.applicant));
    setCPLoggedIn();
    msg.innerHTML='';
    // Check if they have an offer or are invited to test
    const apps=DB.g('applicants')||[];
    const myApp=apps.find(a=>a.email===_cpUser.email);
    if(myApp?.offerSent){showCPOffer(myApp);}
    else if(myApp?.testInvited&&myApp?.testScore===undefined){showCPAptTest();}
    else{showJobsList();}
    toast('Welcome back, '+(_cpUser.name?.split(' ')[0]||'')+'!','s');
  }catch(e){msg.innerHTML='<div class="al al-r">Network error. Try again.</div>';}
}

async function doCPSignup(){
  const name=document.getElementById('cps-name').value.trim();
  const email=document.getElementById('cps-email').value.trim();
  const pw=document.getElementById('cps-pw').value;
  const cpw=document.getElementById('cps-cpw').value;
  const sq=document.getElementById('cps-sq').value;
  const sa=document.getElementById('cps-sa').value.trim();
  const msg=document.getElementById('cps-msg');
  if(!name||!email||!pw||!sq||!sa){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  if(pw!==cpw){msg.innerHTML='<div class="al al-r">Passwords do not match.</div>';return;}
  if(pw.length<6){msg.innerHTML='<div class="al al-r">Password must be at least 6 characters.</div>';return;}
  msg.innerHTML='<div class="al al-b">Creating account…</div>';
  try{
    const r=await fetch(`${API}/portal-signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password:pw,securityQuestion:sq,securityAnswer:sa})});
    const text=await r.text();
    let d;try{d=JSON.parse(text);}catch{throw new Error('Server returned invalid response: '+text.substring(0,200));}
    if(!r.ok){msg.innerHTML=`<div class="al al-r">${d.error||'Signup failed.'}</div>`;return;}
    _cpUser=d.applicant;
    localStorage.setItem('cp_jwt',d.token);
    localStorage.setItem('cp_user',JSON.stringify(d.applicant));
    setCPLoggedIn();
    msg.innerHTML='';
    showJobsList();
    toast('Account created! Welcome.','s');
  }catch(e){msg.innerHTML=`<div class="al al-r">Error: ${e.message}</div>`;}
}

async function doCPForgotStep1(){
  const email=document.getElementById('cpf-email').value.trim();
  const msg=document.getElementById('cpf-msg1');
  if(!email){msg.innerHTML='<div class="al al-r">Please enter your email.</div>';return;}
  msg.innerHTML='<div class="al al-b">Looking up your account…</div>';
  try{
    const r=await fetch(`${API}/portal-reset`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,step:'question'})});
    const text=await r.text();
    let d;try{d=JSON.parse(text);}catch{msg.innerHTML='<div class="al al-r">Server error.</div>';return;}
    if(!r.ok){msg.innerHTML=`<div class="al al-r">${d.error||'Account not found.'}</div>`;return;}
    document.getElementById('cpf-question-display').textContent='Security Question: '+d.question;
    document.getElementById('cpf-step1').style.display='none';
    document.getElementById('cpf-step2').style.display='block';
    document.getElementById('cpf-step2').dataset.email=email;
    msg.innerHTML='';
  }catch(e){msg.innerHTML='<div class="al al-r">Network error.</div>';}
}

async function doCPForgotStep2(){
  const email=document.getElementById('cpf-step2').dataset.email;
  const answer=document.getElementById('cpf-answer').value.trim();
  const np=document.getElementById('cpf-newpw').value;
  const cnp=document.getElementById('cpf-cnewpw').value;
  const msg=document.getElementById('cpf-msg2');
  if(!answer||!np||!cnp){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  if(np!==cnp){msg.innerHTML='<div class="al al-r">Passwords do not match.</div>';return;}
  if(np.length<6){msg.innerHTML='<div class="al al-r">Password must be at least 6 characters.</div>';return;}
  msg.innerHTML='<div class="al al-b">Resetting password…</div>';
  try{
    const r=await fetch(`${API}/portal-reset`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,securityAnswer:answer,newPassword:np,step:'reset'})});
    const text=await r.text();
    let d;try{d=JSON.parse(text);}catch{msg.innerHTML='<div class="al al-r">Server error.</div>';return;}
    if(!r.ok){msg.innerHTML=`<div class="al al-r">${d.error||'Reset failed.'}</div>`;return;}
    msg.innerHTML='<div class="al al-g">Password reset! You can now log in.</div>';
    setTimeout(()=>showCPAuth('login'),1800);
  }catch(e){msg.innerHTML='<div class="al al-r">Network error.</div>';}
}

function showJobsList(){
  document.getElementById('cp-auth-view').style.display='none';
  document.getElementById('cp-jobs-view').style.display='block';
  document.getElementById('cp-apply-view').style.display='none';
  document.getElementById('cp-track-view').style.display='none';
  document.getElementById('cp-offer-view').style.display='none';
  // Hide test view if it exists
  const tv=document.getElementById('cp-test-view');
  if(tv) tv.style.display='none';

  const cpToken=localStorage.getItem('cp_jwt');
  if(cpToken){
    fetch(`${API}/data/applicants`,{headers:{'Authorization':`Bearer ${cpToken}`}})
      .then(r=>r.json()).then(data=>{if(data.records) DB.s('applicants',data.records);}).catch(()=>{});
  }
  fetch(`${API}/data/job_postings`)
    .then(r=>r.json()).then(data=>{if(data.records) DB.s('job_postings',data.records);renderJobsList();})
    .catch(()=>renderJobsList());
}

function renderJobsList(){
  const jobs=(DB.g('job_postings')||[]).filter(j=>j.active);
  const list=document.getElementById('cp-jobs-list');
  let dashHTML='';
  if(_cpUser){
    const myApps=(DB.g('applicants')||[]).filter(a=>a.email===_cpUser.email);
    const myOffer=myApps.find(a=>a.offerSent);
    const pendingTest=myApps.find(a=>a.testInvited&&a.testScore===undefined);
    dashHTML=`<div style="background:rgba(46,204,113,.12);border:1px solid rgba(46,204,113,.25);border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-size:13px;font-weight:800;color:#fff">My Portal</div>
        <div style="font-size:12px;color:rgba(255,255,255,.55)">${myApps.length} application${myApps.length!==1?'s':''} on file</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn b-ol btn-sm" onclick="showTrackView()">${ic('search',13)} Track Applications</button>
        ${pendingTest?`<button class="btn b-am btn-sm" onclick="showCPAptTest()">${ic('check-square',13)} Take Aptitude Test</button>`:''}
        ${myOffer?`<button class="btn b-gr btn-sm" onclick="showCPOffer(null)">${ic('file-text',13)} View My Offer</button>`:''}
      </div>
    </div>`;
  }
  if(jobs.length===0){
    list.innerHTML=dashHTML+`<div class="cp-empty"><div class="cp-empty-ico">${ic('briefcase',44)}</div><p>No open positions at the moment. Check back soon!</p></div>
    <div style="text-align:center;margin-top:20px"><button class="btn b-ol btn-sm" onclick="showTrackView()">${ic('search',13)} Track my application</button></div>`;
  } else {
    list.innerHTML=dashHTML+jobs.map((j,i)=>`
      <div class="job-card" onclick="openJobApply(${i})">
        <div class="job-card-top">
          <div>
            <div class="job-card-dept">${j.dept||'Open Role'}</div>
            <div class="job-card-title">${j.title}</div>
          </div>
          <button class="job-apply-btn" onclick="event.stopPropagation();openJobApply(${i})">Apply Now</button>
        </div>
        <div class="job-card-meta">
          ${j.type?`<span class="job-meta-pill">${ic('briefcase',12)} ${j.type}</span>`:''}
          ${j.location?`<span class="job-meta-pill">${ic('map-pin',12)} ${j.location}</span>`:''}
          ${j.salary?`<span class="job-meta-pill">${ic('dollar-sign',12)} ${j.salary}</span>`:''}
          ${j.deadline?`<span class="job-meta-pill">${ic('clock',12)} Deadline: ${j.deadline}</span>`:''}
          <span class="job-meta-pill">${ic('calendar',12)} Posted: ${j.postedDate||'Recently'}</span>
        </div>
        ${j.description?`<div class="job-card-desc">${j.description.substring(0,160)}${j.description.length>160?'…':''}</div>`:''}
      </div>`).join('')+
      `<div style="text-align:center;margin-top:24px"><button class="btn b-ol btn-sm" onclick="showTrackView()">${ic('search',13)} Already applied? Track your application</button></div>`;
  }
}

function openJobApply(idx){
  if(!_cpUser){
    showCPAuth('login');
    document.getElementById('cpl-msg').innerHTML='<div class="al al-b">Please log in or create an account to apply.</div>';
    return;
  }
  const jobs=(DB.g('job_postings')||[]).filter(j=>j.active);
  _cpSelectedJob=jobs[idx];
  document.getElementById('cp-auth-view').style.display='none';
  document.getElementById('cp-jobs-view').style.display='none';
  document.getElementById('cp-apply-view').style.display='block';
  document.getElementById('cp-track-view').style.display='none';
  document.getElementById('cp-apply-role-title').textContent='Apply for: '+_cpSelectedJob.title;
  document.getElementById('cp-apply-form').style.display='block';
  document.getElementById('cp-apply-done').style.display='none';
  document.getElementById('cp-apply-msg').innerHTML='';
  if(_cpUser){
    const nameEl=document.getElementById('cp-name');
    const emailEl=document.getElementById('cp-email');
    if(nameEl) nameEl.value=_cpUser.name||'';
    if(emailEl){emailEl.value=_cpUser.email||'';emailEl.readOnly=true;}
  }
  ['cp-phone','cp-field','cp-emp','cp-skills','cp-cover'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['cp-edu','cp-exp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function submitCareersApplication(){
  const name=document.getElementById('cp-name').value.trim();
  const email=document.getElementById('cp-email').value.trim();
  const eduEl=document.getElementById('cp-edu');
  const edu=eduEl.value;
  const exp=document.getElementById('cp-exp').value;
  const msg=document.getElementById('cp-apply-msg');
  if(!name||!email||!edu||!exp){msg.innerHTML='<div class="al al-r">Please fill all required fields.</div>';return;}
  const apps=DB.g('applicants')||[];
  if(apps.find(a=>a.email===email&&a.position===(_cpSelectedJob?.title||''))){msg.innerHTML='<div class="al al-a">You have already applied for this position.</div>';return;}
  const eduScore=parseInt(edu)||50;
  const expScore=Math.min(parseInt(exp)||0,30);
  const newApp={
    name,email,
    phone:document.getElementById('cp-phone').value,
    position:_cpSelectedJob?.title||'General Application',
    dept:_cpSelectedJob?.dept||'',
    education:eduEl.selectedIndex>0?eduEl.options[eduEl.selectedIndex].text:'',
    eduScore,
    experience:expScore,
    expScore,
    field:document.getElementById('cp-field').value,
    previousEmployers:document.getElementById('cp-emp').value,
    skills:document.getElementById('cp-skills').value,
    coverLetter:document.getElementById('cp-cover').value,
    date:today(),
    status:'pending',
    source:'careers_portal',
    testInvited:false,
    offerSent:false,
    invited:false
  };
  apps.push(newApp);DB.s('applicants',apps);
  const cpToken=localStorage.getItem('cp_jwt');
  fetch(`${API}/data/applicants`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cpToken}`},body:JSON.stringify(newApp)})
    .then(r=>r.json()).then(r=>{
      if(r.record){const a2=DB.g('applicants')||[];const i=a2.findIndex(x=>x.email===newApp.email&&x.position===newApp.position);if(i>=0){a2[i].id=r.record.id;DB.s('applicants',a2);}}
    }).catch(()=>{});
  document.getElementById('cp-apply-form').style.display='none';
  document.getElementById('cp-apply-done').innerHTML=`
    <div style="margin-bottom:12px;color:var(--accent)">${ic('check-circle',52)}</div>
    <h3 style="font-size:20px;font-weight:900;color:#fff;margin-bottom:8px">Application Submitted!</h3>
    <p style="color:rgba(255,255,255,.55);font-size:14px;margin-bottom:20px">Thank you for applying. We'll review your application and be in touch.</p>
    <div class="al al-g" style="text-align:left"><strong>Track anytime</strong> by clicking "Track Applications" from the portal home.</div>
    <button class="btn b-ol" style="margin-top:16px" onclick="showJobsList()">← Back to Jobs</button>`;
  document.getElementById('cp-apply-done').style.display='block';
}

// ─── APTITUDE TEST ───async function showCPAptTest(){
  if(!_cpUser){showCPAuth('login');return;}
  const apps=DB.g('applicants')||[];
  const myApp=apps.find(a=>a.email===_cpUser.email&&a.testInvited);
  if(!myApp){toast('You have not been invited to take the aptitude test yet.','e');return;}
  if(myApp.testScore!==undefined){toast('You have already completed the aptitude test.','i');showTrackView();return;}

  // Fetch questions from the correct endpoint if not cached
  let qs = DB.g('apt_qs') || [];
  if(qs.length === 0){
    try{
      const cpToken = localStorage.getItem('cp_jwt');
      const r = await fetch(`${API}/data/apt_questions`,{
        headers:{'Authorization':`Bearer ${cpToken}`}
      });
      const data = await r.json();
      if(data.records && data.records.length > 0){
        qs = data.records;
        DB.s('apt_qs', qs);
      }
    }catch(e){console.warn('Failed to fetch apt questions', e);}
  }

  if(qs.length === 0){toast('No test questions available yet. Please check back later.','e');return;}

  // Hide all views
  ['cp-auth-view','cp-jobs-view','cp-apply-view','cp-track-view','cp-offer-view'].forEach(id=>{
    document.getElementById(id).style.display='none';
  });

  // Create or reuse test view — FIX: use querySelector('.cp-body') not getElementById
  let testView=document.getElementById('cp-test-view');
  if(!testView){
    testView=document.createElement('div');
    testView.id='cp-test-view';
    document.querySelector('.cp-body').appendChild(testView);  // ← fixed
  }
  testView.style.display='block';
  testView.innerHTML=`
    <div class="cp-back-link" onclick="showJobsList()">← Back</div>
    <div class="cp-form-card">
      <div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:4px">Aptitude Test</div>
      <p style="color:rgba(255,255,255,.55);font-size:13px;margin-bottom:20px">Answer all ${qs.length} questions carefully. You can only submit once.</p>
      <div id="cp-apt-questions">
        ${qs.map((q,i)=>`
          <div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:16px;margin-bottom:14px">
            <div style="font-size:13.5px;font-weight:800;color:#fff;margin-bottom:12px">Q${i+1}. ${q.q}</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${q.opts.map((o,oi)=>`
                <label style="display:flex;align-items:center;gap:10px;padding:10px 13px;border:2px solid rgba(255,255,255,.15);border-radius:8px;cursor:pointer;transition:all .18s;font-size:13px;color:#fff" onclick="cpSelOpt(this,${i})">
                  <input type="radio" name="cpq${i}" value="${oi}" style="accent-color:var(--accent)">${String.fromCharCode(65+oi)}) ${o}
                </label>`).join('')}
            </div>
          </div>`).join('')}
      </div>
      <div id="cp-apt-msg" style="margin-bottom:12px"></div>
      <button class="btn-login" onclick="submitCPAptTest()">Submit Test</button>
    </div>`;
}

function cpSelOpt(lbl,qi){
  lbl.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='rgba(255,255,255,.15)';l.style.background='';});
  lbl.style.borderColor='var(--accent)';lbl.style.background='rgba(46,204,113,.1)';
  lbl.querySelector('input').checked=true;
}

async function submitCPAptTest(){
  if(!_cpUser) return;
  const qs=DB.g('apt_qs')||[];
  const msg=document.getElementById('cp-apt-msg');
  // Check all answered
  let allAnswered=true;
  qs.forEach((_,i)=>{if(!document.querySelector(`input[name="cpq${i}"]:checked`)) allAnswered=false;});
  if(!allAnswered){msg.innerHTML='<div class="al al-a">Please answer all questions before submitting.</div>';return;}
  let correct=0;
  qs.forEach((_,i)=>{
    const sel=document.querySelector(`input[name="cpq${i}"]:checked`);
    if(sel&&parseInt(sel.value)===qs[i].ans) correct++;
  });
  msg.innerHTML='<div class="al al-b">Submitting your test…</div>';
  const apps=DB.g('applicants')||[];
  const idx=apps.findIndex(a=>a.email===_cpUser.email&&a.testInvited);
  if(idx>=0){
    apps[idx].testScore=correct;
    DB.s('applicants',apps);
    // Sync to Supabase
    if(apps[idx].id){
      const cpToken=localStorage.getItem('cp_jwt');
      try{
        await fetch(`${API}/data/applicants/${apps[idx].id}`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cpToken}`},body:JSON.stringify({testScore:correct})});
      }catch(e){console.warn('Failed to sync test score',e);}
    }
  }
  msg.innerHTML=`<div class="al al-g">Test submitted! You scored <strong>${correct}/${qs.length}</strong>. We will contact you with next steps.</div>`;
  setTimeout(()=>{
    const tv=document.getElementById('cp-test-view');
    if(tv) tv.style.display='none';
    showTrackView();
  },2500);
}

function showTrackView(){
  document.getElementById('cp-auth-view').style.display='none';
  document.getElementById('cp-jobs-view').style.display='none';
  document.getElementById('cp-apply-view').style.display='none';
  document.getElementById('cp-track-view').style.display='block';
  document.getElementById('cp-offer-view').style.display='none';
  const tv=document.getElementById('cp-test-view');if(tv) tv.style.display='none';
  document.getElementById('cp-track-result').innerHTML='';
  document.getElementById('cp-track-msg').innerHTML='';
  if(_cpUser) loadCPTrackForLoggedIn();
}

function loadCPTrackForLoggedIn(){
  if(!_cpUser){
    document.getElementById('cp-track-msg').innerHTML='<div class="al al-r">Please log in to track your application.</div>';
    setTimeout(()=>showCPAuth('login'),1200);
    return;
  }
  const email=_cpUser.email;
  const apps=(DB.g('applicants')||[]).filter(a=>a.email===email);
  const res=document.getElementById('cp-track-result');
  if(apps.length===0){res.innerHTML=`<div class="al al-a">No applications found for <strong>${email}</strong>. Browse open positions to apply.</div>`;return;}
  const stageMap={pending:'Under Review',shortlisted:'Shortlisted',testing:'Aptitude Test',interviewing:'Interview Stage',accepted:'Offer Extended',rejected:'Not Selected'};
  res.innerHTML=apps.map(a=>{
    const stage=a.offerStatus==='accepted'?'accepted':a.offerStatus==='rejected'?'rejected':a.invited?'interviewing':a.testInvited?'testing':a.score!==undefined?'shortlisted':'pending';
    const stages=['pending','shortlisted','testing','interviewing','accepted'];
    const si=stages.indexOf(stage);
    return`<div class="cp-progress">
      <div class="cp-progress-title">${ic('file-text',13)} ${a.position||'Application'}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:12px">Applied: ${a.date||'—'}</div>
      ${stages.map((s,i)=>`<div class="cp-stage">
        <div class="cp-stage-dot ${i<si?'done':i===si?'current':''}"></div>
        <div class="cp-stage-label ${i<si?'done':i===si?'current':''}">${stageMap[s]||s}</div>
        ${i===si?`<span style="font-size:11px;color:rgba(255,255,255,.35);margin-left:auto">● Current</span>`:''}
      </div>`).join('')}
      ${stage==='testing'&&a.testScore===undefined?`<button class="btn b-am" style="width:100%;margin-top:12px;justify-content:center" onclick="showCPAptTest()">${ic('check-square',14)} Take Aptitude Test Now</button>`:''}
      ${a.testScore!==undefined?`<div class="al al-g" style="margin-top:10px">Test completed — Score: <strong>${a.testScore}/${(DB.g('apt_qs')||[]).length}</strong></div>`:''}
      ${a.offerSent?`<button class="btn b-gr" style="width:100%;margin-top:12px;justify-content:center" onclick="showCPOffer(null)">${ic('file-text',14)} View My Offer Letter</button>`:''}
      ${stage==='rejected'?`<div class="al al-r" style="margin-top:12px;margin-bottom:0">Thank you for applying. We have moved forward with other candidates.</div>`:''}
    </div>`;
  }).join('');
}

function showCPOffer(app){
  if(!_cpUser){showCPAuth('login');return;}
  const apps=DB.g('applicants')||[];
  const myApp=app||(apps.find(a=>a.email===_cpUser.email&&a.offerSent));
  if(!myApp){toast('No offer found for your account','e');return;}
  ['cp-auth-view','cp-jobs-view','cp-apply-view','cp-track-view'].forEach(id=>document.getElementById(id).style.display='none');
  const tv=document.getElementById('cp-test-view');if(tv) tv.style.display='none';
  document.getElementById('cp-offer-view').style.display='block';
  const co=DB.g('company')||{};
  document.getElementById('cp-offer-details').innerHTML=generateOfferLetterHTML(myApp,co)+
    `<button class="btn b-ol btn-full" style="margin-top:10px" onclick="downloadOfferLetter('${myApp.name}','${myApp.position}')">${ic('download',14)} Download Letter</button>`;
  document.getElementById('cp-offer-details').dataset.email=myApp.email;
  document.getElementById('cp-offer-neg-wrap').style.display='none';
  const alreadyResponded=myApp.offerStatus==='accepted'||myApp.offerStatus==='rejected';
  document.getElementById('cp-offer-action-btns').style.display=alreadyResponded?'none':'flex';
  document.getElementById('cp-offer-msg').innerHTML=alreadyResponded?`<div class="al ${myApp.offerStatus==='accepted'?'al-g':'al-r'}">You have already <strong>${myApp.offerStatus}</strong> this offer.</div>`:'';
}

async function respondCPOffer(decision){
  if(!_cpUser) return;
  const email=_cpUser.email;
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(a=>a.email===email&&a.offerSent);
  if(i>=0){
    apps[i].offerStatus=decision;
    DB.s('applicants',apps);
    if(apps[i].id){
      const cpToken=localStorage.getItem('cp_jwt');
      fetch(`${API}/data/applicants/${apps[i].id}`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cpToken}`},body:JSON.stringify({offerStatus:decision})}).catch(()=>{});
    }
  }
  document.getElementById('cp-offer-action-btns').style.display='none';
  document.getElementById('cp-offer-neg-wrap').style.display='none';
  const msg=document.getElementById('cp-offer-msg');
  if(decision==='accept'){
    await createEmployeeFromApplicant(apps[i],true);
    msg.innerHTML=`<div class="al al-g">${ic('check-circle',14)} <strong>Offer Accepted! Welcome to the team.</strong> Your login credentials will be shared with you by HR.</div>`;
  } else {
    msg.innerHTML=`<div class="al al-r">You have declined this offer. Thank you for your time.</div>`;
  }
}

function submitCPNegotiation(){
  if(!_cpUser) return;
  const email=_cpUser.email;
  const rate=document.getElementById('cp-neg-rate').value;
  const hours=document.getElementById('cp-neg-hours').value;
  const benefits=Array.from(document.getElementById('cp-neg-benefits').selectedOptions).map(o=>o.value);
  const note=document.getElementById('cp-neg-note').value;
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(a=>a.email===email&&a.offerSent);
  if(i>=0){
    apps[i].offerStatus='negotiated';
    apps[i].negotiation={rate,hours,benefits,note};
    DB.s('applicants',apps);
    if(apps[i].id){
      const cpToken=localStorage.getItem('cp_jwt');
      fetch(`${API}/data/applicants/${apps[i].id}`,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cpToken}`},body:JSON.stringify({offerStatus:'negotiated',negotiation:{rate,hours,benefits,note}})}).catch(()=>{});
    }
  }
  document.getElementById('cp-offer-msg').innerHTML='<div class="al al-b">Counter-offer sent. The employer will review and respond shortly.</div>';
  document.getElementById('cp-offer-neg-wrap').style.display='none';
  document.getElementById('cp-offer-action-btns').style.display='none';
  updNotif();
}
