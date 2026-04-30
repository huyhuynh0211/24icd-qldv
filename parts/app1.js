// ===== UTILITIES =====
function $(s){return document.querySelector(s)}
function $$(s){return document.querySelectorAll(s)}
function openModal(id){$('#'+id).classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show')}
function showToast(msg,type='success'){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;$('#toastContainer').appendChild(t);setTimeout(()=>t.remove(),3000)}
function showLoading(){$('#loadingOverlay').style.display='flex'}
function hideLoading(){$('#loadingOverlay').style.display='none'}
function timeAgo(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+' giây trước';if(s<3600)return Math.floor(s/60)+' phút trước';if(s<86400)return Math.floor(s/3600)+' giờ trước';return Math.floor(s/86400)+' ngày trước'}
function fmtDate(d){if(!d)return'';const p=d.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d}
function genId(prefix,arr){const n=arr.length+1;return prefix+String(n).padStart(3,'0')}
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
  login(u,p){const acc=ACCOUNTS[u];if(!acc||acc.pass!==p)return false;currentUser={username:u,...acc};$('#loginPage').classList.add('hidden');$('#appLayout').style.display='flex';document.body.classList.toggle('role-admin',acc.role==='admin');$('#headerUserName').textContent=acc.name+' ('+acc.role+')';$('#headerAvatar').textContent=acc.name.substring(0,2).toUpperCase();App.init();return true},
  logout(){currentUser=null;$('#loginPage').classList.remove('hidden');$('#appLayout').style.display='none';document.body.classList.remove('role-admin');Object.values(charts).forEach(c=>{if(c&&c.destroy)c.destroy()});charts={}}
},

