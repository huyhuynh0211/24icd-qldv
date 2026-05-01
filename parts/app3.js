// APP continued - BaoCao, ThongBao, CaiDat, init
BaoCao:{
  initCharts(){
    if(typeof Chart==='undefined')return;
    ['r1','r2','r3'].forEach(k=>{if(charts[k])charts[k].destroy()});
    const dv=DB.get('doanvien')||[],sk=DB.get('sukien')||[],tl=DB.get('tailieu')||[];
    const c1=$('#rptChart1');if(c1)charts.r1=new Chart(c1,{type:'bar',data:{labels:['24ICD'],datasets:[{label:'Số lượng',data:[dv.length],backgroundColor:['#d32f2f'],barThickness:60}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:'Chi Đoàn 24ICD — '+dv.length+' đoàn viên',color:'#94a3b8'}},scales:{x:{ticks:{color:'#64748b'}},y:{ticks:{color:'#64748b'},beginAtZero:true}}}});
    const c2=$('#rptChart2');if(c2)charts.r2=new Chart(c2,{type:'bar',data:{labels:['Hoàn thành','Sắp tới','Đang','Hủy'],datasets:[{data:[sk.filter(e=>e.trangThai==='hoan-thanh').length,sk.filter(e=>e.trangThai==='sap-dien-ra').length,sk.filter(e=>e.trangThai==='dang-dien-ra').length,sk.filter(e=>e.trangThai==='huy').length],backgroundColor:['#10b981','#06b6d4','#f59e0b','#ef4444']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#64748b'}},y:{ticks:{color:'#64748b'}}}}});
    const cats=['Nghị quyết','Học tập CT','Phong trào','Hành chính'];
    const c3=$('#rptChart3');if(c3)charts.r3=new Chart(c3,{type:'doughnut',data:{labels:cats,datasets:[{data:cats.map(c=>tl.filter(d=>d.danhMuc===c).length),backgroundColor:['#d32f2f','#f9a825','#10b981','#6366f1']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8'}}}}});
  },
  exportExcel(type){
    if(typeof XLSX==='undefined'){showToast('Thư viện XLSX chưa tải xong','error');return}
    showToast('Đang tạo file Excel...','info');
    const wb=XLSX.utils.book_new();const today=new Date().toISOString().slice(0,10).replace(/-/g,'');
    if(type==='doanvien'){
      const dv=DB.get('doanvien')||[];
      const ws1Data=[['MSSV','Họ tên','Ngày sinh','Giới tính','Chi đoàn','SĐT','Email','Kết nạp','Trạng thái','Đánh giá XL']];dv.forEach(m=>ws1Data.push([m.mssv||m.maDinhDanh||m.id,m.hoTen,m.ngaySinh,m.gioiTinh,m.chiDoan||'24ICD',m.soDienThoai,m.email,m.ngayKetNap,(STATUS_MAP[m.trangThai]||{}).l||m.trangThai,m.danhGia||'Chưa đánh giá']));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ws1Data),'Danh sách');
      const ws3Data=[['Xếp loại','Số lượng']];['Xuất sắc','Tiên tiến','Hoàn thành','Không HT'].forEach(r=>ws3Data.push([r,dv.filter(m=>m.thiDua===r).length]));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ws3Data),'Thi đua');
      XLSX.writeFile(wb,'BaoCao_DoanVien_'+today+'.xlsx');
    }else if(type==='sukien'){
      const sk=DB.get('sukien')||[];const dv=DB.get('doanvien')||[];
      const ws=[['Mã','Tên','Ngày','Giờ','Địa điểm','Trạng thái','Tham gia']];sk.forEach(e=>ws.push([e.id,e.tenSuKien,e.ngayToChuc,e.thoiGian,e.diaDiem,(EVT_STATUS[e.trangThai]||{}).l||'',e.soLuongThamGia]));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ws),'Sự kiện');
      // Sheet "Danh sách đăng ký" per event
      const regData=[['Họ tên','MSSV','Trạng thái','Đăng ký hoạt động']];
      sk.forEach(e=>{(e.danhSachThamGia||[]).forEach(uid=>{
        const acc=ACCOUNTS[uid];const m=dv.find(x=>x.mssv===uid||x.maDinhDanh===uid||x.id===uid);
        regData.push([acc?acc.name:(m?m.hoTen:uid),uid,(STATUS_MAP[(m||{}).trangThai]||{}).l||'Đoàn viên',e.tenSuKien]);
      })});
      XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(regData),'Đăng ký HĐ');
      XLSX.writeFile(wb,'BaoCao_HoatDong_'+today+'.xlsx');
    }else{
      const tl=DB.get('tailieu')||[];const ws=[['Mã','Tiêu đề','Danh mục','Loại','Kích thước','Ngày upload','Lượt xem']];tl.forEach(d=>ws.push([d.id,d.tieuDe,d.danhMuc,d.loaiFile,d.kichThuoc,d.ngayUpload.slice(0,10),d.luotXem]));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ws),'Tài liệu');XLSX.writeFile(wb,'BaoCao_TaiLieu_'+today+'.xlsx');
    }
    setTimeout(()=>showToast('Tải xuống thành công!'),500);
  },
  exportPDF(type){
    if(typeof jspdf==='undefined'){showToast('Thư viện jsPDF chưa tải xong','error');return}
    showToast('Đang tạo PDF...','info');
    const{jsPDF}=jspdf;const doc=new jsPDF();const today=new Date().toISOString().slice(0,10);
    doc.setFontSize(16);doc.text('DOAN TNCS HO CHI MINH',105,15,{align:'center'});doc.setFontSize(10);doc.text('Ngay xuat: '+today,105,22,{align:'center'});
    if(type==='doanvien'){
      const dv=DB.get('doanvien')||[];doc.setFontSize(13);doc.text('BAO CAO DOAN VIEN',105,32,{align:'center'});
      doc.setFontSize(10);doc.text('Tong: '+dv.length+' | Hoat dong: '+dv.filter(m=>m.trangThai==='hoat-dong').length+' | Tam hoan: '+dv.filter(m=>m.trangThai==='tam-hoan').length,14,40);
      doc.autoTable({startY:45,head:[['Ma','Ho ten','Chi doan','Trang thai','Thi dua']],body:dv.map(m=>[m.id,m.hoTen,m.chiDoan,(STATUS_MAP[m.trangThai]||{}).l||'',m.thiDua]),styles:{fontSize:8}});
      doc.save('BaoCao_DoanVien_'+today.replace(/-/g,'')+'.pdf');
    }else if(type==='sukien'){
      const sk=DB.get('sukien')||[];doc.setFontSize(13);doc.text('BAO CAO HOAT DONG',105,32,{align:'center'});
      doc.autoTable({startY:40,head:[['Ten','Ngay','Dia diem','Trang thai','Tham gia']],body:sk.map(e=>[e.tenSuKien,e.ngayToChuc,e.diaDiem,(EVT_STATUS[e.trangThai]||{}).l||'',e.soLuongThamGia]),styles:{fontSize:8}});
      doc.save('BaoCao_HoatDong_'+today.replace(/-/g,'')+'.pdf');
    }else{
      const tl=DB.get('tailieu')||[];doc.setFontSize(13);doc.text('BAO CAO TAI LIEU',105,32,{align:'center'});
      doc.autoTable({startY:40,head:[['Tieu de','Danh muc','Loai','Luot xem']],body:tl.map(d=>[d.tieuDe,d.danhMuc,d.loaiFile,d.luotXem]),styles:{fontSize:8}});
      doc.save('BaoCao_TaiLieu_'+today.replace(/-/g,'')+'.pdf');
    }
    setTimeout(()=>showToast('Xuất PDF thành công!'),500);
  }
},
ThongBao:{
  render(){const tb=DB.get('thongbao')||[];const unread=tb.filter(n=>!n.daDoc).length;$('#notifCount').textContent=unread;$('#notifDot').style.display=unread>0?'block':'none';const icons={warning:'⚠️',info:'ℹ️',success:'✅',danger:'❌'};$('#notifList').innerHTML=tb.sort((a,b)=>new Date(b.thoiGian)-new Date(a.thoiGian)).slice(0,10).map(n=>`<div class="notif-item ${n.daDoc?'':'unread'}" onclick="App.ThongBao.markRead('${n.id}')">${icons[n.loai]||'ℹ️'} <strong>${n.tieuDe}</strong><button class="btn-icon" style="float:right;width:22px;height:22px;font-size:12px" onclick="event.stopPropagation();App.ThongBao.del('${n.id}')" title="Xóa">✕</button><br><span style="color:var(--text2)">${n.noiDung.substring(0,50)}</span><div class="notif-time">${timeAgo(n.thoiGian)}</div></div>`).join('')||'<p style="padding:16px;color:var(--muted);font-size:13px">Không có thông báo</p>'},
  markRead(id){const tb=DB.get('thongbao')||[];const n=tb.find(x=>x.id===id);if(n)n.daDoc=true;DB.set('thongbao',tb);this.render()},
  markAllRead(){const tb=DB.get('thongbao')||[];tb.forEach(n=>n.daDoc=true);DB.set('thongbao',tb);this.render();showToast('Đã đánh dấu tất cả đã đọc')},
  del(id){const tb=(DB.get('thongbao')||[]).filter(x=>x.id!==id);DB.set('thongbao',tb);this.render();showToast('Đã xóa thông báo')},
  clearAll(){DB.set('thongbao',[]);this.render();showToast('Đã xóa tất cả thông báo')},
  toggle(){const p=$('#notifPanel');p.style.display=p.style.display==='none'?'block':'none'}
},
CaiDat:{
  load(){const cfg=DB.get('caiDat')||{};$$('.toggle[data-key]').forEach(t=>{const v=cfg[t.dataset.key];if(v)t.classList.add('active');else t.classList.remove('active')});if(cfg.darkMode)document.body.classList.add('light');else document.body.classList.remove('light');this.updateThemeBtn()},
  save(){const cfg={};$$('.toggle[data-key]').forEach(t=>cfg[t.dataset.key]=t.classList.contains('active'));DB.set('caiDat',cfg);showToast('Đã lưu cài đặt thành công!')},
  toggleTheme(){
    const isLight=document.body.classList.toggle('light');
    const cfg=DB.get('caiDat')||{};cfg.darkMode=isLight;DB.set('caiDat',cfg);
    const dt=$('#darkModeToggle');if(dt){if(isLight)dt.classList.add('active');else dt.classList.remove('active')}
    this.updateThemeBtn();
  },
  updateThemeBtn(){
    const isLight=document.body.classList.contains('light');
    const icon=$('#themeIcon');const label=$('#themeLabel');
    if(icon)icon.textContent=isLight?'☀️':'🌙';
    if(label)label.textContent=isLight?'Chế độ sáng':'Chế độ tối';
  },
  changePassword(){const o=$('#oldPass').value,n=$('#newPass').value;if(!o||!n){showToast('Nhập đầy đủ mật khẩu','error');return}hashPass(o).then(ho=>{if(currentUser&&ACCOUNTS[currentUser.username]&&ACCOUNTS[currentUser.username].pass===ho){hashPass(n).then(hn=>{ACCOUNTS[currentUser.username].pass=hn;if(firebaseReady&&firebaseDB)firebaseDB.ref('accounts/'+currentUser.username+'/pass').set(hn);try{localStorage.setItem('_accounts',JSON.stringify(ACCOUNTS))}catch(e){}showToast('Đã đổi mật khẩu');$('#oldPass').value='';$('#newPass').value=''})}else showToast('Mật khẩu cũ không đúng','error')})},
  resetData(){$('#confirmMsg').textContent='Xóa toàn bộ dữ liệu? Trang sẽ tải lại.';$('#confirmOk').onclick=()=>{localStorage.clear();location.reload()};openModal('confirmModal')}
},

