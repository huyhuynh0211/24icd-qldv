// APP continued - TaiLieu, SuKien
TaiLieu:{
  // Google Apps Script endpoint for Google Drive upload
  DRIVE_SCRIPT:'https://script.google.com/macros/s/AKfycbw0j4IrdDE2_RuGs_MWBc0NY3X7BqdOycNTWS_OQx3T3kqM449nt799cSvMwWWdoSJJ/exec',
  renderTabs(){const tl=DB.get('tailieu')||[];const cats=[{k:'all',l:'Tất cả'},{k:'Nghị quyết',l:'Nghị quyết'},{k:'Học tập CT',l:'Học tập CT'},{k:'Phong trào',l:'Phong trào'},{k:'Hành chính',l:'Hành chính'}];$('#docTabs').innerHTML=cats.map(c=>{const n=c.k==='all'?tl.length:tl.filter(d=>d.danhMuc===c.k).length;return`<button class="tab-filter ${c.k==='all'?'active':''}" data-cat="${c.k}">${c.l} <span class="count">(${n})</span></button>`}).join('');$$('#docTabs .tab-filter').forEach(t=>t.addEventListener('click',()=>{$$('#docTabs .tab-filter').forEach(x=>x.classList.remove('active'));t.classList.add('active');App.TaiLieu.render()}))},
  render(){const tl=DB.get('tailieu')||[];const cat=$('#docTabs .tab-filter.active')?.dataset.cat||'all';const type=$('#docTypeFilter').value;const search=($('#docSearch').value||'').toLowerCase();const sort=$('#docSort').value;const isAdmin=currentUser&&currentUser.role==='admin';let list=tl.filter(d=>{if(cat!=='all'&&d.danhMuc!==cat)return false;if(type!=='all'&&d.loaiFile!==type)return false;if(search&&!d.tieuDe.toLowerCase().includes(search)&&!(d.tags||[]).some(t=>t.includes(search)))return false;return true});if(sort==='newest')list.sort((a,b)=>new Date(b.ngayUpload)-new Date(a.ngayUpload));else if(sort==='views')list.sort((a,b)=>b.luotXem-a.luotXem);else if(sort==='az')list.sort((a,b)=>a.tieuDe.localeCompare(b.tieuDe,'vi'));$('#docGrid').innerHTML=list.map(d=>{const delBtn=isAdmin?`<button class="btn-icon" onclick="event.stopPropagation();App.TaiLieu.confirmDel('${d.id}')" title="Xóa" style="margin-left:auto">🗑️</button>`:'';return`<div class="doc-card" onclick="App.TaiLieu.preview('${d.id}')"><div class="doc-card-preview ${TYPE_CSS[d.loaiFile]||'pdf'}">${TYPE_ICONS[d.loaiFile]||'📄'}<span class="doc-category">${d.danhMuc}</span></div><div class="doc-card-body"><h4>${d.tieuDe}</h4><div class="doc-card-meta"><span>${d.loaiFile}</span><span>•</span><span>${d.kichThuoc}</span><span>•</span><span>${fmtDate(d.ngayUpload.slice(0,10))}</span></div></div><div class="doc-card-footer"><span class="badge badge-info">${d.nguoiUpload}</span><span>👁️ ${d.luotXem}</span>${delBtn}</div></div>`}).join('');$('#docBadge').textContent=tl.length},
  preview(id){const tl=DB.get('tailieu')||[];const d=tl.find(x=>x.id===id);if(!d)return;d.luotXem=(d.luotXem||0)+1;DB.set('tailieu',tl);const isAdmin=currentUser&&currentUser.role==='admin';const delBtn=isAdmin?`<button class="btn btn-sm" style="background:#ef4444;color:#fff" onclick="App.TaiLieu.confirmDel('${d.id}')">🗑️ Xóa</button>`:'';const dlBtn=d.driveUrl?`<button class="btn btn-primary btn-sm" onclick="App.TaiLieu.download('${d.id}')">📥 Tải xuống</button>`:`<span style="font-size:12px;color:var(--muted)">📋 Chưa có file đính kèm</span>`;$('#previewTitle').textContent=d.tieuDe;$('#previewBody').innerHTML=`<p><b>Mô tả:</b> ${d.moTa||'—'}</p><p><b>Loại:</b> ${d.loaiFile}</p><p><b>Kích thước:</b> ${d.kichThuoc}</p><p><b>Danh mục:</b> ${d.danhMuc}</p><p><b>Quyền xem:</b> ${d.quyenXem}</p><p><b>Ngày upload:</b> ${fmtDate(d.ngayUpload.slice(0,10))}</p><p><b>Người upload:</b> ${d.nguoiUpload}</p><p><b>Lượt xem:</b> ${d.luotXem}</p><p><b>Tags:</b> ${(d.tags||[]).join(', ')}</p><div style="margin-top:12px;display:flex;gap:6px;align-items:center">${dlBtn}${delBtn}</div>`;openModal('previewModal')},
  download(id){
    const d=(DB.get('tailieu')||[]).find(x=>x.id===id);
    if(!d){showToast('Không tìm thấy','error');return}
    if(d.driveUrl){window.open(d.driveUrl,'_blank');showToast('Đang mở file từ Google Drive...')}
    else{showToast('Tài liệu chưa có file đính kèm','warning')}
  },
  confirmDel(id){const d=(DB.get('tailieu')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Xóa tài liệu "${d?d.tieuDe:id}"?`;$('#confirmOk').onclick=()=>{const arr=(DB.get('tailieu')||[]).filter(x=>x.id!==id);DB.set('tailieu',arr);closeModal('confirmModal');closeModal('previewModal');this.renderTabs();this.render();showToast('Đã xóa tài liệu')};openModal('confirmModal')},
  upload(){
    const title=$('#docTitle').value.trim();$('#docTitleErr').textContent='';
    if(!title){$('#docTitleErr').textContent='Vui lòng nhập tiêu đề';return}
    const fi=$('#fileInput').files[0];
    if(fi&&fi.size>50*1024*1024){showToast('File quá lớn (tối đa 50MB)','error');return}
    const btn=$('#uploadBtn');btn.disabled=true;btn.textContent='Đang xử lý...';
    const prog=$('#uploadProgress');prog.style.display='block';const fill=$('#progressFill');const ptxt=$('#progressText');
    const ext=fi?fi.name.split('.').pop().toLowerCase():'';
    const loaiFile=fi?({pdf:'PDF',docx:'DOCX',doc:'DOCX',pptx:'PPTX',ppt:'PPTX',jpg:'Image',jpeg:'Image',png:'Image',gif:'Image',mp4:'MP4',xlsx:'XLSX',xls:'XLSX',csv:'CSV',txt:'PDF',zip:'PDF'}[ext]||'PDF'):'PDF';
    const resetUI=()=>{btn.disabled=false;btn.textContent='📤 Upload';prog.style.display='none';fill.style.width='0';$('#filePreview').style.display='none';$('#docTitle').value='';$('#docDesc').value='';$('#docTags').value=''};
    const saveMeta=(driveUrl)=>{
      const tl=DB.get('tailieu')||[];
      tl.push({id:genId('TL',tl),tieuDe:title,moTa:$('#docDesc').value,danhMuc:$('#docCat').value,loaiFile:loaiFile,quyenXem:$('#docAccess').value,tags:$('#docTags').value.split(',').map(s=>s.trim()).filter(Boolean),ngayUpload:new Date().toISOString(),nguoiUpload:currentUser?currentUser.name:'Admin',luotXem:0,kichThuoc:fi?(fi.size/1024/1024).toFixed(1)+' MB':'0 KB',driveUrl:driveUrl||null,fileName:fi?fi.name:''});
      DB.set('tailieu',tl);
      const tb=DB.get('thongbao')||[];tb.unshift({id:'TB'+Date.now(),tieuDe:'Tài liệu mới',noiDung:'Tài liệu "'+title+'" đã được upload.',loai:'info',daDocBoi:[],thoiGian:new Date().toISOString(),targetUser:'all'});DB.set('thongbao',tb);App.ThongBao.render();
      closeModal('uploadModal');resetUI();this.renderTabs();this.render();
      showToast(driveUrl?'Upload thành công! File lưu trên Google Drive ☁️':'Đã lưu thông tin tài liệu');
    };
    if(fi){
      fill.style.width='20%';ptxt.textContent='Đang đọc file...';
      const reader=new FileReader();
      reader.onload=(ev)=>{
        const fullBase64=ev.target.result;
        const base64Data=fullBase64.split(',')[1];
        fill.style.width='40%';ptxt.textContent='Đang upload lên Google Drive...';
        const formData=new FormData();
        formData.append('fileName',fi.name);
        formData.append('mimeType',fi.type||'application/octet-stream');
        formData.append('data',base64Data);
        fetch(this.DRIVE_SCRIPT,{method:'POST',body:formData})
          .then(r=>r.json())
          .then(res=>{
            fill.style.width='100%';ptxt.textContent='100%';
            if(res.success){saveMeta(res.url)}
            else{showToast('Lỗi upload: '+(res.error||'Unknown'),'error');resetUI();prog.style.display='none'}
          })
          .catch(e=>{
            console.error('Drive upload error:',e);
            showToast('Lỗi kết nối: '+e.message,'error');resetUI();prog.style.display='none';
          });
      };
      reader.readAsDataURL(fi);
    }else{
      let p=0;const iv=setInterval(()=>{p+=10;fill.style.width=p+'%';ptxt.textContent=p+'%';if(p>=100){clearInterval(iv);saveMeta(null)}},30);
    }
  }
},
SuKien:{
  renderStats(){const sk=DB.get('sukien')||[];const done=sk.filter(e=>e.trangThai==='hoan-thanh').length;const upcoming=sk.filter(e=>e.trangThai==='sap-dien-ra'||e.trangThai==='dang-dien-ra').length;const att=sk.reduce((s,e)=>s+e.soLuongThamGia,0);$('#eventStats').innerHTML=[{icon:'📅',val:sk.length,label:'Tổng sự kiện'},{icon:'✅',val:done,label:'Đã hoàn thành'},{icon:'⏳',val:upcoming,label:'Sắp/Đang diễn ra'},{icon:'👥',val:att,label:'Lượt tham gia'}].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('')},
  render(filter='all'){const sk=DB.get('sukien')||[];const list=sk.filter(e=>filter==='all'||e.trangThai===filter);const isAdmin=currentUser&&currentUser.role==='admin';$('#eventList').innerHTML=list.map(e=>{const d=new Date(e.ngayToChuc);const st=EVT_STATUS[e.trangThai]||{l:'?',c:''};const regBtn=e.trangThai==='sap-dien-ra'&&!isAdmin?`<button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="App.SuKien.register('${e.id}')">Đăng ký</button>`:'';const expBtn=isAdmin&&(e.danhSachThamGia||[]).length>0?`<button class="btn btn-sm btn-outline" style="margin-top:6px;font-size:11px" onclick="App.SuKien.exportRegList('${e.id}')">📋 Xuất DS (${(e.danhSachThamGia||[]).length})</button>`:'';const delBtn=isAdmin?`<button class="btn-icon" onclick="App.SuKien.confirmDel('${e.id}')" title="Xóa" style="margin-top:6px">🗑️</button>`:'';return`<div class="event-card"><div class="event-date"><div class="day">${d.getDate()}</div><div class="month">${MONTHS[d.getMonth()]}</div></div><div class="event-info"><h4>${e.tenSuKien}</h4><p>${e.moTa||''}</p><div class="event-meta"><span>📍 ${e.diaDiem}</span><span>🕐 ${e.thoiGian||''}</span><span>👥 ${e.soLuongThamGia}</span></div></div><div class="event-status"><span class="badge ${st.c}">${st.l}</span>${regBtn}${expBtn}${delBtn}</div></div>`}).join('')||'<p style="color:var(--muted)">Không có sự kiện</p>'},
  register(id){const sk=DB.get('sukien')||[];const e=sk.find(x=>x.id===id);if(!e)return;if(!currentUser){showToast('Vui lòng đăng nhập','error');return}if((e.danhSachThamGia||[]).includes(currentUser.username)){showToast('Bạn đã đăng ký rồi','warning');return}e.soLuongThamGia++;if(!e.danhSachThamGia)e.danhSachThamGia=[];e.danhSachThamGia.push(currentUser.username);DB.set('sukien',sk);const tb=DB.get('thongbao')||[];tb.unshift({id:'TB'+Date.now(),tieuDe:'Đăng ký hoạt động',noiDung:'Bạn đã đăng ký tham gia "'+e.tenSuKien+'"',loai:'success',daDocBoi:[],thoiGian:new Date().toISOString(),targetUser:currentUser.username});DB.set('thongbao',tb);App.ThongBao.render();this.render();this.renderStats();showToast('Đã đăng ký tham gia!')},
  exportRegList(id){if(typeof XLSX==='undefined'){showToast('XLSX chưa tải','error');return}const sk=DB.get('sukien')||[];const e=sk.find(x=>x.id===id);if(!e)return;const dv=DB.get('doanvien')||[];const wb=XLSX.utils.book_new();const data=[['Họ tên','MSSV','Trạng thái','Đăng ký hoạt động']];(e.danhSachThamGia||[]).forEach(uid=>{const acc=ACCOUNTS[uid];const m=dv.find(x=>x.mssv===uid||x.id===uid);data.push([acc?acc.name:(m?m.hoTen:uid),uid,(STATUS_MAP[(m||{}).trangThai]||{}).l||'Đoàn viên',e.tenSuKien])});XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),'Đăng ký');XLSX.writeFile(wb,'DangKy_'+e.tenSuKien.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g,'_')+'.xlsx');showToast('Đã xuất danh sách đăng ký!')},
  create(){
    let ok=true;$('#eNameErr').textContent='';$('#eDateErr').textContent='';
    const name=$('#eName').value.trim(),date=$('#eDate').value;
    if(!name){$('#eNameErr').textContent='Nhập tên sự kiện';ok=false}
    if(!date){$('#eDateErr').textContent='Chọn ngày';ok=false}else if(new Date(date)<new Date(new Date().toDateString())){$('#eDateErr').textContent='Ngày không được trong quá khứ';ok=false}
    if(!ok)return;
    const sk=DB.get('sukien')||[];sk.push({id:genId('SK',sk),tenSuKien:name,moTa:$('#eDesc').value,ngayToChuc:date,thoiGian:$('#eTime').value||'08:00',diaDiem:$('#eLocation').value||'TBD',trangThai:'sap-dien-ra',soLuongThamGia:0,danhSachThamGia:[]});DB.set('sukien',sk);const tb=DB.get('thongbao')||[];tb.unshift({id:'TB'+Date.now(),tieuDe:'Hoạt động mới',noiDung:'Sự kiện "'+name+'" đã được tạo.',loai:'info',daDocBoi:[],thoiGian:new Date().toISOString(),targetUser:'all'});DB.set('thongbao',tb);App.ThongBao.render();closeModal('eventModal');this.render();this.renderStats();showToast('Đã tạo sự kiện mới!')
  },
  confirmDel(id){const e=(DB.get('sukien')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Xóa sự kiện "${e?e.tenSuKien:id}"? Hành động này không thể hoàn tác.`;$('#confirmOk').onclick=()=>{const arr=(DB.get('sukien')||[]).filter(x=>x.id!==id);DB.set('sukien',arr);closeModal('confirmModal');this.render();this.renderStats();showToast('Đã xóa sự kiện')};openModal('confirmModal')}
},
