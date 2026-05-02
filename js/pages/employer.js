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
  <div class="g2">
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
    </div>
  </div>`;
}

// ─── NOTIFICATIONS ───
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
      ...awaitingTasks.map(t=>({ico:'check-square',txt:`Task ready to verify: <strong>${t.title}</strong>`,sub:`Employee: ${t.empName} · Submitted: ${t.completedDate||'—'}`,t:'Tasks',go:'e_performance',cls:'b-gr'})),
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

  } else {
    // ── EMPLOYEE NOTIFICATIONS ──
    const myTasks=(DB.g('tasks')||[]).filter(t=>t.empId===CU.id&&t.status==='pending');
    const myLeaves=(DB.g('leaves')||[]).filter(l=>l.empId===CU.id&&(l.status==='approved'||l.status==='rejected')&&!l.empAccepted&&l.status!=='declined');
    const myAdvances=(DB.g('advances')||[]).filter(a=>a.empId===CU.id&&(a.status==='approved'||a.status==='rejected'));
    const myPromos=(DB.g('promos')||[]).filter(p=>p.empId===CU.id&&(p.status==='approved'||p.status==='rejected'));
    const myComplaints=(DB.g('complaints')||[]).filter(c=>c.empId===CU.id&&c.resolved);

    const items=[
      ...myTasks.map(t=>({ico:'check-square',txt:`New task assigned: <strong>${t.title}</strong>`,sub:`Due: ${t.dueDate||'No due date'}`,go:'emp_tasks',cls:'b-am'})),
      ...myLeaves.map(l=>({ico:'calendar',txt:`Your leave request has been <strong>${l.status}</strong>`,sub:`${l.fromDate} → ${l.toDate} · ${l.payStatus||''}`,go:'emp_leave',cls:l.status==='approved'?'b-gr':'b-rd'})),
      ...myAdvances.map(a=>({ico:'credit-card',txt:`Your advance request of ${fmt(a.amount)} was <strong>${a.status}</strong>`,sub:`Requested on ${a.date}`,go:'emp_finance',cls:a.status==='approved'?'b-gr':'b-rd'})),
      ...myPromos.map(p=>({ico:'arrow-up',txt:`Your promotion request was <strong>${p.status}</strong>`,sub:`Applied for: ${p.desiredRole}`,go:'emp_promo',cls:p.status==='approved'?'b-gr':'b-rd'})),
      ...myComplaints.map(c=>({ico:'check-circle',txt:`Your complaint has been <strong>resolved</strong>`,sub:`Subject: ${c.subject}`,go:'emp_complaints',cls:'b-gr'})),
    ];

    el.innerHTML=`
    ${ph('My Notifications','Updates on your requests and assigned tasks.')}
    ${items.length===0?`<div class="es"><div class="es-ico">${ic('bell',44)}</div><h3>All clear!</h3><p>No new notifications.</p></div>`:`
    <div style="display:flex;flex-direction:column;gap:10px">
      ${items.map(n=>`
        <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--card);border-radius:10px;border:1px solid var(--border);cursor:pointer" onclick="showPage('${n.go}')">
          <div style="width:38px;height:38px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;color:var(--navy-lighter);flex-shrink:0">${ic(n.ico,18)}</div>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--text)">${n.txt}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${n.sub||''}</div>
          </div>
          <span class="btn btn-sm ${n.cls}" style="flex-shrink:0">View</span>
        </div>`).join('')}
    </div>`}`;
  }
}

// ─── FINANCE ───
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
    <div class="f"><label>Note</label><input type="text" id="rv-n" placeholder="e.g. Sales revenue, Service fees…"></div>
  `,[{l:'Add Revenue',c:'b-gr',fn:async()=>{
    const a=parseFloat(document.getElementById('rv-a').value);
    if(!a){toast('Enter a valid amount','e');return}
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
  const emp=(DB.g('employees')||[]).find(e=>e.id===eid); if(!emp) return 0;
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
        ${emps.map(e=>{const s=calcPerf(e.id);return`
        <div class="pr-row">
          <div class="pr-nm">${e.name.split(' ')[0]}</div>
          <div class="pr-tr"><div class="pr-fl" style="width:${s}%;background:${perfColor(s)}"></div></div>
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
      // Look for this section inside pPerformance and replace it:

      <div class="tw"><table><thead><tr><th>Employee</th><th>Task</th><th>Difficulty</th><th>Status</th><th>Due</th><th>Actions</th></tr></thead><tbody>
        ${(DB.g('tasks')||[]).slice().reverse().map((t,i,arr)=>{
          // 👇 1. Calculate the correct original index based on the array length
          const origIdx = arr.length - 1 - i; 
          
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
  </div>`;
}
function openAddTask(){
  const emps=DB.g('employees')||[];
  openModal('Assign Task',`
    <div class="f"><label>Employee</label><select id="tk-emp">${emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
    <div class="f"><label>Task Title</label><input type="text" id="tk-title" placeholder="e.g. Prepare Q2 report"></div>
    <div class="f"><label>Description (optional)</label><textarea id="tk-desc" placeholder="Additional details about the task…"></textarea></div>
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
      if(r.record){
        const t=DB.g('tasks')||[];
        const i=t.findIndex(x=>x.empId===rec.empId&&x.title===rec.title&&x.dueDate===rec.dueDate);
        if(i>=0){t[i].id=r.record.id;DB.s('tasks',t);}
      }
    }catch(e){toast('Task saved locally','w');}
  }}]);
}
function verifyTask(i){
  const t=DB.g('tasks')||[];
  if(!t[i]||t[i].status!=='awaiting_verification'){toast('Task is not awaiting verification','i');return;}
  if(!confirm('Mark this task as verified and completed?')) return;
  t[i].status='verified';t[i].verifiedDate=today();
  DB.s('tasks',t);showPage('e_performance');
  if(t[i].id) apiFetch('PUT',`/data/tasks/${t[i].id}`,{status:'verified',verifiedDate:today()}).catch(()=>{});
  toast('Task verified','s');
}
function rejectTask(i){
  const t=DB.g('tasks')||[];
  if(!t[i]||t[i].status!=='awaiting_verification'){toast('Task is not awaiting verification','i');return;}
  if(!confirm('Reject this task submission? This will reduce performance score.')) return;
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
    <div class="al al-b">${ic('map-pin',13)} Get coordinates by right-clicking your office on Google Maps.</div>
  `,[{l:'Save Location',c:'b-nv',fn:()=>{
    DB.s('work_location',{name:document.getElementById('wl-nm').value,lat:parseFloat(document.getElementById('wl-lt').value)||0,lng:parseFloat(document.getElementById('wl-lg').value)||0,radius:parseInt(document.getElementById('wl-r').value)||500});
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
        ${emps.map(e=>{const s=calcPerf(e.id);return`<tr>
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
    if(!id||!nm){toast('ID and Name required','e');return}
    const emps=DB.g('employees')||[];
    if(emps.find(e=>e.id===id)){toast('Employee ID already exists','e');return}
    const newEmp={id,name:nm,roleTitle:document.getElementById('ne-rl').value,dept:document.getElementById('ne-dt').value,hourlyRate:parseFloat(document.getElementById('ne-rt').value)||0,joinDate:document.getElementById('ne-sd').value,email:document.getElementById('ne-em').value,active:true};
    emps.push(newEmp); DB.s('employees',emps);
    // Try to sync to backend
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
function pRecruitment(el){
  const apps=DB.g('applicants')||[];
  const stage=DB.g('rec_stage')||'collecting';
  const qs=DB.g('apt_qs')||[];
  const ranked=apps.filter(a=>a.score!==undefined).sort((a,b)=>b.score-a.score);
  const tested=apps.filter(a=>a.testScore!==undefined).sort((a,b)=>b.testScore-a.testScore);
  const top10=tested.slice(0,10);

  el.innerHTML=`
  ${ph('Recruitment System','Automated end-to-end hiring pipeline.')}
  <div class="steps">
    <div class="si ${stage==='collecting'?'active':'done'}"><div class="sn">${stage==='collecting'?'1':'✓'}</div><span class="sl">Applications</span></div>
    <div class="sline ${['shortlisted','testing','interviewing'].includes(stage)?'done':''}"></div>
    <div class="si ${stage==='shortlisted'?'active':['testing','interviewing'].includes(stage)?'done':''}"><div class="sn">${['testing','interviewing'].includes(stage)?'✓':'2'}</div><span class="sl">Shortlisting</span></div>
    <div class="sline ${['testing','interviewing'].includes(stage)?'done':''}"></div>
    <div class="si ${stage==='testing'?'active':stage==='interviewing'?'done':''}"><div class="sn">${stage==='interviewing'?'✓':'3'}</div><span class="sl">Aptitude Test</span></div>
    <div class="sline ${stage==='interviewing'?'done':''}"></div>
    <div class="si ${stage==='interviewing'?'active':''}"><div class="sn">4</div><span class="sl">Interviews</span></div>
  </div>
  
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('bar-chart-2',15)} Pipeline Stats</span></div>
      <div class="cb">
        <div class="sg" style="grid-template-columns:1fr 1fr;margin:0">
          ${sc('send','Applications',apps.length)}
          ${sc('list','Ranked',ranked.length)}
          ${sc('award','Tested',tested.length)}
          ${sc('briefcase','Invited',top10.length)}
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
          ? `<div class="es"><div class="es-ico">${ic('briefcase',44)}</div><h3>No job postings</h3><p>Add postings to show them on your Careers Portal.</p></div>`
          : `<div class="tw"><table><thead><tr><th>Role</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              ${(DB.g('job_postings')||[]).map((j,i)=>`<tr>
                <td><strong>${j.title}</strong><br><small style="color:var(--text-muted)">${j.dept||'—'}</small></td>
                <td>${j.type||'Full-time'}</td>
                <td><span class="b ${j.active?'bg':'ba'}">${j.active?'Active':'Paused'}</span></td>
                <td style="display:flex;gap:6px;flex-wrap:wrap">
                  <button class="btn b-nv btn-sm" onclick="openEditJobPosting(${i})">${ic('edit-2',12)}</button>
                  <button class="btn ${j.active?'b-am':'b-gr'} btn-sm" onclick="toggleJobPosting(${i})">${j.active?'Pause':'Act.'}</button>
                  <button class="btn b-rd btn-sm" onclick="deleteJobPosting(${i})">${ic('trash-2',12)}</button>
                </td>
              </tr>`).join('')}
            </tbody></table></div>`
        }
      </div>
    </div>
  </div>

  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('settings',15)} Aptitude Test</span><button class="btn b-nv btn-sm" onclick="openAptSetup()">Manage (${qs.length} Qs)</button></div>
      <div class="cb"><p style="font-size:12.5px;color:var(--text-muted)">Set questions with pre-keyed answers for the top-50 shortlisted candidates.</p></div>
    </div>
    
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('file-text',15)} Employment Letter</span><button class="btn b-nv btn-sm" onclick="openLetterSetup()">${ic('edit-2',13)} Configure</button></div>
      <div class="cb">
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px">Configure company details for the automated employment letter sent to top-10 candidates.</p>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn b-gr btn-sm" onclick="previewOfferTemplate()">${ic('external-link',13)} Preview Offer</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb">
    <div class="ch">
      <span class="ct">${ic('list',15)} All Applicants (${apps.length})</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${stage==='collecting'&&apps.length>0?`<button class="btn b-am btn-sm" id="rank-btn" onclick="rankApplicants()">${ic('award',13)} Rank by Merit</button>`:''}
        ${stage==='shortlisted'?`<button class="btn b-bl btn-sm" onclick="inviteTop50()">${ic('send',13)} Invite Top 50</button>`:''}
        ${stage==='testing'?`<button class="btn b-gr btn-sm" onclick="selectTop10()">${ic('check-circle',13)} Select Top 10</button>`:''}
        ${stage==='interviewing'?`<button class="btn b-pr btn-sm" onclick="sendOffers()">${ic('file-text',13)} Send Offers</button>`:''}
      </div>
    </div>
    <div class="cb">
      ${apps.length===0?`<div class="es"><div class="es-ico">${ic('search',44)}</div><h3>No applications yet</h3><p>Applicants from the careers portal will appear here.</p></div>`:`
      <div class="tw"><table><thead><tr><th>#</th><th>Applicant</th><th>Education</th><th>Exp</th><th>Merit</th><th>Test</th><th>Offer</th><th>Status</th><th>Action</th></tr></thead><tbody>
        ${apps.slice().sort((a,b)=>((b.testScore??b.score??0)-(a.testScore??a.score??0))).map((a,i)=>`<tr style="${i<10&&top10.some(t=>t.email===a.email)?'background:rgba(46,204,113,.05)':''}">
          <td><div class="mn ${i===0?'g':i===1?'s':i===2?'bz':''}">${i+1}</div></td>
          <td><strong>${a.name}</strong><br><small style="color:var(--text-muted)">${a.email}</small></td>
          <td style="font-size:11px">${a.education||'—'}</td>
          <td>${a.experience||0}y</td>
          <td>${a.score!==undefined?`<strong>${a.score}</strong>/100`:'<span style="color:var(--text-muted)">—</span>'}</td>
          <td>${a.testScore!==undefined?`<strong>${a.testScore}/${qs.length}</strong>`:'<span style="color:var(--text-muted)">—</span>'}</td>
          <td>${a.offerStatus?`<span class="b ${a.offerStatus==='accepted'?'bg':a.offerStatus==='rejected'?'br':a.offerStatus==='negotiated'?'ba':'bb'}">${a.offerStatus}</span>`:'—'}</td>
          <td>${a.invited?`<span class="b bg">Interview</span>`:a.offerSent?`<span class="b bb">Offer Sent</span>`:a.testInvited?`<span class="b bl">Test Sent</span>`:a.score!==undefined?`<span class="b bn">Ranked</span>`:`<span class="b ba">Applied</span>`}</td>
          <td>
            ${ (DB.g('employees')||[]).some(e => e.email === a.email) 
               ? `<span style="color:var(--accent);font-weight:700;font-size:11px">Hired</span>`
               : (a.testScore !== undefined 
                  ? `<button class="btn b-nv btn-sm" onclick="manualCreateEmployee('${a.email}')">Generate User</button>` 
                  : `<span style="color:var(--text-muted);font-size:11px">Pending Test</span>`)
            }
          </td>
        </tr>`).join('')}
      </tbody></table></div>`}
    </div>
  </div>`;
}  // ─── JOB POSTINGS (Employer) ───
function openAddJobPosting(){
  openModal('Add Job Posting',`
    <div class="fr"><div class="f"><label>Job Title *</label><input type="text" id="jp-title" placeholder="e.g. Marketing Officer"></div><div class="f"><label>Department</label><input type="text" id="jp-dept" placeholder="e.g. Sales"></div></div>
    <div class="fr"><div class="f"><label>Employment Type</label>
      <select id="jp-type"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select>
    </div><div class="f"><label>Location</label><input type="text" id="jp-loc" placeholder="e.g. Accra, Ghana"></div></div>
    <div class="fr"><div class="f"><label>Salary Range (optional)</label><input type="text" id="jp-sal" placeholder="e.g. ₵2,000 – ₵3,500/mo"></div><div class="f"><label>Deadline (optional)</label><input type="date" id="jp-dead"></div></div>
    <div class="f"><label>Job Description *</label><textarea id="jp-desc" placeholder="Describe the role and responsibilities…" rows="4"></textarea></div>
    <div class="f"><label>Requirements</label><textarea id="jp-req" placeholder="List qualifications, skills, experience required…" rows="3"></textarea></div>
  `,[{l:'Post Job',c:'b-gr',fn:async ()=>{
    const title=document.getElementById('jp-title').value.trim();
    const desc=document.getElementById('jp-desc').value.trim();
    if(!title||!desc){toast('Title and Description required','e');return;}
    
    // We package the data exactly how Supabase expects it
    const newJob={
      title: title,
      dept: document.getElementById('jp-dept').value,
      type: document.getElementById('jp-type').value,
      location: document.getElementById('jp-loc').value,
      salary: document.getElementById('jp-sal').value,
      deadline: document.getElementById('jp-dead').value,
      description: desc,
      requirements: document.getElementById('jp-req').value,
      active: true,
      postedDate: today()
    };
    
    try {
      // 1. Try to save to Supabase FIRST
      const r = await apiFetch('POST','/data/job_postings',newJob);
      
      if(r.record){
        // 2. If successful, save to local browser with the real Supabase ID
        const jobs=DB.g('job_postings')||[];
        jobs.push(r.record);
        DB.s('job_postings',jobs);
        
        closeModal();
        showPage('e_recruitment');
        toast('Job posted to Careers Portal successfully!','s');
      }
    } catch(err) {
      // 3. IF IT FAILS, SHOW THE EXACT SUPABASE ERROR!
      alert("Database Error: " + err.message + "\n\nPlease check your Supabase table columns.");
    }
  }}]);
}
function openEditJobPosting(idx){
  const jobs=DB.g('job_postings')||[];const j=jobs[idx];
  openModal('Edit Job Posting',`
    <div class="fr"><div class="f"><label>Job Title</label><input type="text" id="ep-title" value="${j.title}"></div><div class="f"><label>Department</label><input type="text" id="ep-dept" value="${j.dept||''}"></div></div>
    <div class="fr"><div class="f"><label>Employment Type</label>
      <select id="ep-type"><option ${j.type==='Full-time'?'selected':''}>Full-time</option><option ${j.type==='Part-time'?'selected':''}>Part-time</option><option ${j.type==='Contract'?'selected':''}>Contract</option><option ${j.type==='Internship'?'selected':''}>Internship</option><option ${j.type==='Remote'?'selected':''}>Remote</option></select>
    </div><div class="f"><label>Location</label><input type="text" id="ep-loc" value="${j.location||''}"></div></div>
    <div class="fr"><div class="f"><label>Salary Range</label><input type="text" id="ep-sal" value="${j.salary||''}"></div><div class="f"><label>Deadline</label><input type="date" id="ep-dead" value="${j.deadline||''}"></div></div>
    <div class="f"><label>Job Description</label><textarea id="ep-desc" rows="4">${j.description}</textarea></div>
    <div class="f"><label>Requirements</label><textarea id="ep-req" rows="3">${j.requirements||''}</textarea></div>
  `,[{l:'Save Changes',c:'b-gr',fn:()=>{
    jobs[idx]={...jobs[idx],title:document.getElementById('ep-title').value,dept:document.getElementById('ep-dept').value,type:document.getElementById('ep-type').value,location:document.getElementById('ep-loc').value,salary:document.getElementById('ep-sal').value,deadline:document.getElementById('ep-dead').value,description:document.getElementById('ep-desc').value,requirements:document.getElementById('ep-req').value};
    DB.s('job_postings',jobs);
    apiFetch('PUT','/data/job_postings',jobs[idx]).catch(()=>{});
    closeModal();showPage('e_recruitment');toast('Job posting updated','s');
  }}]);
}
function toggleJobPosting(idx){
  const jobs=DB.g('job_postings')||[];
  jobs[idx].active=!jobs[idx].active;
  DB.s('job_postings',jobs);
  apiFetch('PUT','/data/job_postings',jobs[idx]).catch(()=>{});
  showPage('e_recruitment');
  toast(jobs[idx].active?'Job posting activated':'Job posting paused','i');
}
function deleteJobPosting(idx){
  if(!confirm('Delete this job posting?'))return;
  const jobs=DB.g('job_postings')||[];
  const job=jobs[idx];
  jobs.splice(idx,1);
  DB.s('job_postings',jobs);
  showPage('e_recruitment');
  toast('Deleted','i');
  if(job&&job.id) apiFetch('DELETE',`/data/job_postings/${job.id}`).catch(()=>{});
}
function openPublicCareersPreview(){openCareersPortal();}
// ─── OFFER CONFIGURATION ───
function openLetterSetup() {
  const co = DB.g('company') || {};
  openModal('Configure Employment Letter', `
    <div style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid var(--border);">
      <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px;">Business Header Styling</div>
      <div class="f">
        <label>Full Letterhead Banner URL (Optional)</label>
        <input type="text" id="ol-head" value="${co.letterhead||''}" placeholder="e.g., https://yourdomain.com/banner.png">
        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">If provided, this image replaces the default text name/address at the top of the letter.</div>
      </div>
      <div class="fr">
        <div class="f"><label>Company Tagline / Motto</label><input type="text" id="ol-tag" value="${co.tagline||''}" placeholder="e.g., Innovating the Future"></div>
        <div class="f"><label>Registration / TIN No.</label><input type="text" id="ol-reg" value="${co.regNumber||''}" placeholder="e.g., CS1234567"></div>
      </div>
    </div>

    <div class="fr">
      <div class="f"><label>Default Hourly Rate (₵)</label><input type="number" id="ol-rate" value="${co.defaultRate||20}"></div>
      <div class="f"><label>Probation Period</label><input type="text" id="ol-prob" value="${co.probation||'3 months'}"></div>
    </div>
    <div class="fr">
      <div class="f"><label>Work Schedule</label><input type="text" id="ol-sched" value="${co.workSchedule||'Monday – Friday, 8:00 AM – 5:00 PM'}"></div>
      <div class="f"><label>Offer Expiry (Days from now)</label><input type="number" id="ol-exp" value="${co.offerExpiry||7}"></div>
    </div>
    <div class="fr">
      <div class="f"><label>Reporting Manager (Optional)</label><input type="text" id="ol-mgr" value="${co.managerName||''}" placeholder="e.g. Jane Doe"></div>
      <div class="f"><label>Benefits Summary (Optional)</label><input type="text" id="ol-ben" value="${co.benefitsSummary||''}" placeholder="e.g. Health Insurance, PTO"></div>
    </div>
    <div class="f">
      <label>Custom Opening Paragraph (Optional)</label>
      <textarea id="ol-intro" rows="2" placeholder="Leave blank to use the default welcome message...">${co.offerIntro||''}</textarea>
    </div>
    <div class="f">
      <label>Additional Terms & Conditions (Optional)</label>
      <textarea id="ol-terms" rows="2" placeholder="e.g., Must provide valid ID, subject to background check...">${co.offerTerms||''}</textarea>
    </div>
    <div class="fr">
      <div class="f"><label>Signatory Name</label><input type="text" id="ol-sign" value="${co.signatory||'The Director'}"></div>
      <div class="f"><label>Signatory Title</label><input type="text" id="ol-sigt" value="${co.sigTitle||'Managing Director'}"></div>
    </div>
  `, [{
    l: 'Save Configuration', c: 'b-nv', fn: () => {
      const newCo = {
        ...DB.g('company') || {},
        letterhead: document.getElementById('ol-head').value,
        tagline: document.getElementById('ol-tag').value,
        regNumber: document.getElementById('ol-reg').value,
        defaultRate: parseFloat(document.getElementById('ol-rate').value) || 20,
        workSchedule: document.getElementById('ol-sched').value,
        probation: document.getElementById('ol-prob').value,
        offerExpiry: parseInt(document.getElementById('ol-exp').value) || 7,
        managerName: document.getElementById('ol-mgr').value,
        benefitsSummary: document.getElementById('ol-ben').value,
        offerIntro: document.getElementById('ol-intro').value,
        offerTerms: document.getElementById('ol-terms').value,
        signatory: document.getElementById('ol-sign').value,
        sigTitle: document.getElementById('ol-sigt').value
      };
      DB.s('company', newCo);
      closeModal(); 
      showPage('e_recruitment'); 
      toast('Offer configuration saved', 's');
    }
  }]);
}
function previewOfferTemplate() {
  const co = DB.g('company') || {};
  const dummyApp = { name: 'Jane Doe', position: 'Software Engineer' };
  openModal('Preview Employment Letter', generateOfferLetterHTML(dummyApp, co), []);
}

// ═══════════════════════════════════════════════
// ══════════ APPLICANT PORTAL LOGIC ════════════
// ═══════════════════════════════════════════════
async function submitApplication(){
  const pos = document.getElementById('ap-pos').value;
  const edu = document.getElementById('ap-edu').value;
  const exp = document.getElementById('ap-exp').value;
  const ph  = document.getElementById('ap-phone').value;
  const msg = document.getElementById('ap-msg');

  if(!edu || !exp || !ph){ msg.innerHTML='<div class="al al-r">Please fill all fields.</div>'; return; }

  msg.innerHTML = '<div class="al al-b">Submitting application...</div>';

  const updateData = {
    phone: ph,
    position: pos,
    education: edu,
    experience: parseFloat(exp) || 0,
    appliedDate: new Date().toISOString().split('T')[0],
    // Initializing tracking fields
    offerStatus: null,
    invited: false,
    offerSent: false,
    testInvited: false
  };

  try {
    // _cpUser.id is the applicant's ID from signup/login
    const r = await apiFetch('PUT', `/data/applicants/${_cpUser.id}`, updateData);
    
    if(r.record){
      // Update local state
      _cpUser = r.record;
      localStorage.setItem('cp_user', JSON.stringify(_cpUser));
      
      msg.innerHTML = '<div class="al al-g">Application submitted successfully! Redirecting...</div>';
      setTimeout(() => {
        showJobsList(); // Go back to jobs
      }, 2000);
    }
  } catch(e) {
    msg.innerHTML = `<div class="al al-r">Submission Error: ${e.message}</div>`;
  }
}
function loadAptTest(email){
  const qs=DB.g('apt_qs')||[];
  if(qs.length===0){document.getElementById('ap-form-wrap').style.display='none';document.getElementById('ap-done-wrap').style.display='block';return;}
  document.getElementById('ap-form-wrap').style.display='none';
  document.getElementById('ap-test-wrap').style.display='block';
  document.getElementById('ap-test-wrap').dataset.email=email;
  document.getElementById('ap-questions').innerHTML=qs.map((q,i)=>`
    <div style="background:var(--bg);border-radius:9px;padding:14px;margin-bottom:13px">
      <div style="font-size:13px;font-weight:800;margin-bottom:10px">Q${i+1}. ${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${q.opts.map((o,oi)=>`<label style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:2px solid var(--border);border-radius:8px;cursor:pointer;transition:border-color .18s;font-size:13px" onclick="selOpt(this,${i})">
          <input type="radio" name="q${i}" value="${oi}" style="accent-color:var(--navy)">${String.fromCharCode(65+oi)}) ${o}
        </label>`).join('')}
      </div>
    </div>`).join('');
}
function selOpt(lbl,qi){
  lbl.closest('div').querySelectorAll('label').forEach(l=>{l.style.borderColor='var(--border)';l.style.background='';});
  lbl.style.borderColor='var(--navy)'; lbl.style.background='rgba(27,46,75,.04)';
  lbl.querySelector('input').checked=true;
}
function submitAptTest(){
  const qs=DB.g('apt_qs')||[];
  let correct=0;
  qs.forEach((_,i)=>{const sel=document.querySelector(`input[name="q${i}"]:checked`);if(sel&&parseInt(sel.value)===qs[i].ans)correct++;});
  const email=document.getElementById('ap-test-wrap').dataset.email;
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(a=>a.email===email);
  if(i>=0){
    apps[i].testScore=correct;
    DB.s('applicants',apps);
    
    // --- AUTOMATIC PROFILE GENERATION ---
    // If they score perfectly (or you can change the math to be correct >= passing_score)
    if (correct === qs.length && qs.length > 0) {
      createEmployeeFromApplicant(apps[i], true); // TRUE = Silent, candidate doesn't see it
    }
  }
  
  document.getElementById('ap-test-msg').innerHTML=`<div class="al al-g">Test submitted! You scored ${correct}/${qs.length}. We will contact you with next steps.</div>`;
  setTimeout(()=>{document.getElementById('ap-test-wrap').style.display='none';document.getElementById('ap-done-wrap').style.display='block';if(window._portalReturn)setTimeout(backFromPortal,2500);},1500);
}
// ═══════════════════════════════════════════════
// ══════════ OFFER PORTAL LOGIC ════════════════
// ═══════════════════════════════════════════════
function loadOfferPortal(email){
  const apps=DB.g('applicants')||[];
  const app=apps.find(a=>a.email===email)||{name:'Candidate',position:'Position',email};
  const co=DB.g('company')||{};
  const offerHTML=generateOfferLetterHTML(app,co);
  document.getElementById('offer-details-wrap').innerHTML=offerHTML;
  document.getElementById('offer-details-wrap').dataset.email=email;
  document.getElementById('offer-portal-msg').innerHTML='';
  document.getElementById('offer-neg-wrap').style.display='none';
  document.getElementById('offer-action-btns').style.display='flex';
}
function generateOfferLetterHTML(app,co){
  const rate=co.defaultRate||20;
  const schedule=co.workSchedule||'Monday – Friday, 8:00 AM – 5:00 PM';
  const probation=co.probation||'3 months';
  const expiryDays=co.offerExpiry||7;
  
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + expiryDays);
  const formattedExp = expDate.toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const introText = co.offerIntro 
    ? co.offerIntro.replace(/\n/g, '<br>') 
    : `We are pleased to offer you the position of <strong>${app.position}</strong> at <strong>${co.name||'our company'}</strong>. After a thorough review of your application and performance in our aptitude test, we believe you are an excellent fit for our team.`;

  // Build the Header
  let headerBlock = '';
  if (co.letterhead) {
    headerBlock = `<img src="${co.letterhead}" style="width:100%; max-height:130px; object-fit:cover; border-radius:8px 8px 0 0; margin-bottom:14px; display:block">`;
  } else {
    headerBlock = `
      ${co.logo?`<img src="${co.logo}" style="height:50px;margin-bottom:14px;display:block">`:''}
      <div style="font-size:20px;font-weight:900;color:var(--navy);margin-bottom:2px">${co.name||'Company Name'}</div>
      ${co.tagline ? `<div style="font-size:12px; font-style:italic; color:var(--text-muted); margin-bottom:8px">${co.tagline}</div>` : ''}
      <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:4px">${co.address||''} | ${co.phone||''} | ${co.email||''}</div>
      ${co.regNumber ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:18px; font-weight:600;">Reg/TIN: ${co.regNumber}</div>` : '<div style="margin-bottom:18px"></div>'}
    `;
  }

  return`
  <div style="border:2px solid var(--border);border-radius:10px;padding:24px;background:var(--bg)">
    ${headerBlock}
    <hr style="border:none;border-top:1px solid var(--border);margin-bottom:14px">
    <div style="font-size:13.5px;font-weight:800;margin-bottom:12px">OFFER OF EMPLOYMENT</div>
    <p style="font-size:13px;margin-bottom:10px">Dear <strong>${app.name}</strong>,</p>
    <p style="font-size:13px;margin-bottom:10px;line-height:1.5">${introText}</p>
    
    <div style="background:var(--card);border-radius:8px;padding:14px;margin:14px 0">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Position</div><div style="font-size:13px;font-weight:700">${app.position}</div></div>
        <div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Hourly Rate</div><div style="font-size:13px;font-weight:700">${GHS}${rate}/hour</div></div>
        <div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Work Schedule</div><div style="font-size:13px;font-weight:700">${schedule}</div></div>
        <div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Probation Period</div><div style="font-size:13px;font-weight:700">${probation}</div></div>
        ${co.managerName ? `<div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Reporting To</div><div style="font-size:13px;font-weight:700">${co.managerName}</div></div>` : ''}
        ${co.benefitsSummary ? `<div><div style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px">Benefits</div><div style="font-size:13px;font-weight:700">${co.benefitsSummary}</div></div>` : ''}
      </div>
    </div>
    
    <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px">This offer is conditional upon satisfactory completion of reference checks and any pre-employment screening.</p>
    ${co.offerTerms ? `<p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;white-space:pre-wrap;"><strong>Additional Terms:</strong><br>${co.offerTerms}</p>` : ''}
    
    <div class="al al-a" style="margin-top:14px; margin-bottom: 14px;">
      <strong>Offer Expiration:</strong> Please respond to this offer by <strong>${formattedExp}</strong>.
    </div>
    
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)">
      <div style="font-size:13px;font-weight:700">${co.signatory||'The Director'}</div>
      <div style="font-size:12px;color:var(--text-muted)">${co.sigTitle||'Managing Director'}</div>
      <div style="font-size:12px;color:var(--text-muted)">${co.name||''} | ${new Date().toLocaleDateString('en-GH')}</div>
    </div>
  </div>
  <button class="btn b-ol btn-full" style="margin-top:12px" onclick="downloadOfferLetter('${app.name}','${app.position}')">
    ${ic('download',14)} Download Letter (PDF)
  </button>`;
}
function downloadOfferLetter(name,position){
  const co=DB.g('company')||{};
  const expiryDays=co.offerExpiry||7;
  
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + expiryDays);
  const formattedExp = expDate.toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const introText = co.offerIntro 
    ? co.offerIntro.replace(/\n/g, '<br>') 
    : `We are pleased to offer you the position of <strong>${position}</strong> at <strong>${co.name||'our company'}</strong>. After a thorough review of your application and performance in our assessment process, we believe you are an excellent fit for our team.`;

  let headerBlock = '';
  if (co.letterhead) {
    headerBlock = `<img src="${co.letterhead}" style="width:100%; max-height:150px; object-fit:cover; margin-bottom:14px; display:block;">`;
  } else {
    headerBlock = `
      ${co.logo?`<img src="${co.logo}" style="height:60px;margin-bottom:14px">`:''}
      <h1>${co.name||'Company'}</h1>
      ${co.tagline ? `<p style="color:#666; font-size:13px; font-style:italic; margin-top:0; margin-bottom:8px;">${co.tagline}</p>` : ''}
      <p style="color:#666;font-size:12px;margin-top:0;margin-bottom:4px;">${co.address||''} | ${co.phone||''} | ${co.email||''}</p>
      ${co.regNumber ? `<p style="color:#666;font-size:11px;font-weight:bold;margin-top:0;">Reg/TIN: ${co.regNumber}</p>` : ''}
    `;
  }

  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Offer Letter – ${name}</title>
  <style>body{font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:40px auto;font-size:13px;color:#222;line-height:1.6}
  h1{font-size:22px;color:#1b2e4b;margin-bottom:2px;}
  .box{border:1px solid #dde4ee;border-radius:8px;padding:16px;margin:14px 0;background:#f9fbfc}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .lbl{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.6px;margin-bottom:2px}
  .val{font-size:13px;font-weight:700;color:#1b2e4b}
  .footer{margin-top:30px;padding-top:14px;border-top:1px solid #dde4ee}
  .alert{background-color:#fcf8e3;border:1px solid #faebcc;color:#8a6d3b;padding:10px;border-radius:4px;margin-top:15px;}
  @media print{body{margin:20px;max-width:100%}}</style>
  </head><body>
  
  ${headerBlock}
  <hr style="border:none; border-top:1px solid #dde4ee; margin-bottom:20px;">
  
  <h2>OFFER OF EMPLOYMENT</h2>
  <p>Dear <strong>${name}</strong>,</p>
  <p>${introText}</p>
  <div class="box"><div class="grid">
    <div><div class="lbl">Position</div><div class="val">${position}</div></div>
    <div><div class="lbl">Hourly Rate</div><div class="val">₵${co.defaultRate||20}/hour</div></div>
    <div><div class="lbl">Work Schedule</div><div class="val">${co.workSchedule||'Mon–Fri, 8:00 AM – 5:00 PM'}</div></div>
    <div><div class="lbl">Probation Period</div><div class="val">${co.probation||'3 months'}</div></div>
    ${co.managerName ? `<div><div class="lbl">Reporting To</div><div class="val">${co.managerName}</div></div>` : ''}
    ${co.benefitsSummary ? `<div><div class="lbl">Benefits</div><div class="val">${co.benefitsSummary}</div></div>` : ''}
  </div></div>
  <p style="font-size:12px;color:#666">This offer is conditional upon satisfactory completion of reference checks and pre-employment screening. The hourly rate is applied after each completed hour of work.</p>
  ${co.offerTerms ? `<p style="font-size:12px;color:#666;white-space:pre-wrap;"><strong>Additional Terms:</strong><br>${co.offerTerms}</p>` : ''}
  
  <div class="alert">
    <strong>Offer Expiration:</strong> Please respond to this offer by <strong>${formattedExp}</strong>.
  </div>

  <div class="footer">
    <p style="font-weight:700;margin-bottom:2px;">${co.signatory||'The Director'}</p>
    <p style="color:#666;font-size:12px;margin-top:0;">${co.sigTitle||'Managing Director'} | ${co.name||''}</p>
    <p style="color:#666;font-size:12px">Date: ${new Date().toLocaleDateString('en-GH')}</p>
  </div>
  </body></html>`);
  w.document.close(); setTimeout(()=>w.print(),500);
}
async function respondOffer(decision){
  const email=document.getElementById('offer-details-wrap').dataset.email;
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(a=>a.email===email);
  if(i>=0){apps[i].offerStatus=decision;DB.s('applicants',apps);}
  const msg=document.getElementById('offer-portal-msg');
  document.getElementById('offer-action-btns').style.display='none';
  document.getElementById('offer-neg-wrap').style.display='none';
  if(decision==='accept'){
    // Added 'true' here to silently generate the profile
    await createEmployeeFromApplicant(apps[i], true);
    msg.innerHTML=`<div class="al al-g"><strong>Offer Accepted!</strong> Welcome to the team. Your login credentials have been generated and will be shared with you. ${ic('check-circle',15)}</div>`;
  } else {
    msg.innerHTML=`<div class="al al-r">You have declined this offer. Thank you for your time. We wish you success in your job search.</div>`;
  }
  setTimeout(()=>{if(window._portalReturn)backFromPortal();},4000);
}
async function createEmployeeFromApplicant(app, isSilent = false){
  const emps = DB.g('employees') || [];
  
  // Prevent duplicate accounts if they were already generated
  if(emps.find(e => e.email === app.email)) {
    if(!isSilent) toast('Account already exists for this candidate', 'i');
    return;
  }
  
  const newId = 'EMP' + (emps.length + 1 + 10).toString().padStart(3, '0');
  const pw = 'pass' + Math.random().toString(36).substr(2, 6);
  const co = DB.g('company') || {};
  
  const newEmp = {
    id: newId, name: app.name, roleTitle: app.position, dept: 'New Hire',
    hourlyRate: co.defaultRate || 20, joinDate: today(), email: app.email,
    active: true, role: 'employee',
    initials: app.name.split(' ').map(n => n[0]).join('').toUpperCase()
  };
  
  emps.push({ ...newEmp, tempPassword: pw });
  DB.s('employees', emps);
  
  try {
    await apiFetch('POST', '/users', { ...newEmp, password: pw });
  } catch(e) {
    console.error('Failed to create Supabase account for new hire:', e);
  }
  
  const newCreds = DB.g('new_hires') || [];
  newCreds.push({ id: newId, name: app.name, email: app.email, password: pw, date: today() });
  DB.s('new_hires', newCreds);
  
  // Only show the toast to the Admin, NOT the candidate
  if(!isSilent) {
    toast(`Profile generated for ${app.name}! Check settings for credentials.`, 's');
  }
}

// Function for the Admin to manually trigger profile creation
function manualCreateEmployee(email) {
  const apps = DB.g('applicants') || [];
  const app = apps.find(a => a.email === email);
  if(!app) { toast('Applicant not found', 'e'); return; }
  
  createEmployeeFromApplicant(app, false); // Admin sees the toast
  showPage('e_recruitment'); // Refresh the view
}
function toggleNeg(){
  const wrap=document.getElementById('offer-neg-wrap');
  wrap.style.display=wrap.style.display==='none'?'block':'none';
}
function submitNegotiation(){
  const email=document.getElementById('offer-details-wrap').dataset.email;
  const rate=document.getElementById('neg-rate').value;
  const hours=document.getElementById('neg-hours').value;
  const benefits=Array.from(document.getElementById('neg-benefits').selectedOptions).map(o=>o.value);
  const note=document.getElementById('neg-note').value;
  const apps=DB.g('applicants')||[];
  const i=apps.findIndex(a=>a.email===email);
  if(i>=0){apps[i].offerStatus='negotiated';apps[i].negotiation={rate,hours,benefits,note};DB.s('applicants',apps);}
  document.getElementById('offer-portal-msg').innerHTML='<div class="al al-b">Counter-offer sent to the employer. We will review and respond shortly.</div>';
  document.getElementById('offer-neg-wrap').style.display='none';
  document.getElementById('offer-action-btns').style.display='none';
  updNotif();
  setTimeout(()=>{if(window._portalReturn)backFromPortal();},3000);
}

// ─── LEAVES ───
function pLeaves(el){
  const leaves=DB.g('leaves')||[];
  el.innerHTML=`
  ${ph('Leave Management','Review, manage and respond to leave requests.')}
  <div class="sg">
    ${sc('calendar','Total Requests',leaves.length)}
    ${sc('clock','Pending',leaves.filter(l=>l.status==='pending').length,'','dn')}
    ${sc('check-circle','Approved',leaves.filter(l=>l.status==='approved').length,'','up')}
    ${sc('alert-triangle','Rejected',leaves.filter(l=>l.status==='rejected').length)}
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('calendar',15)} All Leave Requests</span></div>
    <div class="cb">
      ${leaves.length===0?`<div class="es"><div class="es-ico">${ic('calendar',44)}</div><h3>No leave requests</h3><p>Employee leave requests will appear here.</p></div>`:`
      <div class="tw"><table><thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>
        ${leaves.map((l,i)=>`<tr>
          <td><strong>${l.empName}</strong></td>
          <td><span class="b bb">${l.type}</span></td>
          <td>${l.fromDate}</td><td>${l.toDate}</td><td>${l.days||'—'}</td>
          <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.reason}</td>
          <td><span class="b ${l.status==='pending'?'ba':l.status==='approved'?'bg':'br'}">${l.status}</span></td>
          <td>${l.status==='pending'?`<button class="btn b-gr btn-sm" onclick="respondLeave(${i})">Respond</button>`:`${l.payStatus?`<span class="b ${l.payStatus==='paid'?'bg':'ba'}">${l.payStatus}</span>`:'—'}`}</td>
        </tr>`).join('')}
      </tbody></table></div>`}
    </div>
  </div>`;
}
function respondLeave(i){
  const leaves=DB.g('leaves')||[];const l=leaves[i];
  const from=new Date(l.from),to=new Date(l.to);
  const days=Math.ceil((to-from)/(1000*3600*24))+1;
  openModal(`Leave Response — ${l.empName}`,`
    <div class="al al-b">Request: <strong>${l.type}</strong> | ${l.fromDate} to ${l.toDate} (${days} day${days>1?'s':''})</div>
    <div class="f"><label>Decision</label><select id="lv-dec"><option value="approved">Approve</option><option value="rejected">Reject</option></select></div>
    <div class="f"><label>Pay Status</label><select id="lv-pay"><option value="paid">Paid Leave</option><option value="unpaid">Unpaid Leave</option><option value="half-pay">Half Pay</option></select></div>
    <div class="f"><label>Terms / Notes for Employee</label><textarea id="lv-terms" placeholder="e.g. Approved for 5 days paid leave. Please ensure handover is completed before departure…"></textarea></div>
    <div class="f"><label>Conditions (optional)</label><input type="text" id="lv-cond" placeholder="e.g. Subject to project handover completion"></div>
  `,[{l:'Send Response',c:'b-gr',fn:()=>{
    const dec=document.getElementById('lv-dec').value;
    const updated={...l,status:dec,payStatus:document.getElementById('lv-pay').value,terms:document.getElementById('lv-terms').value,conditions:document.getElementById('lv-cond').value,days,respondedDate:today()};
    leaves[i]=updated;
    DB.s('leaves',leaves);
    if(updated.id) apiFetch('PUT',`/data/leaves/${updated.id}`,{status:dec,payStatus:updated.payStatus,terms:updated.terms,conditions:updated.conditions,days,respondedDate:updated.respondedDate}).catch(()=>{});
    closeModal();showPage('e_leaves');toast(`Leave ${dec}`,'s');updNotif();
  }}]);
}

// ─── BENEFITS ───
function pBenefits(el){
  const benefits=DB.g('benefits')||[];
  const emps=DB.g('employees')||[];
  el.innerHTML=`
  ${ph('Benefits Management','Control which benefits are assigned to each employee.')}
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('gift',15)} Benefits Catalog</span><button class="btn b-nv btn-sm" onclick="openAddBenefit()">+ Add Benefit</button></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>Benefit</th><th>Value / Description</th><th>Assigned To</th><th>Action</th></tr></thead><tbody>
        ${benefits.map((b,i)=>`<tr>
          <td><strong>${b.name}</strong></td>
          <td>${b.value}</td>
          <td>
            ${b.empIds&&b.empIds.length>0
              ?b.empIds.map(eid=>{const e=emps.find(x=>x.id===eid);return e?`<span class="b bn" style="margin:1px">${e.name.split(' ')[0]}</span>`:''}).join(' ')
              :'<span style="color:var(--text-muted);font-size:12px">None assigned</span>'}
          </td>
          <td><button class="btn b-ol btn-sm" onclick="openEditBenefit(${i})">Assign / Edit</button></td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function openAddBenefit(){
  openModal('Add New Benefit',`
    <div class="f"><label>Benefit Name</label><input type="text" id="nb-nm" placeholder="e.g. Meal Allowance"></div>
    <div class="f"><label>Value / Description</label><input type="text" id="nb-vl" placeholder="e.g. ₵150/month"></div>
  `,[{l:'Add Benefit',c:'b-nv',fn:()=>{
    const benefits=DB.g('benefits')||[];
    benefits.push({id:Date.now(),name:document.getElementById('nb-nm').value,value:document.getElementById('nb-vl').value,empIds:[]});
    DB.s('benefits',benefits);closeModal();showPage('e_benefits');toast('Benefit added','s');
  }}]);
}
function openEditBenefit(i){
  const benefits=DB.g('benefits')||[];const b=benefits[i];
  const emps=DB.g('employees')||[];
  openModal(`${b.name} — Assign Employees`,`
    <div class="f"><label>Benefit Value</label><input type="text" id="eb-vl" value="${b.value}"></div>
    <div class="f"><label>Assign to Employees</label>
      <select id="eb-emps" multiple style="height:130px">
        ${emps.map(e=>`<option value="${e.id}" ${(b.empIds||[]).includes(e.id)?'selected':''}>${e.name} (${e.roleTitle})</option>`).join('')}
      </select>
      <small style="font-size:11px;color:var(--text-muted)">Hold Ctrl / ⌘ to select multiple</small>
    </div>
  `,[{l:'Save',c:'b-gr',fn:()=>{
    const sel=Array.from(document.getElementById('eb-emps').selectedOptions).map(o=>o.value);
    benefits[i]={...b,value:document.getElementById('eb-vl').value,empIds:sel};
    DB.s('benefits',benefits);closeModal();showPage('e_benefits');toast('Benefits updated','s');
  }}]);
}

// ─── COMPLAINTS ───
function pComplaints(el){
  const complaints=DB.g('complaints')||[];
  el.innerHTML=`
  ${ph('Complaints & Suggestions','All submissions from employees.')}
  ${complaints.length===0?`<div class="es"><div class="es-ico">${ic('message-square',44)}</div><h3>No submissions yet</h3><p>Employee complaints and suggestions will appear here.</p></div>`:`
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('message-square',15)} All Submissions (${complaints.length})</span></div>
    <div class="cb">
      <div class="tw"><table><thead><tr><th>From</th><th>Type</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
        ${complaints.map((c,i)=>`<tr>
          <td><strong>${c.empName}</strong></td>
          <td><span class="b ${c.type==='Complaint'?'br':'bb'}">${c.type}</span></td>
          <td>${c.subject}</td>
          <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--text-muted)">${c.message}</td>
          <td>${c.date}</td>
          <td><span class="b ${c.resolved?'bg':'ba'}">${c.resolved?'Resolved':'Pending'}</span></td>
          <td>${!c.resolved?`<button class="btn b-gr btn-sm" onclick="resolveComp(${i})">Resolve</button>`:'—'}</td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`}`;
}
function resolveComp(i){
  const c=DB.g('complaints')||[];c[i].resolved=true;DB.s('complaints',c);
  if(c[i].id) apiFetch('PUT',`/data/complaints/${c[i].id}`,{resolved:true}).catch(()=>{});
  showPage('e_complaints');toast('Marked resolved','s');
}

// ─── SETTINGS ───
function pSettings(el){
  const co=DB.g('company')||{};
  const as=DB.g('att_settings')||{};
  el.innerHTML=`
  ${ph('Settings','System configuration and preferences.')}
  <div class="g2">
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('briefcase',15)} Business Info</span></div>
      <div class="cb">
        <div class="f"><label>Business Name</label><input type="text" id="s-nm" value="${co.name||'My Business Ltd'}"></div>
        <div class="f"><label>Email</label><input type="email" id="s-em" value="${co.email||''}"></div>
        <div class="f"><label>Phone</label><input type="text" id="s-ph" value="${co.phone||''}"></div>
        <div class="f"><label>Address</label><input type="text" id="s-ad" value="${co.address||''}"></div>
        <button class="btn b-nv" onclick="saveBizInfo()">Save</button>
      </div>
    </div>
    <div class="card mb">
      <div class="ch"><span class="ct">${ic('lock',15)} Security</span></div>
      <div class="cb">
        <div class="f"><label>Current Password</label><input type="password" id="s-cp" placeholder="Current password"></div>
        <div class="f"><label>New Password</label><input type="password" id="s-np" placeholder="New password"></div>
        <div class="f"><label>Confirm Password</label><input type="password" id="s-cnp" placeholder="Confirm new password"></div>
        <button class="btn b-am" onclick="changeAdminPw()">Update Password</button>
        <div id="s-pw-msg" style="margin-top:9px"></div>
      </div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('shield',15)} Employee Credentials</span><button class="btn b-nv btn-sm" onclick="showCredentials()">View All Credentials</button></div>
    <div class="cb">
      <p style="font-size:12.5px;color:var(--text-muted)">View login credentials for all active employees. Use this to onboard new staff or reset passwords.</p>
      <div id="creds-table"></div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('map-pin',15)} Attendance Settings</span></div>
    <div class="cb">
      <div class="f"><label>Office Address (display only)</label><input type="text" id="att-addr" placeholder="e.g. 12 Independence Ave, Accra" value="${as.work_address||''}"></div>
      <div class="fr">
        <div class="f"><label>Latitude</label><input type="number" step="any" id="att-lat" placeholder="e.g. 5.6037" value="${as.work_lat||''}"></div>
        <div class="f"><label>Longitude</label><input type="number" step="any" id="att-lng" placeholder="e.g. -0.1870" value="${as.work_lng||''}"></div>
        <div class="f"><label>Allowed Radius (metres)</label><input type="number" id="att-rad" placeholder="e.g. 100" value="${as.work_radius||'100'}"></div>
      </div>
      <div class="fr">
        <div class="f"><label>Shift Start Time</label><input type="time" id="att-start" value="${as.shift_start||'08:00'}"></div>
        <div class="f"><label>Shift End Time</label><input type="time" id="att-end" value="${as.shift_end||'17:00'}"></div>
      </div>
      <button class="btn b-nv" style="margin-top:4px" onclick="getCurrentLocation()">${ic('map-pin',14)} Use My Current Location</button>
      <button class="btn b-gr" style="margin-top:4px;margin-left:8px" onclick="saveAttSettings()">${ic('save',14)} Save Attendance Settings</button>
      <div id="att-msg" style="margin-top:10px"></div>
    </div>
  </div>
  <div class="card mb">
    <div class="ch"><span class="ct">${ic('alert-triangle',15)} Data Management</span></div>
    <div class="cb" style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn b-ol" onclick="clearTable('applicants')">Clear Applicants</button>
      <button class="btn b-ol" onclick="clearTable('complaints')">Clear Complaints</button>
      <button class="btn b-ol" onclick="clearTable('attendance')">Clear Attendance</button>
      <button class="btn b-rd" onclick="if(confirm('RESET ALL DATA? This cannot be undone.')){['costs','revenue','inventory','tasks','attendance','leaves','advances','promos','complaints','applicants'].forEach(t=>apiFetch('POST','/data/'+t+'/bulk',{records:[]}).catch(()=>{}));localStorage.clear();location.reload();}">Reset All Data</button>
    </div>
  </div>`;
}
async function clearTable(table){
  const labels={applicants:'all applicants',complaints:'all complaints',attendance:'attendance'};
  if(!confirm(`Clear ${labels[table]||table}?`)) return;
  try{
    await apiFetch('POST',`/data/${table}/bulk`,{records:[]});
    if(table==='applicants') DB.s('rec_stage','collecting');
    DB.s(table,[]);
    toast('Cleared','i');
    showPage('e_settings');
  }catch(e){
    console.error('Remote clear failed:',e);
    toast('Clear failed — database not updated','e');
  }
}
function getCurrentLocation(){
  const msg=document.getElementById('att-msg');
  msg.innerHTML='<div class="al al-b">Getting your location…</div>';
  if(!navigator.geolocation){
    msg.innerHTML='<div class="al al-r">Geolocation is not supported by your browser.</div>';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      document.getElementById('att-lat').value=pos.coords.latitude.toFixed(6);
      document.getElementById('att-lng').value=pos.coords.longitude.toFixed(6);
      msg.innerHTML=`<div class="al al-g">Location captured: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}</div>`;
    },
    err=>{
      msg.innerHTML=`<div class="al al-r">Could not get location: ${err.message}</div>`;
    },
    {enableHighAccuracy:true,timeout:10000}
  );
}

async function saveAttSettings(){
  const msg=document.getElementById('att-msg');
  const lat=parseFloat(document.getElementById('att-lat').value)||0;
  const lng=parseFloat(document.getElementById('att-lng').value)||0;
  const rad=parseInt(document.getElementById('att-rad').value)||100;
  const start=document.getElementById('att-start').value;
  const end=document.getElementById('att-end').value;
  const addr=document.getElementById('att-addr').value;
  if(isNaN(lat)||isNaN(lng)){msg.innerHTML='<div class="al al-r">Please enter or capture a valid location.</div>';return;}
  if(!start||!end){msg.innerHTML='<div class="al al-r">Please set shift start and end times.</div>';return;}
  try{
    await apiFetch('POST','/settings',{
      work_lat:lat,
      work_lng:lng,
      work_radius:rad,
      shift_start:start,
      shift_end:end,
      work_address:addr
    });
    const current=DB.g('att_settings')||{};
    DB.s('att_settings',{...current,work_lat:String(lat),work_lng:String(lng),work_radius:String(rad),shift_start:start,shift_end:end,work_address:addr});
    msg.innerHTML='<div class="al al-g">Attendance settings saved successfully.</div>';
  }catch(e){
    msg.innerHTML=`<div class="al al-r">Failed to save: ${e.message}</div>`;
  }
}
function saveBizInfo(){
  const co=DB.g('company')||{};
  DB.s('company',{...co,name:document.getElementById('s-nm').value,email:document.getElementById('s-em').value,phone:document.getElementById('s-ph').value,address:document.getElementById('s-ad').value});
  toast('Business info saved','s');
}
async function changeAdminPw(){
  const cp=document.getElementById('s-cp').value;
  const np=document.getElementById('s-np').value;
  const cnp=document.getElementById('s-cnp').value;
  const msg=document.getElementById('s-pw-msg');
  if(!cp||!np){msg.innerHTML=`<div class="al al-r">Fill all fields.</div>`;return;}
  if(np!==cnp){msg.innerHTML=`<div class="al al-r">Passwords do not match.</div>`;return;}
  try{
    await apiFetch('POST','/change-password',{currentPassword:cp,newPassword:np});
    msg.innerHTML=`<div class="al al-g">Password updated successfully.</div>`;
  }catch(e){msg.innerHTML=`<div class="al al-r">${e.message}</div>`;}
}
function showCredentials(){
  const emps=DB.g('employees')||[];
  document.getElementById('creds-table').innerHTML=`
  <div class="tw" style="margin-top:14px"><table><thead><tr><th>Employee ID</th><th>Name</th><th>Email</th></tr></thead><tbody>
    ${emps.map(e=>`<tr><td><span class="b bn">${e.id}</span></td><td>${e.name}</td><td>${e.email || '—'}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="al al-b" style="margin-top:10px">Passwords are securely hidden. If an employee forgets their password, reset it in the database.</div>`;
}
