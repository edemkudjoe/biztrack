//═══════════════════════════════════════════════
// ══════════ EMPLOYEE PAGES ════════════════════
// ═══════════════════════════════════════════════

function pEmpDash(el){
  const emp=CU;
  const empData=(DB.g('employees')||[]).find(e=>e.id===emp.id)||emp;
  const earn=monthlyEarnings(emp.id);
  const hrs=totalHours(emp.id);
  const perf=calcPerf(emp.id);
  const leaves=(DB.g('leaves')||[]).filter(l=>l.empId===emp.id);
  const advances=(DB.g('advances')||[]).filter(a=>a.empId===emp.id);

  el.innerHTML=`
  ${ph(`Welcome back, ${emp.name.split(' ')[0]}!`,`${empData.roleTitle||'Employee'} · ${empData.dept||'—'} · ${emp.id}`)}
  <div class="sg">
    ${sc('dollar-sign','Earnings (This Month)',fmt(earn),'Based on hours worked','up')}
    ${sc('clock','Hours Logged',hrs+' hrs','Total')}
    ${sc('trending-up','Performance',perf+'%',perf>=80?'Excellent':perf>=60?'Good':'Needs Work',perf>=80?'up':'dn')}
    ${sc('calendar','Leave Requests',leaves.length)}
  </div>
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('activity',15)} Quick Actions</span></div>
      <div class="cb" style="display:flex;flex-direction:column;gap:9px">
        <button class="btn b-nv btn-full" onclick="showPage('emp_attendance')">${ic('clock',15)} Clock In / Out</button>
        <button class="btn b-gr btn-full" onclick="showPage('emp_advance')">${ic('credit-card',15)} Request Advance</button>
        <button class="btn b-am btn-full" onclick="showPage('emp_promo')">${ic('arrow-up',15)} Request Promotion</button>
        <button class="btn b-bl btn-full" onclick="showPage('emp_leave')">${ic('calendar',15)} Request Leave</button>
        <button class="btn b-ol btn-full" onclick="showPage('emp_complaints')">${ic('message-square',15)} Submit Complaint</button>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('trending-up',15)} My Performance</span></div>
      <div class="cb">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:42px;font-weight:900;color:${perfColor(perf)}">${perf}%</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${perf>=80?'Excellent':perf>=60?'Good':'Needs Improvement'}</div>
        </div>
        <div class="pt"><div class="pf" style="width:${perf}%;background:${perfColor(perf)}"></div></div>
        <div style="margin-top:16px">
          <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span style="color:var(--text-muted)">Tasks Completed</span><strong>${(DB.g('tasks')||[]).filter(t=>t.empId===emp.id&&t.status==='done').length}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span style="color:var(--text-muted)">Days Present</span><strong>${(DB.g('attendance')||[]).filter(a=>a.empId===emp.id&&a.status==='present').length}</strong></div>
          <div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--text-muted)">Benefits Active</span><strong>${(DB.g('benefits')||[]).filter(b=>(b.empIds||[]).includes(emp.id)).length}</strong></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('gift',15)} My Benefits</span></div>
    <div class="cb">
      ${(DB.g('benefits')||[]).filter(b=>(b.empIds||[]).includes(emp.id)).length===0
        ?`<p style="font-size:13px;color:var(--text-muted)">No benefits assigned yet. Contact HR for more information.</p>`
        :`<div style="display:flex;flex-wrap:wrap;gap:9px">${(DB.g('benefits')||[]).filter(b=>(b.empIds||[]).includes(emp.id)).map(b=>`<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px"><div style="font-size:12.5px;font-weight:800">${b.name}</div><div style="font-size:11.5px;color:var(--text-muted)">${b.value}</div></div>`).join('')}</div>`}
    </div>
  </div>`;
}

