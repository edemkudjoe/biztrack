// ═══════════════════════════════════════════════
// ══════════ EMPLOYER PAGES ════════════════════
// ═══════════════════════════════════════════════
function pEDash(el){
  const emps=DB.g('employees')||[];
  const costs=DB.g('costs')||[];
  const rev=DB.g('revenue')||[];
  const totalRev=rev.reduce((s,r)=>s+r.amount,0);
  const totalCosts=costs.reduce((s,c)=>s+c.amount,0);
  const estPayroll=emps.reduce((s,e)=>s+monthlyEarnings(e.id),0);
  const profit=totalRev-(totalCosts+estPayroll);
  const margin=totalRev>0?((profit/totalRev)*100).toFixed(1):0;
  const pending=(DB.g('advances')||[]).filter(a=>a.status==='pending').length+(DB.g('leaves')||[]).filter(l=>l.status==='pending').length;
  const todayAtt=(DB.g('attendance')||[]).filter(a=>a.date===today()&&a.clockIn).length;
  el.innerHTML=`
  ${ph('Dashboard','Business overview at a glance.')}
  <div class="sg">
    ${sc('users','Total Employees',emps.length)}
    ${sc('bar-chart-2','Total Revenue',fmt(totalRev),'Period total','up')}
    ${sc('percent','Profit Margin',margin+'%',profit>=0?'Profitable':'Loss',profit>=0?'up':'dn')}
    ${sc('bell','Pending Requests',pending,pending>0?'Awaiting action':'')}
    ${sc('clock','Clocked In Today',todayAtt,'Active employees')}
  </div>
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('users',15)} Employees</span><button class="btn b-nv btn-sm" onclick="showPage('e_employees')">View All</button></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Name</th><th>Role</th><th>Rate/hr</th><th>Perf</th></tr></thead><tbody>
          ${emps.slice(0,6).map(e=>{const s=calcPerf(e.id);return`<tr><td><strong>${e.name}</strong></td><td>${e.roleTitle}</td><td>${fmt(e.hourlyRate)}</td><td><span class="b ${s>=80?'bg':s>=60?'ba':'br'}">${s}%</span></td></tr>`}).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('activity',15)} Quick Actions</span></div>
      <div class="cb" style="display:flex;flex-direction:column;gap:9px">
        <button class="btn b-nv btn-full" onclick="showPage('e_finance')">${ic('dollar-sign',15)} Finance & Revenue</button>
        <button class="btn b-gr btn-full" onclick="showPage('e_recruitment')">${ic('search',15)} Recruitment</button>
        <button class="btn b-bl btn-full" onclick="showPage('e_leaves')">${ic('calendar',15)} Leave Requests</button>
        <button class="btn b-pr btn-full" onclick="showPage('e_benefits')">${ic('gift',15)} Manage Benefits</button>
        <button class="btn b-ol btn-full" onclick="showPage('e_complaints')">${ic('message-square',15)} Complaints</button>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('layers',15)} Profit Summary</span></div>
    <div class="cb">
      <div style="background:var(--bg);border-radius:9px;padding:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="font-size:12.5px;color:var(--text-muted)">Revenue</span><strong class="pfpos">${fmt(totalRev)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:7px"><span style="font-size:12.5px;color:var(--text-muted)">Costs</span><strong class="pfneg">–${fmt(totalCosts)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:11px"><span style="font-size:12.5px;color:var(--text-muted)">Payroll</span><strong class="pfneg">–${fmt(estPayroll)}</strong></div>
        <div style="border-top:2px solid var(--border);padding-top:9px;display:flex;justify-content:space-between">
          <strong>Net Profit</strong>
          <strong style="font-size:17px" class="${profit>=0?'pfpos':'pfneg'}">${fmt(Math.abs(profit))} ${profit>=0?'▲':'▼'}</strong>
        </div>
      </div>
    </div>
  </div>`;
}

function pNotifications(el){
  if(ROLE==='employer'){
    const adv=(DB.g('advances')||[]).filter(a=>a.status==='pending');
    const lv=(DB.g('leaves')||[]).filter(l=>l.status==='pending');
    const pr=(DB.g('promos')||[]).filter(p=>p.status==='pending');
    const neg=(DB.g('applicants')||[]).filter(a=>a.offerStatus==='negotiated');
    const awaitingTasks=(DB.g('tasks')||[]).filter(t=>t.status==='awaiting_verification');
    const items=[
      ...adv.map(a=>({ico:'credit-card',txt:`<strong>${a.empName}</strong> requested a salary advance of ${fmt(a.amount)}`,t:'Finance',go:'e_finance',cls:'b-am'})),
      ...lv.map(l=>({ico:'calendar',txt:`<strong>${l.empName}</strong> submitted a leave request`,t:'HR',go:'e_leaves',cls:'b-bl'})),
      ...pr.map(p=>({ico:'arrow-up',txt:`<strong>${p.empName}</strong> submitted a promotion request`,t:'HR',go:'e_employees',cls:'b-pr'})),
      ...neg.map(a=>({ico:'file-text',txt:`<strong>${a.name}</strong> sent a counter-offer`,t:'Recruitment',go:'e_recruitment',cls:'b-nv'})),
      ...awaitingTasks.map(t=>({ico:'check-square',txt:`Task ready to verify: <strong>${t.title}</strong>`,sub:`Employee: ${t.empName}`,t:'Tasks',go:'e_performance',cls:'b-gr'})),
    ];
    el.innerHTML=`
    ${ph('Notifications','Alerts and pending actions.')}
    ${items.length===0?`<div class="es"><div class="es-ico">${ic('bell',44)}</div><h3>All clear!</h3><p>No pending notifications.</p></div>`:`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${items.map(n=>`
        <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--card);border-radius:10px;border:1px solid var(--border);cursor:pointer" onclick="showPage('${n.go}')">
          <div style="width:38px;height:38px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--navy-lighter);flex-shrink:0">${ic(n.ico,18)}</div>
          <div style="flex:1"><div style="font-size:13px;color:var(--text)">${n.txt}</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${n.t}</div></div>
          <span class="btn btn-sm ${n.cls}" style="flex-shrink:0">View</span>
        </div>`).join('')}
    </div>`}`;
  }
}