// DASHBOARD
Dashboard:{
  render(){
    const dv=DB.get('doanvien')||[],tl=DB.get('tailieu')||[],sk=DB.get('sukien')||[];
    const active=dv.filter(m=>m.trangThai==='hoat-dong').length;
    const now=new Date(),thisMonth=sk.filter(e=>{const d=new Date(e.ngayToChuc);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}).length;
    $('#dashGreeting').textContent='Xin chào '+((currentUser&&currentUser.name)||'')+', tổng quan hệ thống';
    $('#dashStats').innerHTML=[
      {icon:'👥',val:dv.length,label:'Tổng Đoàn viên',ch:'Chi đoàn: 4'},
      {icon:'✅',val:active,label:'Đang hoạt động',ch:dv.length?Math.round(active/dv.length*100)+'%':'0%'},
      {icon:'📅',val:thisMonth,label:'Sự kiện tháng này',ch:sk.filter(e=>e.trangThai==='hoan-thanh').length+' hoàn thành'},
      {icon:'📄',val:tl.length,label:'Tài liệu số hóa',ch:'Đa dạng danh mục'}
    ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div><div class="stat-change up">${s.ch}</div></div>`).join('');
    // Recent activity
    const tb=DB.get('thongbao')||[];
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
    // Pie chart
    const units=['Chi đoàn K22A','Chi đoàn K22B','Chi đoàn K21C','Chi đoàn K23A'];
    const ctx2=$('#pieChart');if(ctx2)charts.pie=new Chart(ctx2,{type:'doughnut',data:{labels:units,datasets:[{data:units.map(u=>dv.filter(m=>m.chiDoan===u).length),backgroundColor:['#d32f2f','#f9a825','#10b981','#6366f1']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:10}}}}});
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
      return`<tr><td>${stt}</td><td class="sticky-col"><strong>${m.hoTen||''}</strong></td><td>${m.maDinhDanh||''}</td><td>${m.soTheDoan||''}</td><td>${fmtDate(m.ngaySinh)||''}</td><td>${m.gioiTinh||''}</td><td>${m.danToc||''}</td><td>${m.tonGiao||''}</td><td>${m.queQuan||''}</td><td>${m.diaChi||''}</td><td>${m.soCCCD||''}</td><td>${m.ngayCapCCCD||''}</td><td>${m.noiCapCCCD||''}</td><td>${m.trinhDoVH||''}</td><td>${m.trinhDoCM||''}</td><td>${m.trinhDoLLCT||''}</td><td>${m.tinHoc||''}</td><td>${m.ngoaiNgu||''}</td><td>${fmtDate(m.ngayKetNap)||''}</td><td>${m.soNghiQuyet||''}</td><td>${m.ngayVaoDang||''}</td><td>${m.ngheNghiep||''}</td><td>${m.doiTuongSH||''}</td><td>${m.renLuyen||''}</td><td>${m.danhGia||''}</td><td>${m.khenThuong||''}</td><td>${m.kyLuat||''}</td><td>${m.chucVu||'Đoàn viên'}</td><td>${m.hoi||''}</td><td>${m.email||''}</td><td>${m.soDienThoai||''}</td><td style="display:flex;gap:4px"><button class="btn-icon" onclick="App.DoanVien.view('${m.id}')" title="Xem">👁️</button>${acts}</td></tr>`
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
  edit(id){const m=(DB.get('doanvien')||[]).find(x=>x.id===id);if(!m)return;editingId=id;$('#memberModalTitle').textContent='✏️ Sửa Đoàn viên';$('#mName').value=m.hoTen;$('#mDob').value=m.ngaySinh||'';$('#mGender').value=m.gioiTinh||'Nam';$('#mUnit').value=m.chiDoan||'Chi đoàn K22A';$('#mPhone').value=m.soDienThoai||'';$('#mEmail').value=m.email||'';$('#mJoinDate').value=m.ngayKetNap||'';$('#mRank').value=m.thiDua||'Hoàn thành';$$('.field-error').forEach(e=>e.textContent='');openModal('memberModal')},
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
  confirmDel(id){const m=(DB.get('doanvien')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Bạn có chắc muốn xóa đoàn viên ${m?m.hoTen:id}? Hành động này không thể hoàn tác.`;$('#confirmOk').onclick=()=>{const arr=(DB.get('doanvien')||[]).filter(x=>x.id!==id);DB.set('doanvien',arr);closeModal('confirmModal');this.render();showToast('Đã xóa đoàn viên')};openModal('confirmModal')},
  // Import CSV/XLSX
  importFile(file){
    if(typeof XLSX==='undefined'){showToast('Thư viện XLSX chưa tải','error');return}
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const wb=XLSX.read(e.target.result,{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1});
        if(rows.length<2){showToast('File không có dữ liệu','error');return}
        const headers=rows[0].map(h=>(h||'').toString().trim());
        const colMap={};
        const mapping={'Họ và tên':'hoTen','Mã định danh đoàn viên':'maDinhDanh','Số thẻ đoàn':'soTheDoan','Ngày sinh':'ngaySinh','Giới tính':'gioiTinh','Dân tộc':'danToc','Tôn giáo':'tonGiao','Quê quán':'queQuan','Địa chỉ thường trú':'diaChi','Số CMND/CCCD':'soCCCD','Ngày cấp':'ngayCapCCCD','Nơi cấp':'noiCapCCCD','Trình độ văn hóa':'trinhDoVH','Trình độ chuyên môn':'trinhDoCM','Trình độ LLCT':'trinhDoLLCT','Tin học':'tinHoc','Ngoại ngữ':'ngoaiNgu','Thời gian vào đoàn':'ngayKetNap','Số Nghị quyết chuẩn y kết nạp đoàn viên':'soNghiQuyet','Thời gian vào Đảng':'ngayVaoDang','Nghề nghiệp hiện nay':'ngheNghiep','Đối tượng sinh hoạt':'doiTuongSH','Rèn luyện đoàn viên':'renLuyen','Đánh giá, xếp loại đoàn viên':'danhGia','Khen thưởng':'khenThuong','Kỷ luật':'kyLuat','Chức vụ trong chi đoàn':'chucVu','Hội':'hoi','Email liên hệ':'email','Điện thoại liên hệ':'soDienThoai'};
        headers.forEach((h,i)=>{for(const[key,field]of Object.entries(mapping)){if(h.includes(key)||key.includes(h)){colMap[field]=i;break}}});
        const arr=DB.get('doanvien')||[];
        let count=0;
        for(let r=1;r<rows.length;r++){
          const row=rows[r];if(!row||row.length<2)continue;
          const name=(row[colMap.hoTen]||'').toString().trim();
          if(!name)continue;
          const member={id:genId('DV',arr),hoTen:name,trangThai:'hoat-dong',thiDua:'Hoàn thành'};
          for(const[field,col]of Object.entries(colMap)){
            if(field==='hoTen')continue;
            let val=(row[col]||'').toString().trim();
            if(field==='ngaySinh'||field==='ngayKetNap'){
              if(val&&/^\d{2}\/\d{2}\/\d{4}$/.test(val)){const p=val.split('/');val=p[2]+'-'+p[1]+'-'+p[0]}
            }
            member[field]=val;
          }
          arr.push(member);count++;
        }
        DB.set('doanvien',arr);this.render();
        showToast(`Đã import ${count} đoàn viên thành công!`);
      }catch(err){showToast('Lỗi đọc file: '+err.message,'error');console.error(err)}
    };
    reader.readAsArrayBuffer(file);
  }
},

