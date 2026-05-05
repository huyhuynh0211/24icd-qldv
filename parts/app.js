// ===== UTILITIES =====
function $(s){return document.querySelector(s)}
function $$(s){return document.querySelectorAll(s)}
function showToast(msg,type='success'){
  const t=document.createElement('div');
  t.className='toast '+type;
  t.textContent=msg;
  $('#toastContainer').appendChild(t);

  // Trigger entrance animation
  setTimeout(() => {
    t.classList.add('show');
  }, 10);

  // Auto remove after 3 seconds with exit animation
  setTimeout(()=>{
    t.style.animation = 'toastExit 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    setTimeout(() => {
      if(t.parentNode) t.remove();
    }, 400);
  }, 3000);
}
function openModal(id){
  const modal = $('#'+id);
  modal.classList.add('show');

  // Add slight delay to ensure proper animation sequence
  setTimeout(() => {
    if(modal.querySelector('.modal')) {
      modal.querySelector('.modal').style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }, 10);
}

function closeModal(id){
  const modal = $('#'+id);
  if(modal.querySelector('.modal')) {
    modal.querySelector('.modal').style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  // Add exit animation before removing show class
  if(modal.classList.contains('show')) {
    setTimeout(() => {
      modal.classList.remove('show');
    }, 10);
  } else {
    modal.classList.remove('show');
  }
}
function getCatLabel(c){return{['nghi-quyet']:'Nghị quyết',['hoc-tap']:'Học tập CT',['phong-trao']:'Phong trào',['hanh-chinh']:'Hành chính'}[c]||c}
const TYPE_ICONS={pdf:'📄',docx:'📘',pptx:'📊',img:'🖼️'};
const STATUS_MAP={active:{l:'Hoạt động',c:'badge-ok'},paused:{l:'Tạm hoãn',c:'badge-warn'},expired:{l:'Hết hạn',c:'badge-danger'}};
const MONTHS=['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
let memberPage=1,memberSort={key:'name',asc:true},editingMemberId=null,charts={};
function setMemberPage(n){memberPage=n;renderMembers()}

// ===== AUTH =====
function doLogin(user,pass){
  const acc=ACCOUNTS[user];
  if(!acc||acc.pass!==pass)return false;
  currentUser={username:user,...acc};
  $('#loginPage').classList.add('hidden');
  $('#appLayout').style.display='flex';
  document.body.classList.toggle('role-admin',acc.role==='admin');
  $('#headerUserName').textContent=acc.name+' ('+acc.role+')';
  $('#headerAvatar').textContent=acc.name.substring(0,2).toUpperCase();
  initApp();return true;
}
function demoLogin(type){
  if(type==='admin')doLogin('admin','admin123');
  else doLogin('doanvien','user123');
}
function logout(){
  currentUser=null;
  $('#loginPage').classList.remove('hidden');
  $('#appLayout').style.display='none';
  document.body.classList.remove('role-admin');
  destroyCharts();
}
$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const u=$('#loginUser').value.trim(),p=$('#loginPass').value;
  if(!u||!p){$('#loginError').textContent='Vui lòng nhập đầy đủ';return}
  if(!doLogin(u,p))$('#loginError').textContent='Sai tên đăng nhập hoặc mật khẩu';
});
$('#logoutBtn').addEventListener('click',logout);

// ===== NAVIGATION =====
$$('.nav-item[data-page]').forEach(item=>{
  item.addEventListener('click',()=>{
    $$('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    $$('.page').forEach(p=>p.classList.remove('active'));
    $('#page-'+item.dataset.page).classList.add('active');
    if(item.dataset.page==='dashboard')initDashCharts();
    if(item.dataset.page==='reports')initReportCharts();
    closeSidebar();
  });
});
$('#navUpload').addEventListener('click',()=>openModal('uploadModal'));
$('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarOverlay').classList.add('show')});
function closeSidebar(){$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('show')}
$('#sidebarOverlay').addEventListener('click',closeSidebar);
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-overlay.show').forEach(m=>m.classList.remove('show'))});

// ===== DASHBOARD =====
function animateValue(element, start, end, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out function for smoother animation
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(start + (end - start) * easedProgress);

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end.toLocaleString();
      element.style.animation = 'counterUp 0.3s ease-out';
    }
  }

  requestAnimationFrame(update);
}