// GLOBAL SEARCH
GlobalSearch:{
  init(){const input=$('#globalSearch');const results=$('#searchResults');input.addEventListener('input',debounce(()=>{const q=input.value.trim().toLowerCase();if(!q){results.style.display='none';return}const dv=(DB.get('doanvien')||[]).filter(m=>m.hoTen.toLowerCase().includes(q)).slice(0,3);const tl=(DB.get('tailieu')||[]).filter(d=>d.tieuDe.toLowerCase().includes(q)||(d.tags||[]).some(t=>t.includes(q))).slice(0,3);const sk=(DB.get('sukien')||[]).filter(e=>e.tenSuKien.toLowerCase().includes(q)).slice(0,3);let html='';if(dv.length)html+=`<div class="search-group">Đoàn viên</div>`+dv.map(m=>`<div class="search-item" onclick="App.GlobalSearch.go('members','${m.id}')">👤 ${m.hoTen} — ${m.chiDoan}</div>`).join('');if(tl.length)html+=`<div class="search-group">Tài liệu</div>`+tl.map(d=>`<div class="search-item" onclick="App.GlobalSearch.go('documents','${d.id}')">📄 ${d.tieuDe}</div>`).join('');if(sk.length)html+=`<div class="search-group">Sự kiện</div>`+sk.map(e=>`<div class="search-item" onclick="App.GlobalSearch.go('events','${e.id}')">📅 ${e.tenSuKien}</div>`).join('');if(!html)html='<div class="search-item" style="color:var(--muted)">Không tìm thấy kết quả</div>';results.innerHTML=html;results.style.display='block'},400));document.addEventListener('keydown',e=>{if(e.key==='Escape')results.style.display='none'});document.addEventListener('click',e=>{if(!e.target.closest('.header-search'))results.style.display='none'})},
  go(page){$$('.nav-item').forEach(n=>n.classList.remove('active'));$$('.nav-item[data-page="'+page+'"]').forEach(n=>n.classList.add('active'));$$('.page').forEach(p=>p.classList.remove('active'));$('#page-'+page).classList.add('active');$('#searchResults').style.display='none';$('#globalSearch').value=''}
},