function pFinance(el){
  const emps=DB.g('employees')||[];
  const costs=DB.g('costs')||[];
  const rev=DB.g('revenue')||[];
  const advances=DB.g('advances')||[];
  const totalRev=rev.reduce((s,r)=>s+r.amount,0);
  const totalCosts=costs.reduce((s,c)=>s+c.amount,0);
  const estPayroll=emps.reduce((s,e)=>s+monthlyEarnings(e.id),0);
  const profit=totalRev-(totalCosts+estPayroll);
  const margin=totalRev>0?((profit/totalRev)*100).toFixed(1):0;
  el.innerHTML=`
  ${ph('Finance & Revenue','Track revenue, costs, payroll and profit margins.')}
  <div class="sg">
    ${sc('bar-chart-2','Total Revenue',fmt(totalRev),'Period','up')}
    ${sc('tag','Operational Costs',fmt(totalCosts),'Period','dn')}
    ${sc('users','Payroll (Earned)',fmt(estPayroll),'Based on hours','dn')}
    ${sc('percent','Profit Margin',margin+'%',profit>=0?`Net: ${fmt(profit)}`:`Loss: ${fmt(Math.abs(profit))}`,profit>=0?'up':'dn')}
  </div>
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('bar-chart-2',15)} Daily Revenue</span><button class="btn b-gr btn-sm" onclick="openAddRev()">+ Add Revenue</button></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Date</th><th>Amount (₵)</th><th>Note</th></tr></thead><tbody>
          ${rev.slice().reverse().map(r=>`<tr><td>${r.date}</td><td><strong>${fmt(r.amount)}</strong></td><td style="color:var(--text-muted)">${r.note||'—'}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('layers',15)} Profit Breakdown</span></div>
      <div class="cb">
        <div style="background:var(--bg);border-radius:10px;padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:9px"><span style="font-size:13px;color:var(--text-muted)">Total Revenue</span><strong class="pfpos">${fmt(totalRev)}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:9px"><span style="font-size:13px;color:var(--text-muted)">Operational Costs</span><strong class="pfneg">– ${fmt(totalCosts)}</strong></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:13px"><span style="font-size:13px;color:var(--text-muted)">Payroll (Earned)</span><strong class="pfneg">– ${fmt(estPayroll)}</strong></div>
          <div style="border-top:2px solid var(--border);padding-top:10px;display:flex;justify-content:space-between;align-items:center">
            <strong style="font-size:14px">Net Profit</strong>
            <strong style="font-size:20px;font-weight:900" class="${profit>=0?'pfpos':'pfneg'}">${fmt(Math.abs(profit))} ${profit>=0?'▲':'▼'}</strong>
          </div>
          <div class="pt" style="margin-top:10px"><div class="pf" style="width:${Math.min(100,Math.max(0,parseFloat(margin)))}%;background:${profit>=0?'var(--accent)':'var(--red)'}"></div></div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Margin: ${margin}%</div>
        </div>
      </div>
    </div>
  </div>
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('tag',15)} Business Costs</span><button class="btn b-nv btn-sm" onclick="openAddCost()">+ Add Cost</button></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead><tbody>
          ${costs.map(c=>`<tr><td><span class="b bn">${c.cat}</span></td><td>${c.desc}</td><td>${fmt(c.amount)}</td><td>${c.date}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('credit-card',15)} Advance Requests</span></div>
      <div class="cb">
        ${advances.length===0?`<p style="font-size:13px;color:var(--text-muted)">No advance requests.</p>`:`
        <div class="tw"><table><thead><tr><th>Employee</th><th>Amount</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>
          ${advances.map((a,i)=>`<tr>
            <td><strong>${a.empName}</strong></td><td>${fmt(a.amount)}</td><td>${a.reason}</td>
            <td><span class="b ${a.status==='pending'?'ba':a.status==='approved'?'bg':'br'}">${a.status}</span></td>
            <td>${a.status==='pending'?`<button class="btn b-gr btn-sm" onclick="resolveAdv(${i},'approved')">Approve</button> <button class="btn b-rd btn-sm" onclick="resolveAdv(${i},'rejected')">Reject</button>`:'—'}</td>
          </tr>`).join('')}
        </tbody></table></div>`}
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('clock',15)} Hourly Payroll</span></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>Employee</th><th>Role</th><th>Rate/hr</th><th>Hours Logged</th><th>Earnings</th></tr></thead><tbody>
        ${emps.map(e=>`<tr><td><strong>${e.name}</strong></td><td>${e.roleTitle}</td><td>${fmt(e.hourlyRate)}/hr</td><td>${totalHours(e.id)} hrs</td><td><strong>${fmt(monthlyEarnings(e.id))}</strong></td></tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function openAddRev(){
  openModal('Add Daily Revenue',`
    <div class="f"><label>Date</label><input type="date" id="rv-d" value="${today()}"></div>
    <div class="f"><label>Amount (₵)</label><input type="number" id="rv-a" placeholder="e.g. 5000"></div>
    <div class="f"><label>Note</label><input type="text" id="rv-n" placeholder="e.g. Sales revenue…"></div>
  `,[{l:'Add Revenue',c:'b-gr',fn:async()=>{
    const a=parseFloat(document.getElementById('rv-a').value);
    if(!a){toast('Enter a valid amount','e');return;}
    const rec={date:document.getElementById('rv-d').value,amount:a,note:document.getElementById('rv-n').value};
    DB.push('revenue',rec);
    closeModal();showPage('e_finance');toast('Revenue added','s');
    try{await apiFetch('POST','/data/revenue',rec);}catch(e){toast('Revenue error: '+e.message,'e');}
  }}]);
}
function openAddCost(){
  openModal('Add Business Cost',`
    <div class="fr">
      <div class="f"><label>Category</label><select id="cs-cat"><option>Rent</option><option>Utilities</option><option>Marketing</option><option>Equipment</option><option>Salaries</option><option>Miscellaneous</option></select></div>
      <div class="f"><label>Amount (₵)</label><input type="number" id="cs-amt" placeholder="0.00"></div>
    </div>
    <div class="f"><label>Description</label><input type="text" id="cs-desc" placeholder="Brief description"></div>
    <div class="f"><label>Date</label><input type="date" id="cs-date" value="${today()}"></div>
  `,[{l:'Add Cost',c:'b-nv',fn:async()=>{
    const rec={cat:document.getElementById('cs-cat').value,desc:document.getElementById('cs-desc').value,amount:parseFloat(document.getElementById('cs-amt').value)||0,date:document.getElementById('cs-date').value};
    const costs=DB.g('costs')||[];costs.push(rec);
    DB.s('costs',costs);closeModal();showPage('e_finance');toast('Cost added','s');
    try{await apiFetch('POST','/data/costs',rec);}catch(e){toast('Cost error: '+e.message,'e');}
  }}]);
}
function resolveAdv(i,dec){
  const a=DB.g('advances')||[];a[i].status=dec;DB.s('advances',a);
  toast(`Advance ${dec}`,'s');showPage('e_finance');updNotif();
  if(a[i].id) apiFetch('PUT',`/data/advances/${a[i].id}`,{status:dec}).catch(()=>{});
}

const TASK_SCORES={easy:10,medium:25,hard:50};
function calcPerf(eid){
  const tasks=DB.g('tasks')||[];
  const empTasks=tasks.filter(t=>t.empId===eid&&t.status!=='cancelled');
  if(empTasks.length===0) return 100;
  let score=100;
  empTasks.forEach(t=>{
    const pts=TASK_SCORES[t.difficulty||'easy'];
    if(t.status==='verified') score+=pts;
    else if(t.status==='overdue'||t.status==='rejected') score-=pts;
  });
  return Math.min(150,Math.max(0,score));
}
function monthlyEarnings(eid){
  const emp=(DB.g('employees')||[]).find(e=>e.id===eid);if(!emp) return 0;
  return (DB.g('attendance')||[]).filter(a=>a.empId===eid&&a.clockIn&&a.clockOut)
    .reduce((s,a)=>s+Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000)*emp.hourlyRate,0);
}
function totalHours(eid){
  return (DB.g('attendance')||[]).filter(a=>a.empId===eid&&a.clockIn&&a.clockOut)
    .reduce((s,a)=>s+Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000),0);
}