// ─── EMPLOYEE FINANCE ───
function pEmpFinance(el){
  const emp=CU;
  const empData=(DB.g('employees')||[]).find(e=>e.id===emp.id)||emp;
  const earn=monthlyEarnings(emp.id);
  const hrs=totalHours(emp.id);
  const advances=(DB.g('advances')||[]).filter(a=>a.empId===emp.id);

  el.innerHTML=`
  ${ph('My Finance','Your earnings, salary history and advance requests.')}
  <div class="sg">
    ${sc('dollar-sign','Hourly Rate',fmt(empData.hourlyRate||0)+'/hr')}
    ${sc('clock','Hours Logged',hrs+' hrs','Earned hours')}
    ${sc('bar-chart-2','Earnings (Period)',fmt(earn),'Based on attendance','up')}
    ${sc('credit-card','Advances Taken',advances.filter(a=>a.status==='approved').length)}
  </div>
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('clock',15)} Attendance & Earnings</span></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Date</th><th>Hours</th><th>Earnings</th><th>Status</th></tr></thead><tbody>
          ${(DB.g('attendance')||[]).filter(a=>a.empId===emp.id).slice().reverse().map(a=>{
            const h=a.clockIn&&a.clockOut?Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000):0;
            const earn=h*(empData.hourlyRate||0);
            return`<tr><td>${a.date}</td><td>${h} h</td><td>${fmt(earn)}</td><td><span class="b ${bDot(a.status)}">${a.status}</span></td></tr>`;
          }).join('')||`<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No records yet</td></tr>`}
        </tbody></table></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('credit-card',15)} My Advances</span><button class="btn b-nv btn-sm" onclick="showPage('emp_advance')">New Request</button></div>
      <div class="cb">
        ${advances.length===0?`<p style="font-size:13px;color:var(--text-muted)">No advance requests yet.</p>`:`
        <div class="tw"><table><thead><tr><th>Amount</th><th>Reason</th><th>Date</th><th>Status</th></tr></thead><tbody>
          ${advances.map(a=>`<tr><td>${fmt(a.amount)}</td><td>${a.reason}</td><td>${a.date}</td><td><span class="b ${a.status==='approved'?'bg':a.status==='pending'?'ba':'br'}">${a.status}</span></td></tr>`).join('')}
        </tbody></table></div>`}
      </div>
    </div>
  </div>`;
}