// INIT
init(){
  App.Dashboard.render();setTimeout(()=>App.Dashboard.initCharts(),300);
  App.DoanVien.render();App.TaiLieu.renderTabs();App.TaiLieu.render();
  App.SuKien.renderStats();App.SuKien.render();App.ThongBao.render();App.CaiDat.load();
}
};// end App

// ===== EVENT BINDINGS =====
document.addEventListener('DOMContentLoaded',async ()=>{
  initSampleData();
  // Load accounts from Firebase
  await loadAccounts();
  // Login (async)
  $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const u=$('#loginUser').value.trim(),p=$('#loginPass').value;if(!u||!p){$('#loginError').textContent='Vui lòng nhập đầy đủ';return}const ok=await App.Auth.login(u,p);if(!ok)$('#loginError').textContent='Sai tên đăng nhập hoặc mật khẩu'});
  $('#logoutBtn').addEventListener('click',()=>App.Auth.logout());
  // Nav
  $$('.nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>{showLoading();$$('.nav-item').forEach(n=>n.classList.remove('active'));item.classList.add('active');setTimeout(()=>{$$('.page').forEach(p=>p.classList.remove('active'));$('#page-'+item.dataset.page).classList.add('active');hideLoading();if(item.dataset.page==='dashboard'){App.Dashboard.render();App.Dashboard.initCharts()}if(item.dataset.page==='reports')App.BaoCao.initCharts();$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('show')},200)}));
  $('#navUpload').addEventListener('click',()=>openModal('uploadModal'));
  $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarOverlay').classList.add('show')});
  $('#sidebarOverlay').addEventListener('click',()=>{$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('show')});
  // Members
  $('#btnAddMember').addEventListener('click',()=>App.DoanVien.openAdd());
  // Import CSV/XLSX
  $('#btnImportFile').addEventListener('click',()=>$('#importFileInput').click());
  $('#importFileInput').addEventListener('change',()=>{const f=$('#importFileInput').files[0];if(f)App.DoanVien.importFile(f);$('#importFileInput').value=''});
  const debouncedMember=debounce(()=>{memberPage=1;App.DoanVien.render()},300);
  $('#memberSearch').addEventListener('input',debouncedMember);
  $('#memberStatusFilter').addEventListener('change',()=>{memberPage=1;App.DoanVien.render()});
  $$('.data-table th.sortable').forEach(th=>th.addEventListener('click',()=>{const k=th.dataset.sort;if(memberSort.key===k)memberSort.asc=!memberSort.asc;else{memberSort.key=k;memberSort.asc=true}App.DoanVien.render()}));
  // Docs
  $('#btnUploadDoc').addEventListener('click',()=>openModal('uploadModal'));
  $('#docSearch').addEventListener('input',debounce(()=>App.TaiLieu.render(),300));
  $('#docTypeFilter').addEventListener('change',()=>App.TaiLieu.render());
  $('#docSort').addEventListener('change',()=>App.TaiLieu.render());
  // Upload zone
  const zone=$('#uploadZone'),fi=$('#fileInput');
  zone.addEventListener('click',()=>fi.click());
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.style.borderColor='var(--primary)'});
  zone.addEventListener('dragleave',()=>zone.style.borderColor='');
  zone.addEventListener('drop',e=>{e.preventDefault();zone.style.borderColor='';if(e.dataTransfer.files.length)handleFile(e.dataTransfer.files[0])});
  fi.addEventListener('change',()=>{if(fi.files.length)handleFile(fi.files[0])});
  // Events
  $('#btnAddEvent').addEventListener('click',()=>{$('#eName').value='';$('#eDate').value='';$('#eDesc').value='';$('#eLocation').value='';openModal('eventModal')});
  $$('[data-ef]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-ef]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');App.SuKien.render(btn.dataset.ef)}));
  // Notifications
  $('#notifBtn').addEventListener('click',e=>{e.stopPropagation();App.ThongBao.toggle()});
  document.addEventListener('click',e=>{if(!e.target.closest('.notif-wrapper'))$('#notifPanel').style.display='none'});
  // Toggles
  $$('.toggle[data-key]').forEach(t=>t.addEventListener('click',()=>{t.classList.toggle('active');if(t.dataset.key==='darkMode')document.body.classList.toggle('light',!t.classList.contains('active'));showToast('Đã cập nhật cài đặt')}));
  // Modal close on Escape
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-overlay.show').forEach(m=>m.classList.remove('show'))});
  // Global search
  App.GlobalSearch.init();
  // Restore dark mode
  const cfg=DB.get('caiDat');if(cfg&&!cfg.darkMode)document.body.classList.add('light');
});
function handleFile(f){
  const allowed=['pdf','docx','pptx','jpg','jpeg','png','mp4'];const ext=f.name.split('.').pop().toLowerCase();
  if(!allowed.includes(ext)){showToast('Định dạng file không được hỗ trợ','error');return}
  if(f.size>100*1024*1024){showToast('File vượt quá 100MB','error');return}
  const prev=$('#filePreview');prev.style.display='block';
  let html=`<strong>${f.name}</strong> — ${(f.size/1024/1024).toFixed(1)} MB — ${ext.toUpperCase()}`;
  if(['jpg','jpeg','png'].includes(ext)){const r=new FileReader();r.onload=e=>{prev.innerHTML=html+`<br><img src="${e.target.result}" style="max-width:100%;max-height:120px;margin-top:8px;border-radius:6px">`};r.readAsDataURL(f)}
  else prev.innerHTML=html;
  if(!$('#docTitle').value)$('#docTitle').value=f.name.replace('.'+ext,'');
}