// ─── PERFORMANCE ───
function pPerformance(el){
  const emps=DB.g('employees')||[];
  el.innerHTML=`
  ${ph('Performance','Based on tasks completed and attendance recorded.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('trending-up',15)} Performance Scores</span><button class="btn b-nv btn-sm" onclick="openAddTask()">+ Log Task</button></div>
      <div class="cb">
        ${emps.length===0?`<p style="color:var(--text-muted);font-size:13px">No employees yet.</p>`:emps.map(e=>{const s=calcPerf(e.id);return`
        <div class="pr-row">
          <div class="pr-nm">${e.name.split(' ')[0]}</div>
          <div class="pr-tr"><div class="pr-fl" style="width:${Math.min(s,100)}%;background:${perfColor(s)}"></div></div>
          <div class="pr-sc">${s}%</div>
        </div>`}).join('')}
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('award',15)} Ratings</span></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Employee</th><th>Score</th><th>Rating</th></tr></thead><tbody>
          ${emps.map(e=>{const s=calcPerf(e.id);return`<tr><td><strong>${e.name}</strong></td><td><strong>${s}%</strong></td><td><span class="b ${s>=80?'bg':s>=60?'ba':'br'}">${s>=80?'Excellent':s>=60?'Good':'Needs Work'}</span></td></tr>`}).join('')}
        </tbody></table></div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('list',15)} Task Log</span></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>Employee</th><th>Task</th><th>Difficulty</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead><tbody>
        ${(DB.g('tasks')||[]).length===0?`<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No tasks yet</td></tr>`:(DB.g('tasks')||[]).slice().reverse().map((t,i,arr)=>{
          const origIdx=arr.length-1-i;
          const diffCol=t.difficulty==='hard'?'br':t.difficulty==='medium'?'ba':'bg';
          const stCol=t.status==='verified'?'bg':t.status==='awaiting_verification'?'ba':t.status==='rejected'?'br':t.status==='cancelled'?'bn':'b-ol';
          const stLabel=t.status==='awaiting_verification'?'Awaiting Verification':t.status==='verified'?'Verified':t.status==='rejected'?'Rejected':t.status==='cancelled'?'Cancelled':'Pending';
          return`<tr>
            <td>${(DB.g('employees')||[]).find(e=>e.id===t.empId)?.name||t.empId}</td>
            <td><strong>${t.title}</strong>${t.desc?`<div style="font-size:11px;color:var(--text-muted)">${t.desc}</div>`:''}</td>
            <td><span class="b ${diffCol}">${(t.difficulty||'easy').charAt(0).toUpperCase()+(t.difficulty||'easy').slice(1)}</span></td>
            <td><span class="b ${stCol}">${stLabel}</span></td>
            <td>${t.dueDate||'—'}</td>
            <td style="display:flex;gap:4px">
              ${t.status==='awaiting_verification'?`<button class="btn b-gr btn-sm" onclick="verifyTask(${origIdx})">Verify</button><button class="btn b-rd btn-sm" onclick="rejectTask(${origIdx})">Reject</button>`:''}
              ${t.status==='pending'?`<button class="btn b-ol btn-sm" onclick="cancelTask(${origIdx})">Cancel</button>`:''}
            </td>
          </tr>`;
        }).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function openAddTask(){
  const emps=DB.g('employees')||[];
  openModal('Assign Task',`
    <div class="f"><label>Employee</label><select id="tk-emp">${emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
    <div class="f"><label>Task Title</label><input type="text" id="tk-title" placeholder="e.g. Prepare Q2 report"></div>
    <div class="f"><label>Description (optional)</label><textarea id="tk-desc" placeholder="Additional details…"></textarea></div>
    <div class="f"><label>Difficulty</label><select id="tk-diff"><option value="easy">Easy (+10pts)</option><option value="medium">Medium (+25pts)</option><option value="hard">Hard (+50pts)</option></select></div>
    <div class="f"><label>Due Date</label><input type="date" id="tk-due" value="${today()}"></div>
  `,[{l:'Assign Task',c:'b-nv',fn:async()=>{
    const empId=document.getElementById('tk-emp').value;
    const empName=(emps.find(e=>e.id===empId)||{}).name||'';
    const title=document.getElementById('tk-title').value;
    if(!title){toast('Please enter a task title','e');return;}
    const rec={empId,empName,title,desc:document.getElementById('tk-desc').value,difficulty:document.getElementById('tk-diff').value,dueDate:document.getElementById('tk-due').value,status:'pending',assignedDate:today()};
    DB.push('tasks',rec);
    closeModal();showPage('e_performance');toast('Task assigned','s');
    try{
      const r=await apiFetch('POST','/data/tasks',rec);
      if(r.record){const t=DB.g('tasks')||[];const i=t.findIndex(x=>x.empId===rec.empId&&x.title===rec.title&&x.dueDate===rec.dueDate);if(i>=0){t[i].id=r.record.id;DB.s('tasks',t);}}
    }catch(e){toast('Task saved locally','w');}
  }}]);
}
function verifyTask(i){
  const t=DB.g('tasks')||[];
  if(!t[i]||t[i].status!=='awaiting_verification'){toast('Task is not awaiting verification','i');return;}
  if(!confirm('Mark this task as verified?')) return;
  t[i].status='verified';t[i].verifiedDate=today();
  DB.s('tasks',t);showPage('e_performance');
  if(t[i].id) apiFetch('PUT',`/data/tasks/${t[i].id}`,{status:'verified',verifiedDate:today()}).catch(()=>{});
  toast('Task verified','s');
}
function rejectTask(i){
  const t=DB.g('tasks')||[];
  if(!t[i]||t[i].status!=='awaiting_verification'){toast('Task is not awaiting verification','i');return;}
  if(!confirm('Reject this task?')) return;
  t[i].status='rejected';
  DB.s('tasks',t);showPage('e_performance');
  if(t[i].id) apiFetch('PUT',`/data/tasks/${t[i].id}`,{status:'rejected'}).catch(()=>{});
  toast('Task rejected','i');
}
function cancelTask(i){
  const t=DB.g('tasks')||[];
  if(t[i].status==='verified'){toast('Cannot cancel a verified task','i');return;}
  if(!confirm('Cancel this task?')) return;
  t[i].status='cancelled';
  DB.s('tasks',t);showPage('e_performance');
  if(t[i].id) apiFetch('PUT',`/data/tasks/${t[i].id}`,{status:'cancelled'}).catch(()=>{});
  toast('Task cancelled','i');
}

// ─── ATTENDANCE MANAGER ───
function pAttMgr(el){
  const att=DB.g('attendance')||[];
  const wl=DB.g('work_location')||{};
  const todayAtt=att.filter(a=>a.date===today());
  el.innerHTML=`
  ${ph('Attendance Management','Monitor clock-ins and configure the work location geofence.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('map-pin',15)} Work Location</span><button class="btn b-nv btn-sm" onclick="openEditWL()">Edit</button></div>
      <div class="cb">
        <div class="f"><label>Location Name</label><input value="${wl.name||'Not set'}" disabled></div>
        <div class="fr">
          <div class="f"><label>Latitude</label><input value="${wl.lat||'—'}" disabled></div>
          <div class="f"><label>Longitude</label><input value="${wl.lng||'—'}" disabled></div>
        </div>
        <div class="f"><label>Allowed Radius</label><input value="${wl.radius||500} metres" disabled></div>
        <div class="al al-b">${ic('map-pin',13)} Clock-in before 08:00 = <strong>Present</strong>. After 08:00 = <strong>Late</strong>. No clock-in = <strong>Absent</strong>.</div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('clock',15)} Today's Summary</span></div>
      <div class="cb">
        <div class="tw"><table><thead><tr><th>Employee</th><th>In</th><th>Out</th><th>Hrs</th><th>Status</th></tr></thead><tbody>
          ${todayAtt.length===0?`<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No clock-ins today</td></tr>`
          :todayAtt.map(a=>{
            const h=a.clockIn&&a.clockOut?Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000):null;
            return`<tr><td><strong>${a.empName}</strong></td><td>${a.clockIn?new Date(a.clockIn).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'—'}</td><td>${a.clockOut?new Date(a.clockOut).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'Active'}</td><td>${h!==null?h+' h':'—'}</td><td><span class="b ${bDot(a.status)}">${a.status}</span></td></tr>`;
          }).join('')}
        </tbody></table></div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('calendar',15)} Full Attendance Log</span></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>Date</th><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Earnings</th><th>Status</th></tr></thead><tbody>
        ${att.length===0?`<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No records yet</td></tr>`
        :att.slice().reverse().map(a=>{
          const emp=(DB.g('employees')||[]).find(e=>e.id===a.empId);
          const h=a.clockIn&&a.clockOut?Math.floor((new Date(a.clockOut)-new Date(a.clockIn))/3600000):0;
          const earn=emp?h*emp.hourlyRate:0;
          return`<tr><td>${a.date}</td><td><strong>${a.empName}</strong></td>
            <td>${a.clockIn?new Date(a.clockIn).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'—'}</td>
            <td>${a.clockOut?new Date(a.clockOut).toLocaleTimeString('en-GH',{hour:'2-digit',minute:'2-digit'}):'Active'}</td>
            <td>${h} h</td><td>${fmt(earn)}</td>
            <td><span class="b ${bDot(a.status)}">${a.status}</span></td></tr>`;
        }).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function openEditWL(){
  const wl=DB.g('work_location')||{};
  openModal('Edit Work Location',`
    <div class="f"><label>Location Name</label><input type="text" id="wl-nm" value="${wl.name||''}"></div>
    <div class="fr">
      <div class="f"><label>Latitude</label><input type="number" step="any" id="wl-lt" value="${wl.lat||''}"></div>
      <div class="f"><label>Longitude</label><input type="number" step="any" id="wl-lg" value="${wl.lng||''}"></div>
    </div>
    <div class="f"><label>Radius (metres)</label><input type="number" id="wl-r" value="${wl.radius||500}"></div>
    <div class="al al-b">${ic('map-pin',13)} Right-click your office on Google Maps to get coordinates.</div>
  `,[{l:'Save Location',c:'b-nv',fn:()=>{
    const wlData={name:document.getElementById('wl-nm').value,lat:parseFloat(document.getElementById('wl-lt').value)||0,lng:parseFloat(document.getElementById('wl-lg').value)||0,radius:parseInt(document.getElementById('wl-r').value)||500};
DB.s('work_location',wlData);
apiFetch('POST','/settings',{key:'work_location',value:JSON.stringify(wlData)}).catch(()=>{});
closeModal();showPage('e_attendance_mgr');toast('Location updated','s');
  }}]);
}

// ─── EMPLOYEES ───
function pEmployees(el){
  const emps=DB.g('employees')||[];
  const promos=DB.g('promos')||[];
  el.innerHTML=`
  ${ph('Employee Management','Manage all staff members and promotion requests.')}
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('users',15)} All Employees</span><button class="btn b-nv btn-sm" onclick="openAddEmp()">+ Add Employee</button></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Dept</th><th>Rate/hr</th><th>Joined</th><th>Perf</th><th></th></tr></thead><tbody>
        ${emps.length===0?`<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">No employees yet</td></tr>`:emps.map(e=>{const s=calcPerf(e.id);return`<tr>
          <td><span class="b bn">${e.id}</span></td>
          <td><strong>${e.name}</strong></td><td>${e.roleTitle}</td><td>${e.dept}</td>
          <td>${fmt(e.hourlyRate)}</td><td>${e.joinDate}</td>
          <td><span class="b ${s>=80?'bg':s>=60?'ba':'br'}">${s}%</span></td>
          <td><button class="btn b-ol btn-sm" onclick="openEditEmp('${e.id}')">${ic('edit-2',12)}</button></td>
        </tr>`}).join('')}
      </tbody></table></div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('arrow-up',15)} Promotion Requests</span></div>
    <div class="cb">
      ${promos.length===0?`<p style="font-size:13px;color:var(--text-muted)">No promotion requests yet.</p>`:`
      <div class="tw"><table><thead><tr><th>Employee</th><th>Desired Role</th><th>Justification</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
        ${promos.map((p,i)=>`<tr>
          <td><strong>${p.empName}</strong></td><td>${p.desiredRole}</td>
          <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.justification}</td>
          <td>${p.date}</td>
          <td><span class="b ${p.status==='pending'?'ba':p.status==='approved'?'bg':'br'}">${p.status}</span></td>
          <td>${p.status==='pending'?`<button class="btn b-gr btn-sm" onclick="resolvePromo(${i},'approved')">Approve</button> <button class="btn b-rd btn-sm" onclick="resolvePromo(${i},'rejected')">Reject</button>`:'—'}</td>
        </tr>`).join('')}
      </tbody></table></div>`}
    </div>
  </div>`;
}
function openAddEmp(){
  openModal('Add New Employee',`
    <div class="fr"><div class="f"><label>Employee ID</label><input type="text" id="ne-id" placeholder="EMP009"></div><div class="f"><label>Full Name</label><input type="text" id="ne-nm" placeholder="Full name"></div></div>
    <div class="fr"><div class="f"><label>Job Title</label><input type="text" id="ne-rl" placeholder="e.g. Sales Officer"></div><div class="f"><label>Department</label><input type="text" id="ne-dt" placeholder="e.g. Sales"></div></div>
    <div class="fr"><div class="f"><label>Hourly Rate (₵)</label><input type="number" id="ne-rt" placeholder="0.00"></div><div class="f"><label>Start Date</label><input type="date" id="ne-sd"></div></div>
    <div class="fr"><div class="f"><label>Email</label><input type="email" id="ne-em" placeholder="emp@co.com"></div><div class="f"><label>Default Password</label><input type="text" id="ne-pw" value="emp123"></div></div>
  `,[{l:'Add Employee',c:'b-nv',fn:async()=>{
    const id=document.getElementById('ne-id').value.trim();
    const nm=document.getElementById('ne-nm').value.trim();
    if(!id||!nm){toast('ID and Name required','e');return;}
    const emps=DB.g('employees')||[];
    if(emps.find(e=>e.id===id)){toast('Employee ID already exists','e');return;}
    const newEmp={id,name:nm,roleTitle:document.getElementById('ne-rl').value,dept:document.getElementById('ne-dt').value,hourlyRate:parseFloat(document.getElementById('ne-rt').value)||0,joinDate:document.getElementById('ne-sd').value,email:document.getElementById('ne-em').value,active:true};
    emps.push(newEmp);DB.s('employees',emps);
    try{
      const r=await fetch(`${API}/users`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${JWT}`},body:JSON.stringify({...newEmp,role:'employee',password:document.getElementById('ne-pw').value,initials:nm.split(' ').map(n=>n[0]).join('').toUpperCase()})});
      if(!r.ok){const e=await r.json();toast('Sync failed: '+e.error,'e');return;}
    }catch(e){toast('Network error: '+e.message,'e');return;}
    closeModal();showPage('e_employees');toast('Employee added','s');
  }}]);
}
function openEditEmp(eid){
  const emps=DB.g('employees')||[];const emp=emps.find(e=>e.id===eid);
  openModal(`Edit — ${emp.name}`,`
    <div class="fr"><div class="f"><label>Job Title</label><input type="text" id="ee-rl" value="${emp.roleTitle}"></div><div class="f"><label>Department</label><input type="text" id="ee-dt" value="${emp.dept}"></div></div>
    <div class="f"><label>Hourly Rate (₵)</label><input type="number" id="ee-rt" value="${emp.hourlyRate}"></div>
    <div class="f"><label>Email</label><input type="email" id="ee-em" value="${emp.email||''}"></div>
  `,[
    {l:'Save',c:'b-gr',fn:()=>{
      const i=emps.findIndex(e=>e.id===eid);
      emps[i]={...emps[i],roleTitle:document.getElementById('ee-rl').value,dept:document.getElementById('ee-dt').value,hourlyRate:parseFloat(document.getElementById('ee-rt').value)||emp.hourlyRate,email:document.getElementById('ee-em').value};
      DB.s('employees',emps);closeModal();showPage('e_employees');toast('Updated','s');
      if(emps[i].id) apiFetch('PUT',`/users/${emps[i].id}`,{roleTitle:emps[i].roleTitle,dept:emps[i].dept,hourlyRate:emps[i].hourlyRate,email:emps[i].email}).catch(()=>{});
    }},
    {l:'Remove',c:'b-rd',fn:()=>{
      if(confirm(`Remove ${emp.name}?`)){const i=emps.findIndex(e=>e.id===eid);emps.splice(i,1);DB.s('employees',emps);closeModal();showPage('e_employees');toast('Removed','i');if(emp.id) apiFetch('DELETE',`/users/${emp.id}`).catch(()=>{});}
    }},
  ]);
}
function resolvePromo(i,dec){
  const p=DB.g('promos')||[];p[i].status=dec;DB.s('promos',p);
  if(p[i].id) apiFetch('PUT',`/data/promos/${p[i].id}`,{status:dec}).catch(()=>{});
  toast(`Promotion ${dec}`,'s');showPage('e_employees');updNotif();
}

// ─── RECRUITMENT ───
function calcMeritScore(app){
  const eduScore=Math.min(parseInt(app.eduScore)||0, 40);
  const expScore=Math.min(parseInt(app.expScore)||0, 30);
  const coverWords=(app.coverLetter||'').trim().split(/\s+/).filter(Boolean).length;
  const coverScore=Math.min(Math.floor(coverWords/5), 30);
  return Math.min(100, eduScore+expScore+coverScore);
}

function openInterviewNotes(email){
  const apps=DB.g('applicants')||[];
  const a=apps.find(x=>x.email===email);
  if(!a) return;
  openModal(
    `Interview Notes — ${a.name}`,
    `<div style="margin-bottom:8px;font-size:13px;color:var(--text-muted)">
      Score: <strong>${a.score!==undefined?a.score+'/100':'Not ranked yet'}</strong>
      ${a.justification?`<br><em>${a.justification}</em>`:''}
     </div>
     <textarea id="interview-notes-input" rows="6" style="width:100%;padding:8px;
     border:1px solid var(--border);border-radius:8px;background:var(--bg);
     color:var(--text);font-size:13px;resize:vertical"
     placeholder="Record interview observations, impressions, follow-up questions…"
     >${a.interviewNotes||''}</textarea>`,
    [
      {l:'Save Notes',c:'b-nv',fn:()=>saveInterviewNotes(email)},
      {l:'Cancel',c:'b-def',fn:()=>closeModal()}
    ]
  );
}

function saveInterviewNotes(email){
  const notes=document.getElementById('interview-notes-input')?.value||'';
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(x=>x.email===email);
  if(i<0) return;
  apps[i].interviewNotes=notes;
  DB.s('applicants',apps);
  if(apps[i].id) apiFetch('PUT',`/data/applicants/${apps[i].id}`,{interviewNotes:notes}).catch(()=>{});
  closeModal();
  showPage('e_recruitment');
  toast('Interview notes saved','s');
}

function openNegotiationResponse(email){
  const apps=DB.g('applicants')||[];
  const a=apps.find(x=>x.email===email);
  if(!a) return;
  const neg=a.negotiation||{};
  openModal(
    `Counter-offer from ${a.name}`,
    `<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:12px;font-size:13px">
      <div style="margin-bottom:6px"><span style="color:var(--text-muted)">Desired Rate:</span> <strong>${neg.rate||'Not specified'}</strong></div>
      <div style="margin-bottom:6px"><span style="color:var(--text-muted)">Desired Hours:</span> <strong>${neg.hours||'Not specified'}</strong></div>
      <div style="margin-bottom:6px"><span style="color:var(--text-muted)">Desired Benefits:</span> <strong>${neg.benefits||'Not specified'}</strong></div>
      <div><span style="color:var(--text-muted)">Note:</span> <em>${neg.note||'No note provided'}</em></div>
    </div>
    <label style="font-size:13px;font-weight:500;display:block;margin-bottom:6px">Your Response</label>
    <textarea id="neg-response-input" rows="4" style="width:100%;padding:8px;
    border:1px solid var(--border);border-radius:8px;background:var(--bg);
    color:var(--text);font-size:13px;resize:vertical;margin-bottom:10px"
    placeholder="Write your response to the candidate's counter-offer…"></textarea>`,
    [
      {l:'Accept Counter-offer',c:'b-gr',fn:()=>resolveNegotiation(email,'accepted')},
      {l:'Decline Counter-offer',c:'b-rd',fn:()=>resolveNegotiation(email,'rejected')},
      {l:'Cancel',c:'b-def',fn:()=>closeModal()}
    ]
  );
}

function resolveNegotiation(email, decision){
  const response=document.getElementById('neg-response-input')?.value||'';
  if(!response.trim()){toast('Please write a response before deciding.','e');return;}
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(x=>x.email===email);
  if(i<0) return;
  apps[i].offerStatus=decision;
  apps[i].negotiationResponse=response;
  DB.s('applicants',apps);
  if(apps[i].id) apiFetch('PUT',`/data/applicants/${apps[i].id}`,{
    offerStatus:decision,
    negotiationResponse:response
  }).catch(()=>{});
  closeModal();
  showPage('e_recruitment');
  toast(`Counter-offer ${decision} and response saved`,'s');
}

async function rankApplicants(){
  const apps=DB.g('applicants')||[];
  if(apps.length===0){toast('No applicants to rank.','e');return;}
  if(!confirm(`Rank ${apps.length} applicants using AI? This may take a moment.`)) return;

  const jobs=DB.g('job_postings')||[];
  const activeJob=jobs.find(j=>j.status==='active')||jobs[jobs.length-1]||null;
  const jobRequirements=activeJob
    ? `${activeJob.title}: ${activeJob.requirements||''}`.trim()
    : 'General position — score based on overall candidate quality.';

  const btn=document.querySelector('[onclick="rankApplicants()"]');
  const preMerited=apps.map(a=>({...a, merit:a.merit??calcMeritScore(a)}));
  DB.s('applicants', preMerited);
  if(btn){btn.disabled=true;btn.textContent='Ranking…';}
  toast('AI ranking started — please wait…','i');

  const BATCH=3;
  const batches=[];
  for(let i=0;i<apps.length;i+=BATCH) batches.push(apps.slice(i,i+BATCH));

  const allResults=[];
  let totalFailed=0;
  for(let i=0;i<batches.length;i++){
    toast(`Scoring batch ${i+1} of ${batches.length}…`,'i');
    try{
      const res=await apiFetch('POST','/rank',{
        applicants:batches[i],
        jobRequirements
      });
      if(res.results) allResults.push(...res.results);
      if(res.failed) totalFailed+=res.failed;
    }catch(e){
      totalFailed+=batches[i].length;
      toast(`Batch ${i+1} failed: ${e.message}`,'e');
    }
  }

  const ranked=preMerited.map(a=>{
    const r=allResults.find(x=>x.id===a.id);
    if(!r || r.score===null || r.score===undefined) return a;
    return {...a, score:r.score, justification:r.justification};
  });
  DB.s('applicants',ranked);

  const scoredCount=ranked.filter(a=>a.score!==null&&a.score!==undefined).length;
  if(scoredCount===apps.length){
    DB.s('rec_stage','shortlisted');
  } else if(scoredCount>0){
    toast(`Warning: ${totalFailed} applicant(s) could not be scored and were skipped.`,'e');
  } else {
    toast('AI ranking failed — no applicants were scored. Please try again.','e');
    if(btn){btn.disabled=false;btn.textContent='Rank by Merit';}
    return;
  }

  ranked.forEach(a=>{
    if(a.id && typeof a.score==='number' && a.score>=0 && a.score<=100){
      apiFetch('PUT',`/data/applicants/${a.id}`,{
        score:a.score,
        justification:a.justification
      }).catch(()=>{});
    }
  });

  if(btn){btn.disabled=false;btn.textContent='Rank by Merit';}
  showPage('e_recruitment');
  toast(`Ranked ${scoredCount} of ${apps.length} applicants by AI merit score`,'s');
}

function promoteToShortlist(){
  const apps=DB.g('applicants')||[];
  if(apps.length===0){toast('No applications yet.','e');return;}
  const scored=apps.filter(a=>typeof a.score==='number').length;
  const msg=scored>0
    ?`${scored} of ${apps.length} applicants have AI scores. Move to Shortlisting stage?`
    :`No applicants have been AI-scored yet (scores are assigned on submission). Move to Shortlisting anyway?`;
  if(!confirm(msg)) return;
  DB.s('rec_stage','shortlisted');
  showPage('e_recruitment');
  toast('Pipeline moved to Shortlisting stage','s');
}

function inviteTop50(){
  const apps=DB.g('applicants')||[];
  const qs=DB.g('apt_qs')||[];
  if(qs.length===0){
    toast('Please set up aptitude test questions first (click Manage)','e');
    return;
  }
  const scored=apps.filter(a=>typeof a.score==='number');
  const unscored=apps.length-scored.length;
  if(scored.length===0){toast('No AI-scored applicants yet. Scores are assigned automatically when applications are submitted.','e');return;}
  if(unscored>0&&!confirm(`${unscored} applicant(s) have not been AI-scored and will be excluded. Continue?`)) return;
  if(!confirm('Invite the top 50 AI-scored applicants to take the aptitude test?')) return;
  const sorted=scored.slice().sort((a,b)=>b.score-a.score);
  const top50=sorted.slice(0,50);
  const updated=apps.map(a=>{
    const isTop=top50.some(t=>t.id?t.id===a.id:t.email===a.email);
    return isTop?{...a,testInvited:true}:a;
  });
  DB.s('applicants',updated);
  DB.s('rec_stage','testing');
  updated.forEach(a=>{
    if(a.testInvited&&a.id) apiFetch('PUT',`/data/applicants/${a.id}`,{testInvited:true}).catch(()=>{});
  });
  showPage('e_recruitment');
  toast(`${top50.length} applicants invited to aptitude test`,'s');
}

function selectTop10(){
  const apps=DB.g('applicants')||[];
  const tested=apps.filter(a=>typeof a.testScore==='number').sort((a,b)=>b.testScore-a.testScore);
  if(tested.length===0){toast('No test scores yet. Wait for applicants to complete the test.','e');return;}
  if(!confirm('Send employment offers to the top 10 test scorers?')) return;
  const top10=tested.slice(0,10);
  const updated=apps.map(a=>{
    const inTop=top10.some(t=>t.id?t.id===a.id:t.email===a.email);
    return inTop?{...a,invited:true,offerSent:true}:a;
  });
  DB.s('applicants',updated);
  DB.s('rec_stage','interviewing');
  updated.forEach(a=>{
    if(a.invited&&a.id) apiFetch('PUT',`/data/applicants/${a.id}`,{invited:true,offerSent:true}).catch(()=>{});
  });
  showPage('e_recruitment');
  toast(`Offer letters sent to top ${top10.length} candidates`,'s');
}

function sendOffers(){
  const apps=DB.g('applicants')||[];
  const invited=apps.filter(a=>a.invited&&!a.offerSent);
  if(invited.length===0){toast('No candidates pending an offer.','e');return;}

  openModal(
    'Customise & Send Offer Letters',
    `<p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">
      Set the offer details for each candidate. These will appear in their offer letter.
    </p>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${invited.map((a,i)=>`
        <div style="background:var(--bg);border-radius:8px;padding:12px;border:1px solid var(--border)">
          <div style="font-size:13px;font-weight:500;margin-bottom:8px">${escapeHTML(a.name)} — <span style="color:var(--text-muted);font-weight:400">${escapeHTML(a.position)||'General Application'}</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div>
              <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:3px">Offered Salary</label>
              <input id="offer-salary-${i}" type="text" placeholder="e.g. GHS 3,500/month"
              value="${a.offeredSalary||''}"
              style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text);font-size:13px">
            </div>
            <div>
              <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:3px">Start Date</label>
              <input id="offer-date-${i}" type="date"
              value="${a.startDate||''}"
              style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--text);font-size:13px">
            </div>
          </div>
        </div>`).join('')}
    </div>`,
    [
      {l:'Send All Offers',c:'b-pr',fn:()=>confirmSendOffers(invited)},
      {l:'Cancel',c:'b-def',fn:()=>closeModal()}
    ]
  );
}

function confirmSendOffers(invited){
  const apps=DB.g('applicants')||[];
  const updated=apps.map(a=>{
    const idx=invited.findIndex(x=>x.email===a.email);
    if(idx<0) return a;
    const salary=document.getElementById(`offer-salary-${idx}`)?.value||'';
    const date=document.getElementById(`offer-date-${idx}`)?.value||'';
    return {...a,offerSent:true,offeredSalary:salary,startDate:date};
  });
  DB.s('applicants',updated);
  updated.forEach(a=>{
    if(a.offerSent&&a.id) apiFetch('PUT',`/data/applicants/${a.id}`,{
      offerSent:true,
      offeredSalary:a.offeredSalary,
      startDate:a.startDate
    }).catch(()=>{});
  });
  closeModal();
  showPage('e_recruitment');
  toast(`Offer letters sent to ${invited.length} candidates`,'s');
}

function openAptSetup(){
  apiFetch('GET','/data/apt_questions').then(r=>{
    if(r.records) DB.s('apt_qs',r.records);
    _renderAptSetupModal();
  }).catch(()=>_renderAptSetupModal());
}

function _renderAptSetupModal(){
  const qs=DB.g('apt_qs')||[];
  openModal('Manage Aptitude Test Questions',`
    <div style="margin-bottom:12px">
      <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px">Current questions: <strong>${qs.length}</strong>. Candidates who are shortlisted (top 50) will see these questions.</div>
      <button class="btn b-gr btn-sm" onclick="addAptQuestion()">+ Add Question</button>
      <button class="btn b-rd btn-sm" style="margin-left:8px" onclick="clearAptQuestions()">Clear All</button>
    </div>
    <div id="apt-q-list">
      ${qs.length===0?'<p style="color:var(--text-muted);font-size:13px">No questions yet. Add some above.</p>':qs.map((q,i)=>{
        const isSubj=q.type==='subjective';
        const pts=typeof q.points==='number'?q.points:1;
        return`<div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span class="b ${isSubj?'ba':'bb'}" style="font-size:10px">${isSubj?'Subjective':'Objective'}</span>
            <span style="font-size:11px;color:var(--text-muted)">${pts} pt${pts!==1?'s':''}</span>
          </div>
          <div style="font-size:12.5px;font-weight:700;margin-bottom:6px">Q${i+1}: ${escapeHTML(q.q)}</div>
          ${isSubj
            ?'<div style="font-size:11.5px;color:var(--text-muted);font-style:italic">AI-graded written response</div>'
            :`<div style="font-size:11.5px;color:var(--text-muted)">${(q.opts||[]).map((o,oi)=>`${String.fromCharCode(65+oi)}) ${escapeHTML(o)}${oi===q.ans?' ✓':''}`).join(' | ')}</div>`}
          <button class="btn b-rd btn-sm" style="margin-top:8px" onclick="deleteAptQuestion(${i})">Delete</button>
        </div>`;}).join('')}
    </div>
  `,[{l:'Done',c:'b-nv',fn:()=>{closeModal();showPage('e_recruitment');}}]);
}
function addAptQuestion(){
  closeModal();
  openModal('Add Aptitude Question',`
    <div class="f">
      <label>Question Type</label>
      <select id="aq-type" onchange="toggleAptQType(this.value)">
        <option value="objective">Objective (Multiple Choice)</option>
        <option value="subjective">Subjective (Written Answer)</option>
      </select>
    </div>
    <div class="f"><label>Question</label><input type="text" id="aq-q" placeholder="e.g. What is 15% of 200?"></div>
    <div class="f"><label>Points</label><input type="number" id="aq-pts" value="1" min="1" max="10"></div>
    <div id="aq-obj-fields">
      <div class="f"><label>Option A</label><input type="text" id="aq-a"></div>
      <div class="f"><label>Option B</label><input type="text" id="aq-b"></div>
      <div class="f"><label>Option C</label><input type="text" id="aq-c"></div>
      <div class="f"><label>Option D</label><input type="text" id="aq-d"></div>
      <div class="f"><label>Correct Answer</label>
        <select id="aq-ans"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>
      </div>
    </div>
    <div id="aq-subj-fields" style="display:none">
      <div class="al al-b" style="font-size:12px">The AI will grade written answers automatically when candidates submit the test.</div>
    </div>
  `,[{l:'Save Question',c:'b-gr',fn:()=>{
    const qType=document.getElementById('aq-type').value;
    const q=document.getElementById('aq-q').value.trim();
    const pts=Math.min(10,Math.max(1,parseInt(document.getElementById('aq-pts').value)||1));
    if(!q){toast('Question text is required','e');return;}
    let newQ;
    if(qType==='subjective'){
      newQ={q,type:'subjective',points:pts};
    } else {
      const a=document.getElementById('aq-a').value.trim();
      const b=document.getElementById('aq-b').value.trim();
      const c=document.getElementById('aq-c').value.trim();
      const d=document.getElementById('aq-d').value.trim();
      if(!a||!b||!c||!d){toast('Fill all four answer options','e');return;}
      const ans=parseInt(document.getElementById('aq-ans').value);
      newQ={q,type:'objective',opts:[a,b,c,d],ans,points:pts};
    }
    apiFetch('POST','/data/apt_questions',newQ).then(r=>{
      const qs=DB.g('apt_qs')||[];
      qs.push(r.record||newQ);
      DB.s('apt_qs',qs);
      closeModal();
      openAptSetup();
      toast('Question added','s');
    }).catch(()=>toast('Failed to save question','e'));
  }}]);
}

function toggleAptQType(type){
  document.getElementById('aq-obj-fields').style.display=type==='objective'?'block':'none';
  document.getElementById('aq-subj-fields').style.display=type==='subjective'?'block':'none';
}

function deleteAptQuestion(i){
  const qs=DB.g('apt_qs')||[];
  const deleted=qs.splice(i,1)[0];
  DB.s('apt_qs',qs);
  if(deleted?.id) apiFetch('DELETE',`/data/apt_questions/${deleted.id}`).catch(()=>{});
  closeModal();
  openAptSetup();
  toast('Question deleted','i');
}

function clearAptQuestions(){
  if(!confirm('Delete all aptitude questions?')) return;
  const oldQs=DB.g('apt_qs')||[];
  DB.s('apt_qs',[]);
  oldQs.forEach(q=>{if(q.id) apiFetch('DELETE',`/data/apt_questions/${q.id}`).catch(()=>{});});
  closeModal();
  openAptSetup();
  toast('Questions cleared','i');
}

function pRecruitment(el){
  const apps=DB.g('applicants')||[];
  const stage=DB.g('rec_stage')||'collecting';
  const qs=DB.g('apt_qs')||[];
  
  // Safe filtering: only include applicants whose score is actually a number
  const ranked=apps.filter(a=>typeof a.score === 'number').sort((a,b)=>b.score-a.score);
  const tested=apps.filter(a=>typeof a.testScore === 'number').sort((a,b)=>b.testScore-a.testScore);
  const top10=tested.slice(0,10);

  el.innerHTML=`
  ${ph('Recruitment System','Automated end-to-end hiring pipeline.')}
  <div class="steps">
    <div class="si ${stage==='collecting'?'active':['shortlisted','testing','interviewing'].includes(stage)?'done':''}">
      <div class="sn">${stage==='collecting'?'1':'✓'}</div><span class="sl">Applications</span>
    </div>
    <div class="sline ${['shortlisted','testing','interviewing'].includes(stage)?'done':''}"></div>
    <div class="si ${stage==='shortlisted'?'active':['testing','interviewing'].includes(stage)?'done':''}">
      <div class="sn">${['testing','interviewing'].includes(stage)?'✓':'2'}</div><span class="sl">Shortlisting</span>
    </div>
    <div class="sline ${['testing','interviewing'].includes(stage)?'done':''}"></div>
    <div class="si ${stage==='testing'?'active':stage==='interviewing'?'done':''}">
      <div class="sn">${stage==='interviewing'?'✓':'3'}</div><span class="sl">Aptitude Test</span>
    </div>
    <div class="sline ${stage==='interviewing'?'done':''}"></div>
    <div class="si ${stage==='interviewing'?'active':''}">
      <div class="sn">4</div><span class="sl">Interviews & Offers</span>
    </div>
  </div>

  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('bar-chart-2',15)} Pipeline Stats</span></div>
      <div class="cb">
        <div class="sg" style="grid-template-columns:1fr 1fr;margin:0">
          ${sc('send','Applications',apps.length)}
          ${sc('list','Ranked',ranked.length)}
          ${sc('award','Tested',tested.length)}
          ${sc('briefcase','Shortlisted',top10.length)}
        </div>
      </div>
    </div>
    <div class="card mb">
      <div class="ch">
        <span class="ct">${ic('briefcase',15)} Job Postings (${(DB.g('job_postings')||[]).length})</span>
        <button class="btn b-nv btn-sm" onclick="openAddJobPosting()">${ic('plus',13)} Add Posting</button>
      </div>
      <div class="cb">
        ${(DB.g('job_postings')||[]).length===0
          ?`<div class="es"><div class="es-ico">${ic('briefcase',44)}</div><h3>No job postings</h3><p>Add postings to show them on your Careers Portal.</p></div>`
          :`<div class="tw"><table><thead><tr><th>Role</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            ${(DB.g('job_postings')||[]).map((j,i)=>`<tr>
              <td><strong>${escapeHTML(j.title)}</strong><br><small style="color:var(--text-muted)">${escapeHTML(j.dept)||'—'}</small></td>
              <td>${j.type||'Full-time'}</td>
              <td><span class="b ${j.active?'bg':'ba'}">${j.active?'Active':'Paused'}</span></td>
              <td style="display:flex;gap:6px;flex-wrap:wrap">
                <button class="btn b-nv btn-sm" onclick="openEditJobPosting(${i})">${ic('edit-2',12)}</button>
                <button class="btn ${j.active?'b-am':'b-gr'} btn-sm" onclick="toggleJobPosting(${i})">${j.active?'Pause':'Activate'}</button>
                <button class="btn b-rd btn-sm" onclick="deleteJobPosting(${i})">${ic('trash-2',12)}</button>
              </td>
            </tr>`).join('')}
          </tbody></table></div>`}
      </div>
    </div>
  </div>

  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('settings',15)} Aptitude Test</span><button class="btn b-nv btn-sm" onclick="openAptSetup()">Manage (${qs.length} Qs)</button></div>
      <div class="cb">
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px">Set objective (MCQ) and subjective questions. Top 50 AI-scored applicants get invited to test automatically.</p>
        ${qs.length===0?`<div class="al al-a">${ic('alert-triangle',13)} No questions set yet. Add questions before inviting candidates.</div>`:`<div class="al al-g">${ic('check-circle',13)} ${qs.length} question${qs.length!==1?'s':''} ready.</div>`}
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('file-text',15)} Employment Letter</span><button class="btn b-nv btn-sm" onclick="openLetterSetup()">${ic('edit-2',13)} Configure</button></div>
      <div class="cb">
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px">Configure the automated offer letter sent to top candidates after interviews.</p>
        <button class="btn b-gr btn-sm" onclick="previewOfferTemplate()">${ic('external-link',13)} Preview Offer</button>
      </div>
    </div>
  </div>
<div class="card mb">
  <div class="ch">
    <span class="ct">${ic('list',15)} All Applicants (${apps.length})</span>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${stage==='collecting'&&apps.length>0?`<button class="btn b-am btn-sm" onclick="promoteToShortlist()">${ic('award',13)} Move to Shortlisting</button>`:''}
      ${stage==='shortlisted'?`<button class="btn b-bl btn-sm" onclick="inviteTop50()">${ic('send',13)} Invite Top 50 to Test</button>`:''}
      ${stage==='testing'?`<button class="btn b-gr btn-sm" onclick="selectTop10()">${ic('check-circle',13)} Send Offers to Top 10</button>`:''}
      <button class="btn b-ol btn-sm" onclick="resetRecruitment()">${ic('refresh-cw',13)} Reset Pipeline</button>
    </div>
  </div>
  <div class="cb">
    ${apps.length===0?`<div class="es"><div class="es-ico">${ic('search',44)}</div><h3>No applications yet</h3><p>Applicants from the careers portal will appear here.</p></div>`:`
    <div class="tw"><table><thead><tr><th>#</th><th>Applicant</th><th>Education</th><th>Exp</th><th>Merit</th><th>Test</th><th>Offer</th><th>Status</th><th>Notes</th><th>Action</th></tr></thead><tbody>
      ${apps.slice().sort((a,b)=>((b.testScore??b.score??0)-(a.testScore??a.score??0))).map((a,i)=>`<tr style="${i<10&&top10.some(t=>t.email===a.email)?'background:rgba(46,204,113,.05)':''}">
        <td><div class="mn ${i===0?'g':i===1?'s':i===2?'bz':''}">${i+1}</div></td>
        <td><strong>${escapeHTML(a.name)}</strong><br><small style="color:var(--text-muted)">${escapeHTML(a.email)}</small></td>
        <td style="font-size:11px">${escapeHTML(a.education)||'—'}</td>
        <td>${a.experience||0}y</td>
        
        <!-- SAFE RENDER: Check strictly if score is a number -->
        <td>${typeof a.score === 'number' ? `<strong>${a.score}</strong>/100${a.justification?`<br><span style="font-size:11px;color:var(--text-muted)">${escapeHTML(a.justification)}</span>`:''}`
          : typeof a.merit === 'number' ? `<span style="color:var(--text-muted);font-size:12px">${a.merit}/100 (local)</span>`
          : `<span style="color:var(--text-muted)">—</span>`}</td>
          
        <!-- SAFE RENDER: Check strictly if testScore is a number -->
        <td>${typeof a.testScore === 'number' ? `<strong>${a.testScore}/${a.testMax||qs.length}</strong>`:`<span style="color:var(--text-muted)">—</span>`}</td>
        
        <td>${a.offerStatus?`<span class="b ${a.offerStatus==='accepted'?'bg':a.offerStatus==='rejected'?'br':a.offerStatus==='negotiated'?'ba':'bb'}">${a.offerStatus}</span>
  ${a.offerStatus==='negotiated'?`<br><button class="btn btn-sm b-am" style="margin-top:4px" onclick="openNegotiationResponse('${escapeHTML(a.email)}')">${ic('message-square',11)} Respond</button>`:''}
`:'—'}</td>
        <td>${a.invited?`<span class="b bg">Interview</span>`:a.offerSent?`<span class="b bb">Offer Sent</span>`:a.testInvited?`<span class="b bl">Test Invited</span>`:typeof a.score === 'number'?`<span class="b bn">Ranked</span>`:`<span class="b ba">Applied</span>`}</td>
        <td>${a.invited?`<button class="btn btn-sm b-nv" onclick="openInterviewNotes('${escapeHTML(a.email)}')">${ic('edit',12)} Notes${a.interviewNotes?' ✓':''}</button>`:'—'}</td>
        <td>
          ${(DB.g('employees')||[]).some(e=>e.email===a.email)
            ?`<span style="color:var(--accent);font-weight:700;font-size:11px">Hired</span>`
            :typeof a.testScore === 'number'
              ?`<button class="btn b-nv btn-sm" onclick="manualCreateEmployee('${escapeHTML(a.email)}')">Generate User</button>`
              :`<span style="color:var(--text-muted);font-size:11px">${a.testInvited?'Awaiting Test':'Pending'}</span>`}
        </td>
      </tr>`).join('')}
    </tbody></table></div>`}
  </div>
  </div>`;
}

function resetRecruitment(){
  if(!confirm('Reset pipeline stage back to collecting? This does not delete applicants.')) return;
  DB.s('rec_stage','collecting');
  showPage('e_recruitment');
  toast('Pipeline reset to collecting stage','i');
}