// ─── SALARY ADVANCE ───
function pAdvance(el){
  el.innerHTML=`
  ${ph('Request Salary Advance','Submit an advance request to your employer.')}
  <div class="card mb" style="max-width:520px">
    <div class="ch"><span class="ct">${ic('credit-card',15)} Advance Request Form</span></div>
    <div class="cb">
      <div class="al al-b">Advances are subject to employer approval. All amounts are in Ghanaian Cedis (₵).</div>
      <div class="f"><label>Amount Requested (₵)</label><input type="number" id="adv-amt" placeholder="e.g. 500"></div>
      <div class="f"><label>Repayment Plan</label>
        <select id="adv-rep"><option>Deduct in 1 month</option><option>Deduct in 2 months</option><option>Deduct in 3 months</option></select>
      </div>
      <div class="f"><label>Reason for Advance</label><textarea id="adv-rsn" placeholder="Please explain why you need this advance…"></textarea></div>
      <button class="btn b-nv btn-full" onclick="submitAdvance()">Submit Request</button>
      <div id="adv-msg" style="margin-top:10px"></div>
    </div>
  </div>`;
}
function submitAdvance(){
  const amt=parseFloat(document.getElementById('adv-amt').value);
  const rsn=document.getElementById('adv-rsn').value;
  const msg=document.getElementById('adv-msg');
  if(!amt||!rsn){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  const rec={empId:CU.id,empName:CU.name,amount:amt,reason:rsn,repay:document.getElementById('adv-rep').value,date:today(),status:'pending'};
  DB.push('advances',rec);
  apiFetch('POST','/data/advances',rec)
    .then(r=>{if(r.record){const adv=DB.g('advances')||[];const i=adv.findIndex(a=>a.empId===rec.empId&&a.date===rec.date);if(i>=0){adv[i].id=r.record.id;DB.s('advances',adv);}}})
    .catch(()=>{});
  msg.innerHTML='<div class="al al-g">Request submitted successfully. Awaiting employer approval.</div>';
  document.getElementById('adv-amt').value='';
  document.getElementById('adv-rsn').value='';
  updNotif();
}
// ─── PROMOTION ───
function pPromo(el){
  const pr=(DB.g('promos')||[]).filter(p=>p.empId===CU.id);
  const empData=(DB.g('employees')||[]).find(e=>e.id===CU.id)||CU;
  el.innerHTML=`
  ${ph('Request Promotion','Submit a formal promotion request to management.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('arrow-up',15)} Promotion Request Form</span></div>
      <div class="cb">
        <div class="f"><label>Current Role</label><input value="${empData.roleTitle||CU.roleTitle||'—'}" disabled></div>
        <div class="f"><label>Desired Role / Position</label><input type="text" id="pr-role" placeholder="e.g. Senior Sales Manager"></div>
        <div class="f"><label>Years in Current Role</label><input type="number" id="pr-yrs" placeholder="e.g. 2"></div>
        <div class="f"><label>Key Achievements & Justification</label><textarea id="pr-just" placeholder="Describe your achievements and why you deserve a promotion…"></textarea></div>
        <button class="btn b-nv btn-full" onclick="submitPromo()">Submit Request</button>
        <div id="pr-msg" style="margin-top:10px"></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('list',15)} My Requests</span></div>
      <div class="cb">
        ${pr.length===0?`<p style="font-size:13px;color:var(--text-muted)">No promotion requests submitted yet.</p>`
        :pr.map(p=>`<div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:9px">
          <div style="font-size:13px;font-weight:800">${p.desiredRole}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">${p.date}</div>
          <span class="b ${p.status==='pending'?'ba':p.status==='approved'?'bg':'br'}" style="margin-top:6px;display:inline-block">${p.status}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}
function submitPromo(){
  const role=document.getElementById('pr-role').value;
  const just=document.getElementById('pr-just').value;
  const empData=(DB.g('employees')||[]).find(e=>e.id===CU.id)||CU;
  if(!role||!just){document.getElementById('pr-msg').innerHTML='<div class="al al-r">Please fill all required fields.</div>';return;}
  const rec={empId:CU.id,empName:CU.name,currentRole:empData.roleTitle||'—',desiredRole:role,years:document.getElementById('pr-yrs').value,justification:just,date:today(),status:'pending'};
  DB.push('promos',rec);
  apiFetch('POST','/data/promos',rec)
    .then(r=>{if(r.record){const promos=DB.g('promos')||[];const i=promos.findIndex(p=>p.empId===rec.empId&&p.date===rec.date);if(i>=0){promos[i].id=r.record.id;DB.s('promos',promos);}}})
    .catch(()=>{});
  document.getElementById('pr-msg').innerHTML='<div class="al al-g">Promotion request submitted. Awaiting management review.</div>';
  updNotif();
}

// ─── EMPLOYEE ATTENDANCE ───

function pMyTasks(el){
  const allTasks=DB.g('tasks')||[];
  const tasks=allTasks.filter(t=>t.empId===CU.id);
  const pending=tasks.filter(t=>t.status==='pending');
  const done=tasks.filter(t=>['done','awaiting_verification','verified','rejected'].includes(t.status));
  el.innerHTML=`
  ${ph('My Tasks','Tasks assigned to you by your employer.')}
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('clock',15)} Pending Tasks (${pending.length})</span></div>
    <div class="cb">
      ${pending.length===0?'<p style="color:var(--text-muted);font-size:13px">No pending tasks.</p>':pending.map(t=>{
        const idx=allTasks.findIndex(x=>x===t);
        return `<div class="card mb" style="border-left:3px solid var(--amber);padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-weight:700;font-size:14px">${t.title}</div>
              ${t.desc?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.desc}</div>`:''}
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">Due: ${t.dueDate||'—'} &nbsp;|&nbsp; Assigned: ${t.assignedDate||'—'}</div>
            </div>
            <button class="btn b-gr btn-sm" onclick="completeTask(${idx})">Mark Complete</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('check-circle',15)} Completed Tasks (${done.length})</span></div>
    <div class="cb">
      ${(()=>{
        const awaiting=tasks.filter(t=>t.status==='awaiting_verification');
        const verified=tasks.filter(t=>t.status==='verified');
        const rejected=tasks.filter(t=>t.status==='rejected');
        return `
          ${awaiting.length>0?`<p style="font-weight:600;font-size:13px;margin-bottom:6px">${ic('clock',13)} Awaiting Verification</p>`:''}
          ${awaiting.map(t=>`
            <div class="card mb" style="border-left:3px solid var(--amber);padding:14px;opacity:0.9">
              <div style="font-weight:700;font-size:14px">${t.title}</div>
              ${t.desc?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.desc}</div>`:''}
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">Submitted: ${t.completedDate||'—'} &nbsp;|&nbsp; Awaiting employer confirmation</div>
            </div>`).join('')}
          ${verified.length>0?`<p style="font-weight:600;font-size:13px;margin:10px 0 6px">${ic('check-circle',13)} Verified & Completed</p>`:''}
          ${verified.map(t=>`
            <div class="card mb" style="border-left:3px solid var(--accent);padding:14px;opacity:0.85">
              <div style="font-weight:700;font-size:14px">${t.title}</div>
              ${t.desc?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.desc}</div>`:''}
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">Verified: ${t.verifiedDate||t.completedDate||'—'} &nbsp;|&nbsp; <span style="color:var(--accent)">+${TASK_SCORES[t.difficulty||'easy']}pts</span></div>
            </div>`).join('')}
          ${rejected.length>0?`<p style="font-weight:600;font-size:13px;margin:10px 0 6px">${ic('x-circle',13)} Rejected</p>`:''}
          ${rejected.map(t=>`
            <div class="card mb" style="border-left:3px solid var(--red);padding:14px;opacity:0.85">
              <div style="font-weight:700;font-size:14px">${t.title}</div>
              ${t.desc?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${t.desc}</div>`:''}
              <div style="font-size:11.5px;color:var(--red);margin-top:4px">Rejected by employer &nbsp;|&nbsp; -${TASK_SCORES[t.difficulty||'easy']}pts</div>
            </div>`).join('')}
          ${(awaiting.length+verified.length+rejected.length)===0?'<p style="color:var(--text-muted);font-size:13px">No completed tasks yet.</p>':''}`;
      })()}
    </div>
  </div>`;
}

async function completeTask(i){
  const t=DB.g('tasks')||[];
  if(!t[i]){toast('Task not found','e');return;}
  t[i].status='awaiting_verification';
  t[i].completedDate=today();
  DB.s('tasks',t);
  showPage('emp_tasks');
  toast('Task submitted — awaiting employer verification','s');
  updNotif();
  if(t[i].id){
    try{
      await apiFetch('PUT',`/data/tasks/${t[i].id}`,{status:'awaiting_verification',completedDate:today()});
    }catch(e){
      toast('Sync failed — will update on next login','w');
    }
  }
}

function pMyAtt(el){
  const att=(DB.g('attendance')||[]).filter(a=>a.empId===CU.id);
  const todayRec=att.find(a=>a.date===today());
  const empData=(DB.g('employees')||[]).find(e=>e.id===CU.id)||CU;

  el.innerHTML=`
  ${ph('Attendance',"Clock in and out using your device's location.")}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('map-pin',15)} Clock In / Out</span></div>
      <div class="cb">
        <div style="background:var(--bg);border-radius:10px;padding:20px;text-align:center;margin-bottom:14px">
          <div class="clk-big" id="att-clock">${new Date().toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div>
          <div style="font-size:12.5px;color:var(--text-muted)">${new Date().toLocaleDateString('en-GH',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        ${todayRec?`
          <div class="al ${todayRec.clockOut?'al-g':'al-b'}">
            ${todayRec.clockOut
              ?`Shift complete. You worked ${Math.floor((new Date(todayRec.clockOut)-new Date(todayRec.clockIn))/3600000)} hours. Earnings: <strong>${fmt(Math.floor((new Date(todayRec.clockOut)-new Date(todayRec.clockIn))/3600000)*(empData.hourlyRate||0))}</strong>`
              :`Clocked in at ${new Date(todayRec.clockIn).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'})}. Shift in progress.`}
          </div>
          ${!todayRec.clockOut?`<button class="btn b-rd btn-full" onclick="clockOut()">${ic('clock',15)} Clock Out</button>`:``}
        `:`
          <div class="al al-a">${ic('map-pin',13)} Your location will be verified against the work location. You must be within the allowed radius.</div>
          <button class="btn b-gr btn-full" onclick="clockIn()">${ic('clock',15)} Clock In</button>
        `}
        <div id="att-msg" style="margin-top:10px"></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('calendar',15)} This Month Summary</span></div>
      <div class="cb">
        <div class="sg" style="grid-template-columns:1fr 1fr;margin:0">
          ${sc('check-circle','Present',att.filter(a=>a.status==='present').length,'','up')}
          ${sc('clock','Late',att.filter(a=>a.status==='late').length,'','dn')}
          ${sc('dollar-sign','Earned',fmt(monthlyEarnings(CU.id)),'Total','up')}
          ${sc('activity','Total Hours',totalHours(CU.id)+' hrs')}
        </div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('list',15)} My Attendance Log</span></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Earnings</th><th>Status</th></tr></thead><tbody>
        ${att.length===0?`<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No records yet. Clock in to begin tracking.</td></tr>`
        :att.slice().reverse().map(a=>{
          const h=a.clockIn&&a.clockOut?Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000):0;
          return`<tr><td>${a.date}</td>
            <td>${a.clockIn?new Date(a.clockIn).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'—'}</td>
            <td>${a.clockOut?new Date(a.clockOut).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'Active'}</td>
            <td>${h} h</td><td>${fmt(h*(empData.hourlyRate||0))}</td>
            <td><span class="b ${bDot(a.status)}">${a.status}</span></td>
          </tr>`;
        }).join('')}
      </tbody></table></div>
    </div>
  </div>`;

  // Live clock for attendance
  const attClockEl=document.getElementById('att-clock');
  if(attClockEl) setInterval(()=>{if(document.getElementById('att-clock')) document.getElementById('att-clock').textContent=new Date().toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit',second:'2-digit'});},1000);
}

function clockIn(){
  const msg=document.getElementById('att-msg');
  msg.innerHTML=`<div class="al al-b"><span class="ldr"></span> Verifying your location…</div>`;
  if(!navigator.geolocation){
    msg.innerHTML='<div class="al al-r">Geolocation is not supported by your browser.</div>';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>completeClock(pos),
    err=>{
      msg.innerHTML=`<div class="al al-r">Could not get your location: ${err.message}. Please enable location access and try again.</div>`;
    },
    {timeout:10000,maximumAge:0,enableHighAccuracy:true}
  );
}

function completeClock(pos){
  const as=DB.g('att_settings')||{};
  const workLat=parseFloat(as.work_lat||'0');
  const workLng=parseFloat(as.work_lng||'0');
  const radius=parseFloat(as.work_radius||'100');
  const shiftStart=as.shift_start||'08:00';
  const workAddress=as.work_address||'Office';

  if(!workLat||!workLng){
    toast('Attendance not configured yet. Contact your employer.','e');
    return;
  }

  // Calculate distance from office using Haversine formula
  const R=6371000;
  const empLat=pos.coords.latitude;
  const empLng=pos.coords.longitude;
  const lat1=empLat*Math.PI/180;
  const lat2=workLat*Math.PI/180;
  const dLat=(workLat-empLat)*Math.PI/180;
  const dLng=(workLng-empLng)*Math.PI/180;
  const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)*Math.sin(dLng/2);
  const dist=R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

  if(dist>radius){
    const msg=document.getElementById('att-msg');
    msg.innerHTML=`<div class="al al-r">You are ${Math.round(dist)}m away from ${workAddress}. You must be within ${radius}m to clock in.</div>`;
    return;
  }

  const now=new Date();
  const timeStr=now.toISOString();
  const dateStr=now.toISOString().split('T')[0];
  const [sh,sm]=shiftStart.split(':').map(Number);
  const [eh,em]=(as.shift_end||'17:00').split(':').map(Number);
  const shiftMinutes=sh*60+sm;
  const shiftEndMinutes=eh*60+em;
  const earlyWindowMinutes=shiftMinutes-60; // allow clock-in up to 1 hour early
  const nowMinutes=now.getHours()*60+now.getMinutes();

// Block clock-in more than 1 hour before shift
if(nowMinutes<earlyWindowMinutes){
  const msg=document.getElementById('att-msg');
  msg.innerHTML=`<div class="al al-r">Too early to clock in. Your shift starts at ${as.shift_start||'08:00'}. You can clock in from ${String(Math.floor(earlyWindowMinutes/60)).padStart(2,'0')}:${String(earlyWindowMinutes%60).padStart(2,'0')}.</div>`;
  return;
}

// Block clock-in after shift end
if(nowMinutes>shiftEndMinutes){
  const msg=document.getElementById('att-msg');
  msg.innerHTML=`<div class="al al-r">Shift has ended. Clock-in is not allowed after ${as.shift_end||'17:00'}.</div>`;
  return;
}

const status=nowMinutes<=shiftMinutes?'present':'late';

  const att=DB.g('attendance')||[];
  const newRec={empId:CU.id,empName:CU.name,date:dateStr,status,clockIn:timeStr,clockOut:null};
  att.push(newRec);
  DB.s('attendance',att);
  DB.s('clocked_in','1');

  apiFetch('POST','/data/attendance',newRec)
    .then(r=>{if(r.record){newRec.id=r.record.id;DB.s('attendance',att);}})
    .catch(()=>{});

  showPage('emp_attendance');
  toast(`Clocked in — ${status}`,'s');
}
function clockOut(){
  const att=DB.g('attendance')||[];
  const i=att.slice().reverse().findIndex(a=>a.empId===CU.id&&a.date===today()&&!a.clockOut);
  const ri=att.length-1-i;
  if(ri<0){toast('No active clock-in found','e');return;}
  att[ri].clockOut=new Date().toISOString();
  DB.s('attendance',att);
  if(att[ri].id) apiFetch('PUT',`/data/attendance/${att[ri].id}`,{clockOut:att[ri].clockOut}).catch(()=>{});
  toast('Clocked out successfully','s');
  showPage('emp_attendance');
}

function getDistance(la1,lo1,la2,lo2){
  const R=6371000,dL=(la2-la1)*Math.PI/180,dl=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ─── EMPLOYEE LEAVE ───
function pMyLeave(el){
  const leaves=(DB.g('leaves')||[]).filter(l=>l.empId===CU.id);
  el.innerHTML=`
  ${ph('Request Leave','Submit and track your leave requests.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('calendar',15)} New Leave Request</span></div>
      <div class="cb">
        <div class="f"><label>Leave Type</label>
          <select id="lv-type"><option>Annual Leave</option><option>Sick Leave</option><option>Maternity/Paternity Leave</option><option>Compassionate Leave</option><option>Study Leave</option><option>Unpaid Leave</option></select>
        </div>
        <div class="fr">
          <div class="f"><label>From Date</label><input type="date" id="lv-from"></div>
          <div class="f"><label>To Date</label><input type="date" id="lv-to"></div>
        </div>
        <div class="f"><label>Reason</label><textarea id="lv-rsn" placeholder="Brief explanation of your leave request…"></textarea></div>
        <button class="btn b-nv btn-full" onclick="submitLeave()">Submit Request</button>
        <div id="lv-msg" style="margin-top:10px"></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('list',15)} My Leave History</span></div>
      <div class="cb">
        ${leaves.length===0?`<p style="font-size:13px;color:var(--text-muted)">No leave requests yet.</p>`
        :leaves.map(l=>`
          <div style="padding:12px;background:var(--bg);border-radius:8px;margin-bottom:9px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
              <strong style="font-size:13px">${l.type}</strong>
              <span class="b ${l.status==='pending'?'ba':l.status==='approved'?'bg':'br'}">${l.status}</span>
            </div>
            <div style="font-size:11.5px;color:var(--text-muted)">${l.fromDate} → ${l.toDate}${l.days?' ('+l.days+' day'+ (l.days>1?'s':'') + ')':''}</div>
            ${l.status==='approved'?`
              <div style="margin-top:8px;padding:8px;background:var(--card);border-radius:6px;border:1px solid var(--border)">
                <div style="font-size:11.5px;font-weight:700;color:var(--navy);margin-bottom:4px">Employer Response:</div>
                <div style="font-size:11.5px;color:var(--text-muted)">${l.terms||'Approved.'}</div>
                <div style="margin-top:6px;display:flex;align-items:center;gap:8px">
                  <span class="b ${l.payStatus==='paid'?'bg':'ba'}">${l.payStatus||'pending'}</span>
                  ${l.conditions?`<span style="font-size:11px;color:var(--text-muted)">${l.conditions}</span>`:''}
                </div>
                ${!l.empAccepted?`
                  <div style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn b-gr btn-sm" onclick="acceptLeaveTerms('${l.fromDate}')">Accept Terms</button>
                    <button class="btn b-rd btn-sm" onclick="declineLeaveTerms('${l.fromDate}')">Decline</button>
                  </div>`:
                  `<div class="al al-g" style="margin-top:8px;margin-bottom:0">You accepted these terms on ${l.acceptedDate||l.respondedDate}.</div>`}
              </div>`:''}
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}
function submitLeave(){
  const from=document.getElementById('lv-from').value;
  const to=document.getElementById('lv-to').value;
  const rsn=document.getElementById('lv-rsn').value;
  const msg=document.getElementById('lv-msg');
  if(!from||!to||!rsn){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  const days=Math.ceil((new Date(to)-new Date(from))/(1000*3600*24))+1;
  if(days<1){msg.innerHTML='<div class="al al-r">End date must be after start date.</div>';return;}
  const rec={empId:CU.id,empName:CU.name,type:document.getElementById('lv-type').value,fromDate:from,toDate:to,days,reason:rsn,date:today(),status:'pending'};
  DB.push('leaves',rec);
  apiFetch('POST','/data/leaves',rec)
    .then(r=>{if(r.record){const leaves=DB.g('leaves')||[];const i=leaves.findIndex(l=>l.empId===rec.empId&&l.fromDate===rec.fromDate);if(i>=0){leaves[i].id=r.record.id;DB.s('leaves',leaves);}}})
    .catch(()=>{});
  msg.innerHTML='<div class="al al-g">Leave request submitted successfully. Awaiting employer response.</div>';
  updNotif();
}
function acceptLeaveTerms(fromDate){
  DB.upd('leaves',l=>l.empId===CU.id&&l.fromDate===fromDate,{empAccepted:true,acceptedDate:today()});
  showPage('emp_leave'); toast('Leave terms accepted','s');
}
function declineLeaveTerms(fromDate){
  DB.upd('leaves',l=>l.empId===CU.id&&l.fromDate===fromDate,{status:'declined',empAccepted:false});
  showPage('emp_leave'); toast('Leave terms declined','i');
}

// ─── EMPLOYEE COMPLAINTS ───
function pMyComplaints(el){
  const complaints=(DB.g('complaints')||[]).filter(c=>c.empId===CU.id);
  el.innerHTML=`
  ${ph('Complaints & Suggestions','Report issues or share ideas with management.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('send',15)} New Submission</span></div>
      <div class="cb">
        <div class="f"><label>Type</label>
          <select id="cm-type"><option>Complaint</option><option>Suggestion</option><option>Feedback</option></select>
        </div>
        <div class="f"><label>Subject</label><input type="text" id="cm-subj" placeholder="Brief subject line"></div>
        <div class="f"><label>Message</label><textarea id="cm-msg" placeholder="Describe your complaint or suggestion in detail…"></textarea></div>
        <div class="f"><label>Submit As</label>
          <select id="cm-anon"><option value="no">My Name (${CU.name})</option><option value="yes">Anonymous</option></select>
        </div>
        <button class="btn b-nv btn-full" onclick="submitComplaint()">Submit</button>
        <div id="cm-res" style="margin-top:10px"></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('list',15)} My Submissions</span></div>
      <div class="cb">
        ${complaints.length===0?`<p style="font-size:13px;color:var(--text-muted)">No submissions yet.</p>`
        :complaints.map(c=>`<div style="padding:11px;background:var(--bg);border-radius:8px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span class="b ${c.type==='Complaint'?'br':'bb'}">${c.type}</span>
            <strong style="font-size:13px">${c.subject}</strong>
          </div>
          <div style="font-size:11px;color:var(--text-muted)">${c.date}</div>
          <span class="b ${c.resolved?'bg':'ba'}" style="margin-top:5px;display:inline-block">${c.resolved?'Resolved':'Pending'}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}
function submitComplaint(){
  const subj=document.getElementById('cm-subj').value;
  const msg=document.getElementById('cm-msg').value;
  const anon=document.getElementById('cm-anon').value==='yes';
  const res=document.getElementById('cm-res');
  if(!subj||!msg){res.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  const rec={empId:CU.id,empName:anon?'Anonymous':CU.name,type:document.getElementById('cm-type').value,subject:subj,message:msg,date:today(),resolved:false};
  DB.push('complaints',rec);
  apiFetch('POST','/data/complaints',rec)
    .then(r=>{if(r.record){const complaints=DB.g('complaints')||[];const i=complaints.findIndex(c=>c.empId===rec.empId&&c.date===rec.date);if(i>=0){complaints[i].id=r.record.id;DB.s('complaints',complaints);}}})
    .catch(()=>{});
  res.innerHTML='<div class="al al-g">Submitted successfully. Management will review your submission.</div>';
  document.getElementById('cm-subj').value=''; document.getElementById('cm-msg').value='';
}

// ─── PROFILE ───
function pProfile(el){
  const empData=(DB.g('employees')||[]).find(e=>e.id===CU.id)||CU;
  const benefits=(DB.g('benefits')||[]).filter(b=>(b.empIds||[]).includes(CU.id));
  const perf=calcPerf(CU.id);
  el.innerHTML=`
  ${ph('My Profile','Your employment details and account settings.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('user',15)} Personal Info</span></div>
      <div class="cb">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0">${CU.initials||CU.name.slice(0,2).toUpperCase()}</div>
          <div><div style="font-size:19px;font-weight:900;color:var(--navy)">${CU.name}</div><div style="font-size:12.5px;color:var(--text-muted)">${empData.roleTitle||'—'} · ${empData.dept||'—'}</div></div>
        </div>
        <div class="f"><label>Employee ID</label><input value="${CU.id}" disabled></div>
        <div class="f"><label>Email</label><input value="${empData.email||CU.email||'—'}" disabled></div>
        <div class="f"><label>Department</label><input value="${empData.dept||'—'}" disabled></div>
        <div class="f"><label>Date Joined</label><input value="${empData.joinDate||'—'}" disabled></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('briefcase',15)} Employment Details</span></div>
      <div class="cb">
        <div class="f"><label>Job Title</label><input value="${empData.roleTitle||'—'}" disabled></div>
        <div class="f"><label>Hourly Rate</label><input value="${fmt(empData.hourlyRate||0)}/hr" disabled></div>
        <div class="f"><label>Total Earnings</label><input value="${fmt(monthlyEarnings(CU.id))}" disabled></div>
        <div class="f"><label>Performance Score</label>
          <div style="padding:9px 0">
            <div class="pr-row"><div class="pr-nm">Performance</div><div class="pr-tr"><div class="pr-fl" style="width:${perf}%;background:${perfColor(perf)}"></div></div><div class="pr-sc">${perf}%</div></div>
          </div>
        </div>
        <div class="f"><label>Benefits Active</label>
          <div style="display:flex;flex-wrap:wrap;gap:6px;padding:4px 0">
            ${benefits.length===0?'<span style="color:var(--text-muted);font-size:13px">None</span>':benefits.map(b=>`<span class="b bg">${b.name}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('lock',15)} Change Password</span></div>
    <div class="cb">
      <div class="fr">
        <div class="f"><label>Current Password</label><input type="password" id="pp-cp" placeholder="Current password"></div>
        <div class="f"><label>New Password</label><input type="password" id="pp-np" placeholder="New password"></div>
      </div>
      <button class="btn b-am" onclick="changeEmpPw()">Update Password</button>
      <div id="pp-msg" style="margin-top:9px"></div>
    </div>
  </div>`;
}
async function changeEmpPw(){
  const msg=document.getElementById('pp-msg');
  const cp=document.getElementById('pp-cp').value;
  const np=document.getElementById('pp-np').value;
  if(!cp||!np){msg.innerHTML='<div class="al al-r">Please fill all fields.</div>';return;}
  try{
    await apiFetch('POST','/change-password',{currentPassword:cp,newPassword:np});
    msg.innerHTML='<div class="al al-g">Password updated successfully.</div>';
    document.getElementById('pp-cp').value='';
    document.getElementById('pp-np').value='';
  }catch(e){msg.innerHTML=`<div class="al al-r">${e.message}</div>`;}
}
  
