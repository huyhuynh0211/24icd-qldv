// ===== UTILITIES =====
function $(s){return document.querySelector(s)}
function $$(s){return document.querySelectorAll(s)}
function openModal(id){
  const modal = $('#'+id);
  modal.classList.add('show');
  setTimeout(() => {
    if(modal.querySelector('.modal')) modal.querySelector('.modal').style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 10);
}
function closeModal(id){
  const modal = $('#'+id);
  if(modal.querySelector('.modal')) modal.querySelector('.modal').style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  if(modal.classList.contains('show')) {
    setTimeout(() => { modal.classList.remove('show'); }, 10);
  } else { modal.classList.remove('show'); }
}
function showToast(msg,type='success'){
  const t=document.createElement('div');
  t.className='toast '+type;
  t.textContent=msg;
  $('#toastContainer').appendChild(t);
  setTimeout(() => { t.classList.add('show'); }, 10);
  setTimeout(()=>{
    t.style.animation = 'toastExit 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    setTimeout(() => { if(t.parentNode) t.remove(); }, 400);
  }, 3000);
}
function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(start + (end - start) * easedProgress);
    element.textContent = currentValue.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else { element.textContent = end.toLocaleString(); element.style.animation = 'counterUp 0.3s ease-out'; }
  }
  requestAnimationFrame(update);
}
function showLoading(){$('#loadingOverlay').style.display='flex'}
function hideLoading(){$('#loadingOverlay').style.display='none'}
function timeAgo(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+' giây trước';if(s<3600)return Math.floor(s/60)+' phút trước';if(s<86400)return Math.floor(s/3600)+' giờ trước';return Math.floor(s/86400)+' ngày trước'}
function fmtDate(d){if(!d)return'';const p=d.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d}
function genId(prefix,arr){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
const MONTHS=['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
const STATUS_MAP={'hoat-dong':{l:'Hoạt động',c:'badge-ok'},'tam-hoan':{l:'Tạm hoãn',c:'badge-warn'},'het-han':{l:'Hết hạn',c:'badge-danger'}};
const EVT_STATUS={'sap-dien-ra':{l:'Sắp diễn ra',c:'badge-info'},'dang-dien-ra':{l:'Đang diễn ra',c:'badge-warn'},'hoan-thanh':{l:'Hoàn thành',c:'badge-ok'},'huy':{l:'Đã hủy',c:'badge-danger'}};
const TYPE_ICONS={PDF:'📄',DOCX:'📘',PPTX:'📊',Image:'🖼️',MP4:'🎬'};
const TYPE_CSS={PDF:'pdf',DOCX:'docx',PPTX:'pptx',Image:'img',MP4:'pdf'};
let charts={},memberPage=1,memberSort={key:'hoTen',asc:true},editingId=null;

// ===== APP OBJECT =====
const App={
state:{currentTab:'dashboard'},

// AUTH
Auth:{
  async login(u,p){
    if(!accountsLoaded){showToast('Đang tải dữ liệu, vui lòng thử lại...','warning');return false}
    const acc=ACCOUNTS[u];if(!acc)return false;
    const hashed=await hashPass(p);
    if(acc.pass!==hashed)return false;
    currentUser={username:u,...acc};
    
    const token = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    sessionStorage.setItem('_sessionToken', token);
    sessionStorage.setItem('_sessionUser', u);
    if(firebaseReady && firebaseDB) {
      firebaseDB.ref('sessions/' + token).set({
        username: u,
        createdAt: new Date().toISOString()
      });
    }

    $('#loginPage').classList.add('hidden');$('#appLayout').style.display='flex';
    document.body.classList.toggle('role-admin',acc.role==='admin');
    $('#headerUserName').textContent=acc.name+' ('+acc.role+')';
    $('#headerAvatar').textContent=acc.name.substring(0,2).toUpperCase();
    App.init();return true;
  },
  logout(){
    const token = sessionStorage.getItem('_sessionToken');
    if(token && firebaseReady && firebaseDB) {
      firebaseDB.ref('sessions/' + token).remove().catch(()=>{});
    }
    sessionStorage.removeItem('_sessionToken');
    sessionStorage.removeItem('_sessionUser');
    currentUser=null;$('#loginPage').classList.remove('hidden');$('#appLayout').style.display='none';document.body.classList.remove('role-admin');Object.values(charts).forEach(c=>{if(c&&c.destroy)c.destroy()});charts={}
  }
},

// DASHBOARD
Dashboard:{
  render(){
    const dv=DB.get('doanvien')||[],tl=DB.get('tailieu')||[],sk=DB.get('sukien')||[];
    const active=dv.filter(m=>m.trangThai==='hoat-dong').length;
    const now=new Date(),thisMonth=sk.filter(e=>{const d=new Date(e.ngayToChuc);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}).length;
    $('#dashGreeting').textContent='Xin chào '+((currentUser&&currentUser.name)||'')+', tổng quan hệ thống';
    $('#dashStats').innerHTML=[
      {icon:'👥',val:dv.length,label:'Tổng Đoàn viên',ch:'Chi đoàn: 24ICD'},
      {icon:'✅',val:active,label:'Đang hoạt động',ch:dv.length?Math.round(active/dv.length*100)+'%':'0%'},
      {icon:'📅',val:thisMonth,label:'Sự kiện tháng này',ch:sk.filter(e=>e.trangThai==='hoan-thanh').length+' hoàn thành'},
      {icon:'📄',val:tl.length,label:'Tài liệu số hóa',ch:'Đa dạng danh mục'}
    ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value" data-value="${s.val}">0</div><div class="stat-label">${s.label}</div><div class="stat-change up">${s.ch}</div></div>`).join('');
    setTimeout(() => {
      $$('.stat-value').forEach((element, index) => {
        const targetValue = parseInt(element.getAttribute('data-value'));
        animateValue(element, 0, targetValue, 1000 + (index * 200));
      });
    }, 100);
    // Recent activity
    let tb=DB.get('thongbao')||[];
    if(typeof currentUser!=='undefined'&&currentUser){ tb=tb.filter(n=>!n.targetUser||n.targetUser==='all'||n.targetUser===currentUser.username); }
    const recent=tb.sort((a,b)=>new Date(b.thoiGian)-new Date(a.thoiGian)).slice(0,5);
    const dotMap={warning:'yellow',info:'blue',success:'green',danger:'red'};
    $('#recentActivity').innerHTML=recent.length?recent.map(n=>`<div class="activity-item"><div class="activity-dot ${dotMap[n.loai]||'blue'}"></div><div><div class="activity-text"><strong>${n.tieuDe}</strong> — ${n.noiDung.substring(0,60)}</div><div class="activity-time">${timeAgo(n.thoiGian)}</div></div></div>`).join(''):'<p style="color:var(--muted);font-size:13px">Chưa có hoạt động</p>';
  },
  initCharts(){
    if(typeof Chart==='undefined')return;
    if(charts.line)charts.line.destroy();if(charts.pie)charts.pie.destroy();
    const dv=DB.get('doanvien')||[];
    // Line chart: 6 months
    const now=new Date();const labels=[],data=[];
    for(let i=5;i>=0;i--){const m=new Date(now.getFullYear(),now.getMonth()-i,1);labels.push(MONTHS[m.getMonth()]);data.push(dv.filter(d=>{const j=new Date(d.ngayKetNap);return j.getMonth()===m.getMonth()&&j.getFullYear()===m.getFullYear()}).length)}
    const ctx1=$('#lineChart');if(ctx1)charts.line=new Chart(ctx1,{type:'line',data:{labels,datasets:[{label:'Kết nạp',data,borderColor:'#d32f2f',backgroundColor:'rgba(211,47,47,.1)',fill:true,tension:.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#94a3b8'}}},scales:{x:{ticks:{color:'#64748b'},grid:{color:'rgba(51,65,85,.3)'}},y:{ticks:{color:'#64748b'},grid:{color:'rgba(51,65,85,.3)'}}}}});
    // Pie chart - Giới tính
    const nam=dv.filter(m=>(m.gioiTinh||'').includes('Nam')).length;const nu=dv.filter(m=>(m.gioiTinh||'').includes('Nữ')).length;const khac=dv.length-nam-nu;
    const ctx2=$('#pieChart');if(ctx2)charts.pie=new Chart(ctx2,{type:'doughnut',data:{labels:['Nam ('+nam+')','Nữ ('+nu+')'+(khac>0?', Khác ('+khac+')':'')],datasets:[{data:khac>0?[nam,nu,khac]:[nam,nu],backgroundColor:khac>0?['#3b82f6','#ec4899','#94a3b8']:['#3b82f6','#ec4899']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:10}}}}});
  }
},

// DOAN VIEN
DoanVien:{
  getFiltered(){
    let list=[...(DB.get('doanvien')||[])];
    const s=($('#memberSearch')?.value||'').toLowerCase();
    const st=$('#memberStatusFilter')?.value||'all';
    if(s)list=list.filter(m=>(m.hoTen||'').toLowerCase().includes(s)||(m.maDinhDanh||'').toLowerCase().includes(s)||(m.soCCCD||'').toLowerCase().includes(s)||(m.email||'').toLowerCase().includes(s));
    if(st!=='all')list=list.filter(m=>m.trangThai===st);
    list.sort((a,b)=>{let va=(a[memberSort.key]||'').toLowerCase(),vb=(b[memberSort.key]||'').toLowerCase();return memberSort.asc?(va>vb?1:-1):(va<vb?1:-1)});
    return list;
  },
  render(){
    const all=DB.get('doanvien')||[],list=this.getFiltered(),perPage=10,totalPages=Math.max(1,Math.ceil(list.length/perPage));
    if(memberPage>totalPages)memberPage=totalPages;
    const start=(memberPage-1)*perPage,slice=list.slice(start,start+perPage);
    const isAdmin=currentUser&&currentUser.role==='admin';
    $('#memberCount').textContent=`Hiển thị ${slice.length}/${list.length} đoàn viên`;
    $('#memberBadge').textContent=all.length;
    $('#memberTbody').innerHTML=slice.map((m,i)=>{
      const stt=start+i+1;
      const acts=isAdmin?`<button class="btn-icon" onclick="App.DoanVien.edit('${m.id}')" title="Sửa">✏️</button><button class="btn-icon" onclick="App.DoanVien.confirmDel('${m.id}')" title="Xóa">🗑️</button>`:'';
      const dgOpts=['Không hoàn thành nhiệm vụ','Hoàn thành nhiệm vụ','Hoàn thành tốt nhiệm vụ','Hoàn thành xuất sắc nhiệm vụ'];
      const dgCell=isAdmin?`<select class="form-input" style="font-size:11px;padding:4px 6px;width:auto;min-width:100px" onchange="App.DoanVien.updateDanhGia('${m.id}',this.value)">${dgOpts.map(o=>`<option${(m.danhGia||'')=== o?' selected':''}>${o}</option>`).join('')}</select>`:`<span style="font-size:11px">${m.danhGia||'Chưa đánh giá'}</span>`;
      return`<tr><td>${stt}</td><td class="sticky-col"><strong>${m.hoTen||''}</strong></td><td>${m.mssv||''}</td><td>${m.maDinhDanh||''}</td><td>${m.soTheDoan||''}</td><td>${fmtDate(m.ngaySinh)||''}</td><td>${m.gioiTinh||''}</td><td>${m.danToc||''}</td><td>${m.tonGiao||''}</td><td>${m.queQuan||''}</td><td>${m.diaChi||''}</td><td>${m.soCCCD||''}</td><td>${m.ngayCapCCCD||''}</td><td>${m.noiCapCCCD||''}</td><td>${m.trinhDoVH||''}</td><td>${m.trinhDoCM||''}</td><td>${m.trinhDoLLCT||''}</td><td>${m.tinHoc||''}</td><td>${m.ngoaiNgu||''}</td><td>${fmtDate(m.ngayKetNap)||''}</td><td>${m.soNghiQuyet||''}</td><td>${m.ngayVaoDang||''}</td><td>${m.ngheNghiep||''}</td><td>${m.doiTuongSH||''}</td><td>${m.renLuyen||''}</td><td>${dgCell}</td><td>${m.khenThuong||''}</td><td>${m.kyLuat||''}</td><td>${m.chucVu||'Đoàn viên'}</td><td>${m.hoi||''}</td><td>${m.email||''}</td><td>${m.soDienThoai||''}</td><td style="display:flex;gap:4px"><button class="btn-icon" onclick="App.DoanVien.view('${m.id}')" title="Xem">👁️</button>${acts}</td></tr>`
    }).join('');
    $('#memberPagination').innerHTML=Array.from({length:totalPages},(_,i)=>`<button class="page-btn ${i+1===memberPage?'active':''}" onclick="memberPage=${i+1};App.DoanVien.render()">${i+1}</button>`).join('');
  },
  view(id){const m=(DB.get('doanvien')||[]).find(x=>x.id===id);if(!m)return;$('#previewTitle').textContent=m.hoTen;$('#previewBody').innerHTML=`
    <p><b>Mã định danh:</b> ${m.maDinhDanh||''}</p><p><b>Số thẻ đoàn:</b> ${m.soTheDoan||''}</p>
    <p><b>Ngày sinh:</b> ${fmtDate(m.ngaySinh)}</p><p><b>Giới tính:</b> ${m.gioiTinh||''}</p>
    <p><b>Dân tộc:</b> ${m.danToc||''}</p><p><b>Tôn giáo:</b> ${m.tonGiao||''}</p>
    <p><b>Quê quán:</b> ${m.queQuan||''}</p><p><b>Địa chỉ:</b> ${m.diaChi||''}</p>
    <p><b>CCCD:</b> ${m.soCCCD||''}</p><p><b>Ngày cấp:</b> ${m.ngayCapCCCD||''}</p><p><b>Nơi cấp:</b> ${m.noiCapCCCD||''}</p>
    <p><b>Trình độ VH:</b> ${m.trinhDoVH||''}</p><p><b>Chuyên môn:</b> ${m.trinhDoCM||''}</p>
    <p><b>LLCT:</b> ${m.trinhDoLLCT||''}</p><p><b>Tin học:</b> ${m.tinHoc||''}</p><p><b>Ngoại ngữ:</b> ${m.ngoaiNgu||''}</p>
    <p><b>Vào Đoàn:</b> ${m.ngayKetNap||''}</p><p><b>Nghề nghiệp:</b> ${m.ngheNghiep||''}</p>
    <p><b>Đối tượng SH:</b> ${m.doiTuongSH||''}</p><p><b>Rèn luyện:</b> ${m.renLuyen||''}</p>
    <p><b>Đánh giá:</b> ${m.danhGia||''}</p><p><b>Khen thưởng:</b> ${m.khenThuong||''}</p><p><b>Kỷ luật:</b> ${m.kyLuat||''}</p>
    <p><b>Chức vụ:</b> ${m.chucVu||''}</p><p><b>Hội:</b> ${m.hoi||''}</p>
    <p><b>Email:</b> ${m.email||''}</p><p><b>SĐT:</b> ${m.soDienThoai||''}</p>`;openModal('previewModal')},
  openAdd(){editingId=null;$('#memberModalTitle').textContent='➕ Thêm Đoàn viên';['mName','mDob','mPhone','mEmail','mJoinDate'].forEach(id=>$('#'+id).value='');$$('.field-error').forEach(e=>e.textContent='');openModal('memberModal')},
  edit(id){const m=(DB.get('doanvien')||[]).find(x=>x.id===id);if(!m)return;editingId=id;$('#memberModalTitle').textContent='✏️ Sửa Đoàn viên';$('#mName').value=m.hoTen;$('#mDob').value=m.ngaySinh||'';$('#mGender').value=m.gioiTinh||'Nam';$('#mUnit').value=m.chiDoan||'Chi đoàn 24ICD';$('#mPhone').value=m.soDienThoai||'';$('#mEmail').value=m.email||'';$('#mJoinDate').value=m.ngayKetNap||'';$('#mRank').value=m.thiDua||'Hoàn thành';$$('.field-error').forEach(e=>e.textContent='');openModal('memberModal')},
  save(){
    let ok=true;const name=$('#mName').value.trim(),dob=$('#mDob').value,phone=$('#mPhone').value.trim(),email=$('#mEmail').value.trim();
    $$('.field-error').forEach(e=>e.textContent='');
    if(!name){$('#mNameErr').textContent='Vui lòng nhập họ tên';ok=false}
    if(!ok)return;
    const arr=DB.get('doanvien')||[];
    if(editingId){const m=arr.find(x=>x.id===editingId);if(m){m.hoTen=name;m.ngaySinh=dob;m.gioiTinh=$('#mGender').value;m.chiDoan=$('#mUnit').value;m.soDienThoai=phone;m.email=email;m.ngayKetNap=$('#mJoinDate').value;m.thiDua=$('#mRank').value}showToast('Đã cập nhật đoàn viên')}
    else{arr.push({id:genId('DV',arr),hoTen:name,ngaySinh:dob,gioiTinh:$('#mGender').value,chiDoan:$('#mUnit').value,soDienThoai:phone,email,ngayKetNap:$('#mJoinDate').value||new Date().toISOString().slice(0,10),trangThai:'hoat-dong',thiDua:$('#mRank').value,maDinhDanh:'',soTheDoan:'',soCCCD:'',chucVu:'Đoàn viên'});showToast('Đã thêm đoàn viên thành công!')}
    DB.set('doanvien',arr);closeModal('memberModal');this.render();editingId=null;
  },
  updateDanhGia(id,val){const arr=DB.get('doanvien')||[];const m=arr.find(x=>x.id===id);if(m){m.danhGia=val;DB.set('doanvien',arr);showToast('Đã cập nhật đánh giá')}},
  confirmDel(id){const m=(DB.get('doanvien')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Bạn có chắc muốn xóa đoàn viên ${m?m.hoTen:id}? Hành động này không thể hoàn tác.`;$('#confirmOk').onclick=()=>{const arr=(DB.get('doanvien')||[]).filter(x=>x.id!==id);DB.set('doanvien',arr);closeModal('confirmModal');this.render();showToast('Đã xóa đoàn viên')};openModal('confirmModal')},
  // Import CSV/XLSX
  importFile(file){
    if(typeof XLSX==='undefined'){showToast('Thư viện XLSX chưa tải','error');return}
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const wb=XLSX.read(e.target.result,{type:'array',cellDates:true});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,dateNF:'yyyy-mm-dd'});
        if(rows.length<2){showToast('File không có dữ liệu','error');return}
        const headers=rows[0].map(h=>(h||'').toString().trim());
        const colMap={};
        const mapping={'STT':'_stt','MSSV':'mssv','Họ và tên':'hoTen','Họ tên':'hoTen','Mã định danh đoàn viên':'maDinhDanh','Mã định danh':'maDinhDanh','Số thẻ đoàn':'soTheDoan','Ngày sinh':'ngaySinh','Giới tính':'gioiTinh','Dân tộc':'danToc','Tôn giáo':'tonGiao','Quê quán':'queQuan','Địa chỉ thường trú':'diaChi','Số CMND/CCCD':'soCCCD','Ngày cấp':'ngayCapCCCD','Nơi cấp':'noiCapCCCD','Trình độ văn hóa':'trinhDoVH','Trình độ chuyên môn':'trinhDoCM','Trình độ LLCT':'trinhDoLLCT','Tin học':'tinHoc','Ngoại ngữ':'ngoaiNgu','Thời gian vào đoàn':'ngayKetNap','Kết nạp':'ngayKetNap','Số Nghị quyết':'soNghiQuyet','Thời gian vào Đảng':'ngayVaoDang','Nghề nghiệp':'ngheNghiep','Đối tượng sinh hoạt':'doiTuongSH','Rèn luyện':'renLuyen','Đánh giá':'danhGia','Thi đua':'thiDua','Khen thưởng':'khenThuong','Kỷ luật':'kyLuat','Chức vụ':'chucVu','Hội':'hoi','Email':'email','Điện thoại':'soDienThoai','SĐT':'soDienThoai','Trạng thái':'trangThaiText','Chi đoàn':'chiDoan','Mã':'maDinhDanh'};
        headers.forEach((h,i)=>{
          for(const[key,field]of Object.entries(mapping)){
            if(h===key||h.includes(key)){colMap[field]=i;break}
          }
        });
        console.log('Import headers:',headers);
        console.log('Import colMap:',colMap);
        // Ensure arr is a proper array
        let existing=DB.get('doanvien');
        let arr=Array.isArray(existing)?existing:existing?Object.values(existing):[];
        let count=0;
        for(let r=1;r<rows.length;r++){
          const row=rows[r];if(!row||row.length<2)continue;
          const nameCol=colMap.hoTen;
          const name=nameCol!==undefined?(row[nameCol]||'').toString().trim():'';
          if(!name)continue;
          const member={id:genId('DV',arr),hoTen:name,trangThai:'hoat-dong',thiDua:'Hoàn thành',chiDoan:'24ICD'};
          for(const[field,col]of Object.entries(colMap)){
            if(field==='hoTen'||field==='_stt'||col===undefined)continue;
            let val=(row[col]!=null)?row[col].toString().trim():'';
            // Convert date formats
            if(field==='ngaySinh'||field==='ngayKetNap'||field==='ngayCapCCCD'){
              if(val&&/^\d{2}\/\d{2}\/\d{4}$/.test(val)){const p=val.split('/');val=p[2]+'-'+p[1]+'-'+p[0]}
              else if(val&&/^\d{4}-\d{2}-\d{2}/.test(val)){val=val.slice(0,10)}
            }
            if(field==='trangThaiText'){
              if(val.includes('Hoạt động'))member.trangThai='hoat-dong';
              else if(val.includes('Tạm'))member.trangThai='tam-hoan';
              else if(val.includes('Hết'))member.trangThai='het-han';
              continue;
            }
            member[field]=val;
          }
          arr.push(member);count++;
        }
        DB.set('doanvien',arr);this.render();
        showToast('Đã import '+count+' đoàn viên thành công!');
      }catch(err){showToast('Lỗi đọc file: '+err.message,'error');console.error(err)}
    };
    reader.readAsArrayBuffer(file);
  }
},