function renderDashStats(){
  const active=MEMBERS.filter(m=>m.status==='active').length;
  const upcoming=EVENTS.filter(e=>e.status==='upcoming'||e.status==='ongoing').length;

  // Create stat cards with animated values
  $('#dashStats').innerHTML=[
    {icon:'👥',val:MEMBERS.length,label:'Tổng Đoàn viên',change:'↑ Chi đoàn: 4'},
    {icon:'✅',val:active,label:'Đang hoạt động',change:Math.round(active/MEMBERS.length*100)+'%'},
    {icon:'📅',val:upcoming,label:'Sự kiện sắp tới',change:EVENTS.filter(e=>e.status==='done').length+' đã hoàn thành'},
    {icon:'📄',val:DOCUMENTS.length,label:'Tài liệu số hóa',change:'↑ Đa dạng danh mục'}
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value" data-value="${s.val}">0</div><div class="stat-label">${s.label}</div><div class="stat-change up">${s.change}</div></div>`).join('');

  // Animate the values after a short delay
  setTimeout(() => {
    $$('.stat-value').forEach((element, index) => {
      const targetValue = parseInt(element.getAttribute('data-value'));
      animateValue(element, 0, targetValue, 1000 + (index * 200));
    });
  }, 100);
}
function renderRecentActivity(){
  const acts=[
    {dot:'red',text:'<strong>Nguyễn Văn An</strong> đã đóng đoàn phí Q1/2025',time:'2 phút trước'},
    {dot:'green',text:'<strong>Admin</strong> upload "Nghị quyết ĐH XII"',time:'15 phút trước'},
    {dot:'yellow',text:'Sự kiện <strong>"Ngày hội tình nguyện"</strong> được tạo',time:'1 giờ trước'},
    {dot:'blue',text:'<strong>Trần Thị Bích</strong> đăng ký sự kiện Hiến máu',time:'3 giờ trước'},
    {dot:'green',text:'<strong>Lê Minh Đức</strong> kết nạp thành công',time:'5 giờ trước'}
  ];
  $('#recentActivity').innerHTML=acts.map(a=>`<div class="activity-item"><div class="activity-dot ${a.dot}"></div><div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div></div>`).join('');
}
function destroyCharts(){Object.values(charts).forEach(c=>{if(c&&c.destroy)c.destroy()});charts={}}
function initDashCharts(){
  if(typeof Chart==='undefined')return;
  if(charts.line)charts.line.destroy();
  if(charts.pie)charts.pie.destroy();
  const ctx1=$('#lineChart');const ctx2=$('#pieChart');
  if(!ctx1||!ctx2)return;
  charts.line=new Chart(ctx1,{type:'line',data:{labels:['T11','T12','T1','T2','T3','T4'],datasets:[{label:'Kết nạp mới',data:[5,8,12,6,9,4],borderColor:'#d32f2f',backgroundColor:'rgba(211,47,47,.1)',fill:true,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#94a3b8'}}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'rgba(51,65,85,.3)'}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(51,65,85,.3)'}}}}});
  const units=['K22A','K22B','K21C','K23A'];
  const unitCounts=units.map(u=>MEMBERS.filter(m=>m.unit===u).length);
  charts.pie=new Chart(ctx2,{type:'doughnut',data:{labels:units.map(u=>'Chi đoàn '+u),datasets:[{data:unitCounts,backgroundColor:['#d32f2f','#f9a825','#10b981','#6366f1']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:12}}}}});
}

// ===== MEMBERS =====
function getFilteredMembers(){
  let list=[...MEMBERS];
  const search=$('#memberSearch').value.toLowerCase();
  const status=$('#memberStatusFilter').value;
  const unit=$('#memberUnitFilter').value;
  const fee=$('#memberFeeFilter').value;
  if(search)list=list.filter(m=>m.name.toLowerCase().includes(search)||m.id.toLowerCase().includes(search)||m.unit.toLowerCase().includes(search));
  if(status!=='all')list=list.filter(m=>m.status===status);
  if(unit!=='all')list=list.filter(m=>m.unit===unit);
  if(fee==='paid')list=list.filter(m=>Object.values(m.fee).every(f=>f==='paid'));
  if(fee==='debt')list=list.filter(m=>Object.values(m.fee).some(f=>f==='debt'));
  list.sort((a,b)=>{let va=a[memberSort.key]||'',vb=b[memberSort.key]||'';if(typeof va==='string')va=va.toLowerCase();if(typeof vb==='string')vb=vb.toLowerCase();return memberSort.asc?(va>vb?1:-1):(va<vb?1:-1)});
  return list;
}
function renderMembers(){
  const list=getFilteredMembers();
  const perPage=10,totalPages=Math.max(1,Math.ceil(list.length/perPage));
  if(memberPage>totalPages)memberPage=totalPages;
  const start=(memberPage-1)*perPage,slice=list.slice(start,start+perPage);
  const isAdmin=currentUser&&currentUser.role==='admin';
  $('#memberCount').textContent=`Hiển thị ${slice.length}/${list.length} đoàn viên`;
  $('#memberTbody').innerHTML=slice.map((m,i)=>{
    const initials=m.name.split(' ').slice(-2).map(w=>w[0]).join('');
    const color=COLORS[i%COLORS.length];
    const st=STATUS_MAP[m.status];
    const feeDebt=Object.entries(m.fee).filter(([,v])=>v==='debt').map(([k])=>k);
    const feeHtml=feeDebt.length?`<span class="badge badge-danger">Nợ ${feeDebt.join(',')}</span>`:`<span class="badge badge-ok">Đã đóng đủ</span>`;
    const rankClass=m.rank==='Xuất sắc'?'badge-primary':m.rank==='Khá'?'badge-info':'badge-warn';
    const actions=isAdmin?`<button class="btn-icon" onclick="editMember('${m.id}')" title="Sửa">✏️</button><button class="btn-icon" onclick="confirmDelete('${m.id}')" title="Xóa">🗑️</button>`:'';
    return`<tr><td><div class="member-info"><div class="member-avatar" style="background:${color}">${initials}</div><div><div class="member-name">${m.name}</div><div class="member-id">${m.id}</div></div></div></td><td>${m.unit}</td><td>${feeHtml}</td><td><span class="badge ${rankClass}">${m.rank}</span></td><td><span class="badge ${st.c}">${st.l}</span></td><td style="display:flex;gap:4px">${actions}<button class="btn-icon" onclick="viewMember('${m.id}')" title="Xem">👁️</button></td></tr>`;
  }).join('');
  $('#memberPagination').innerHTML=Array.from({length:totalPages},(_,i)=>`<button class="page-btn ${i+1===memberPage?'active':''}" onclick="setMemberPage(${i+1})">${i+1}</button>`).join('');
  $('#memberBadge').textContent=MEMBERS.length;
}
function viewMember(id){const m=MEMBERS.find(x=>x.id===id);if(!m)return;$('#previewTitle').textContent=m.name;$('#previewBody').innerHTML=`<p><strong>MSSV:</strong> ${m.id}</p><p><strong>Ngày sinh:</strong> ${m.dob}</p><p><strong>Giới tính:</strong> ${m.gender}</p><p><strong>Chi đoàn:</strong> ${m.unit}</p><p><strong>SĐT:</strong> ${m.phone}</p><p><strong>Email:</strong> ${m.email}</p><p><strong>Kết nạp:</strong> ${m.joinDate}</p><p><strong>Xếp loại:</strong> ${m.rank}</p>`;openModal('docPreviewModal')}
function editMember(id){editingMemberId=id;const m=MEMBERS.find(x=>x.id===id);if(!m)return;$('#memberModalTitle').textContent='✏️ Sửa Đoàn viên';$('#mName').value=m.name;$('#mDob').value=m.dob;$('#mGender').value=m.gender;$('#mUnit').value=m.unit;$('#mPhone').value=m.phone;$('#mEmail').value=m.email;$('#mJoinDate').value=m.joinDate;openModal('memberModal')}
function saveMember(){const name=$('#mName').value.trim();if(!name){showToast('Vui lòng nhập họ tên','error');return}if(editingMemberId){const m=MEMBERS.find(x=>x.id===editingMemberId);if(m){m.name=name;m.dob=$('#mDob').value;m.gender=$('#mGender').value;m.unit=$('#mUnit').value;m.phone=$('#mPhone').value;m.email=$('#mEmail').value;m.joinDate=$('#mJoinDate').value}showToast('Đã cập nhật đoàn viên')}else{MEMBERS.push({id:'24ICD'+String(MEMBERS.length+1).padStart(3,'0'),name,dob:$('#mDob').value,gender:$('#mGender').value,unit:$('#mUnit').value,phone:$('#mPhone').value,email:$('#mEmail').value,joinDate:$('#mJoinDate').value||'2025-04-30',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'});showToast('Đã thêm đoàn viên mới')}closeModal('memberModal');renderMembers();editingMemberId=null}
function confirmDelete(id){$('#confirmMsg').textContent=`Xóa đoàn viên ${id}?`;$('#confirmOk').onclick=()=>{const idx=MEMBERS.findIndex(m=>m.id===id);if(idx>-1)MEMBERS.splice(idx,1);closeModal('confirmModal');renderMembers();showToast('Đã xóa đoàn viên')};openModal('confirmModal')}
$('#btnAddMember').addEventListener('click',()=>{editingMemberId=null;$('#memberModalTitle').textContent='➕ Thêm Đoàn viên';$('#mName').value='';$('#mDob').value='';$('#mPhone').value='';$('#mEmail').value='';$('#mJoinDate').value='';openModal('memberModal')});
$('#memberSearch').addEventListener('input',()=>{memberPage=1;renderMembers()});
$('#memberStatusFilter').addEventListener('change',()=>{memberPage=1;renderMembers()});
$('#memberUnitFilter').addEventListener('change',()=>{memberPage=1;renderMembers()});
$('#memberFeeFilter').addEventListener('change',()=>{memberPage=1;renderMembers()});
$$('.data-table th.sortable').forEach(th=>{th.addEventListener('click',()=>{const k=th.dataset.sort;if(memberSort.key===k)memberSort.asc=!memberSort.asc;else{memberSort.key=k;memberSort.asc=true}renderMembers()})});

// ===== DOCUMENTS =====
function renderDocTabs(){
  const cats=[{key:'all',label:'Tất cả'},{key:'nghi-quyet',label:'Nghị quyết'},{key:'hoc-tap',label:'Học tập CT'},{key:'phong-trao',label:'Phong trào'},{key:'hanh-chinh',label:'Hành chính'}];
  $('#docTabs').innerHTML=cats.map(c=>{const count=c.key==='all'?DOCUMENTS.length:DOCUMENTS.filter(d=>d.category===c.key).length;return`<button class="tab-filter ${c.key==='all'?'active':''}" data-cat="${c.key}">${c.label} <span class="count">(${count})</span></button>`}).join('');
  $$('#docTabs .tab-filter').forEach(t=>t.addEventListener('click',()=>{$$('#docTabs .tab-filter').forEach(x=>x.classList.remove('active'));t.classList.add('active');renderDocs()}));
}
function renderDocs(){
  const cat=$('#docTabs .tab-filter.active')?.dataset.cat||'all';
  const type=$('#docTypeFilter').value;
  const search=$('#docSearch').value.toLowerCase();
  const sort=$('#docSort').value;
  let list=DOCUMENTS.filter(d=>{
    if(cat!=='all'&&d.category!==cat)return false;
    if(type!=='all'&&d.type!==type)return false;
    if(search&&!d.title.toLowerCase().includes(search)&&!d.tags.some(t=>t.includes(search)))return false;
    return true;
  });
  if(sort==='newest')list.sort((a,b)=>new Date(b.date)-new Date(a.date));
  else if(sort==='views')list.sort((a,b)=>b.views-a.views);
  else if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'vi'));
  $('#docGrid').innerHTML=list.map(d=>`<div class="doc-card" onclick="previewDoc(${d.id})"><div class="doc-card-preview ${d.type}">${TYPE_ICONS[d.type]||'📄'}<span class="doc-category">${getCatLabel(d.category)}</span></div><div class="doc-card-body"><h4>${d.title}</h4><div class="doc-card-meta"><span>${d.type.toUpperCase()}</span><span>•</span><span>${d.size}</span><span>•</span><span>${d.date}</span></div></div><div class="doc-card-footer"><span class="badge badge-info">${d.uploader}</span><span>👁️ ${d.views}</span></div></div>`).join('');
  $('#docBadge').textContent=DOCUMENTS.length;
}
function previewDoc(id){const d=DOCUMENTS.find(x=>x.id===id);if(!d)return;$('#previewTitle').textContent=d.title;$('#previewBody').innerHTML=`<p><strong>Loại:</strong> ${d.type.toUpperCase()}</p><p><strong>Dung lượng:</strong> ${d.size}</p><p><strong>Danh mục:</strong> ${getCatLabel(d.category)}</p><p><strong>Ngày upload:</strong> ${d.date}</p><p><strong>Người upload:</strong> ${d.uploader}</p><p><strong>Lượt xem:</strong> ${d.views}</p><p><strong>Tags:</strong> ${d.tags.join(', ')}</p>`;openModal('docPreviewModal')}
function addDocument(){const t=$('#docTitle').value.trim();if(!t){showToast('Nhập tiêu đề','error');return}DOCUMENTS.push({id:DOCUMENTS.length+1,title:t,type:$('#docType').value,size:'1.0MB',date:new Date().toISOString().slice(0,10),category:$('#docCat').value,views:0,uploader:currentUser.name,tags:$('#docTags').value.split(',').map(s=>s.trim()).filter(Boolean)});closeModal('uploadModal');renderDocTabs();renderDocs();showToast('Đã upload tài liệu')}
$('#btnUploadDoc').addEventListener('click',()=>openModal('uploadModal'));
$('#docSearch').addEventListener('input',renderDocs);
$('#docTypeFilter').addEventListener('change',renderDocs);
$('#docSort').addEventListener('change',renderDocs);

// ===== EVENTS =====
function renderEventStats(){
  const done=EVENTS.filter(e=>e.status==='done').length;
  const upcoming=EVENTS.filter(e=>e.status==='upcoming').length;
  const ongoing=EVENTS.filter(e=>e.status==='ongoing').length;
  const totalAtt=EVENTS.reduce((s,e)=>s+e.attendees,0);
  $('#eventStats').innerHTML=[
    {icon:'📅',val:EVENTS.length,label:'Tổng sự kiện'},
    {icon:'✅',val:done,label:'Đã hoàn thành'},
    {icon:'⏳',val:upcoming+ongoing,label:'Sắp/Đang diễn ra'},
    {icon:'👥',val:totalAtt,label:'Lượt tham gia'}
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
}
function renderEvents(filter='all'){
  const list=EVENTS.filter(e=>filter==='all'||e.status===filter);
  const isAdmin=currentUser&&currentUser.role==='admin';
  $('#eventList').innerHTML=list.map(e=>{
    const d=new Date(e.startDate);
    const stMap={upcoming:{l:'Sắp diễn ra',c:'badge-info'},ongoing:{l:'Đang diễn ra',c:'badge-warn'},done:{l:'Đã hoàn thành',c:'badge-ok'}};
    const st=stMap[e.status];
    const regBtn=e.status==='upcoming'&&!isAdmin?`<button class="btn btn-primary btn-sm" onclick="registerEvent(${e.id})">Đăng ký</button>`:'';
    return`<div class="event-card"><div class="event-date"><div class="day">${d.getDate()}</div><div class="month">${MONTHS[d.getMonth()]}</div></div><div class="event-info"><h4>${e.title}</h4><p>${e.desc}</p><div class="event-meta"><span>📍 ${e.location}</span><span>👥 ${e.attendees}/${e.maxAttendees}</span></div></div><div class="event-status"><span class="badge ${st.c}">${st.l}</span>${regBtn}</div></div>`;
  }).join('');
}
function registerEvent(id){const e=EVENTS.find(x=>x.id===id);if(e&&e.attendees<e.maxAttendees){e.attendees++;renderEvents();renderEventStats();showToast('Đã đăng ký thành công!');}else showToast('Sự kiện đã đầy','warning')}
function addEvent(){const t=$('#eName').value.trim();if(!t){showToast('Nhập tên sự kiện','error');return}EVENTS.push({id:EVENTS.length+1,title:t,startDate:$('#eStart').value||'2025-05-30',endDate:$('#eEnd').value||'2025-05-30',location:$('#eLocation').value||'TBD',attendees:0,maxAttendees:parseInt($('#eMax').value)||100,status:'upcoming',desc:$('#eDesc').value||''});closeModal('eventModal');renderEvents();renderEventStats();showToast('Đã tạo sự kiện')}
$('#btnAddEvent').addEventListener('click',()=>openModal('eventModal'));
$$('[data-ef]').forEach(btn=>{btn.addEventListener('click',()=>{$$('[data-ef]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderEvents(btn.dataset.ef)})});

// ===== REPORTS =====
function initReportCharts(){
  if(typeof Chart==='undefined')return;
  ['r1','r2','r3'].forEach(k=>{if(charts[k])charts[k].destroy()});
  const ctx1=$('#reportChart1'),ctx2=$('#reportChart2'),ctx3=$('#reportChart3');
  if(!ctx1)return;
  const units=['K22A','K22B','K21C','K23A'];
  charts.r1=new Chart(ctx1,{type:'bar',data:{labels:units,datasets:[{label:'Số lượng',data:units.map(u=>MEMBERS.filter(m=>m.unit===u).length),backgroundColor:['#d32f2f','#f9a825','#10b981','#6366f1']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#64748b'}},y:{ticks:{color:'#64748b'}}}}});
  charts.r2=new Chart(ctx2,{type:'bar',data:{labels:['T1','T2','T3','T4','T5','T6'],datasets:[{label:'Lượt tham gia',data:[80,55,375,556,120,0],backgroundColor:'rgba(211,47,47,.7)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#64748b'}},y:{ticks:{color:'#64748b'}}}}});
  const docCats=['Nghị quyết','Học tập CT','Phong trào','Hành chính'];
  charts.r3=new Chart(ctx3,{type:'doughnut',data:{labels:docCats,datasets:[{data:[DOCUMENTS.filter(d=>d.category==='nghi-quyet').length,DOCUMENTS.filter(d=>d.category==='hoc-tap').length,DOCUMENTS.filter(d=>d.category==='phong-trao').length,DOCUMENTS.filter(d=>d.category==='hanh-chinh').length],backgroundColor:['#d32f2f','#f9a825','#10b981','#6366f1']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8'}}}}});
}

// ===== EXPORT =====
function exportCSV(type){
  let csv='',filename='';
  if(type==='members'){csv='MSSV,Họ tên,Chi đoàn,Trạng thái,Xếp loại,Đoàn phí\n'+MEMBERS.map(m=>`${m.id},${m.name},${m.unit},${STATUS_MAP[m.status].l},${m.rank},${Object.values(m.fee).filter(f=>f==='debt').length?'Nợ':'Đủ'}`).join('\n');filename='doanvien.csv'}
  else if(type==='events'){csv='Tên,Ngày,Địa điểm,Tham gia,Trạng thái\n'+EVENTS.map(e=>`${e.title},${e.startDate},${e.location},${e.attendees},${e.status}`).join('\n');filename='hoatdong.csv'}
  else{csv='Tiêu đề,Loại,Danh mục,Ngày,Lượt xem\n'+DOCUMENTS.map(d=>`${d.title},${d.type},${getCatLabel(d.category)},${d.date},${d.views}`).join('\n');filename='tailieu.csv'}
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();showToast('Đã xuất file CSV');
}
function exportPDF(){window.print();showToast('Đang in / xuất PDF')}

// ===== SETTINGS =====
function initSettings(){
  $$('.toggle[data-key]').forEach(t=>{
    const saved=localStorage.getItem('setting_'+t.dataset.key);
    if(saved!==null)t.classList.toggle('active',saved==='true');
    t.addEventListener('click',()=>{
      t.classList.toggle('active');
      localStorage.setItem('setting_'+t.dataset.key,t.classList.contains('active'));
      if(t.dataset.key==='darkMode'){document.body.classList.toggle('light',!t.classList.contains('active'))}
    });
  });
  const dm=localStorage.getItem('setting_darkMode');
  if(dm==='false')document.body.classList.add('light');
  else $('#darkModeToggle').classList.add('active');
}
function changePassword(){
  const o=$('#oldPass').value,n=$('#newPass').value;
  if(!o||!n){showToast('Nhập đầy đủ','error');return}
  if(currentUser&&ACCOUNTS[currentUser.username]&&ACCOUNTS[currentUser.username].pass===o){ACCOUNTS[currentUser.username].pass=n;showToast('Đã đổi mật khẩu');$('#oldPass').value='';$('#newPass').value=''}
  else showToast('Mật khẩu cũ không đúng','error');
}

// ===== INIT =====
function initApp(){
  renderDashStats();renderRecentActivity();renderMembers();renderDocTabs();renderDocs();renderEventStats();renderEvents();initSettings();
  setTimeout(initDashCharts,300);
}
