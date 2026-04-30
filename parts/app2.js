// APP continued - TaiLieu, SuKien
TaiLieu:{
  renderTabs(){const tl=DB.get('tailieu')||[];const cats=[{k:'all',l:'Tất cả'},{k:'Nghị quyết',l:'Nghị quyết'},{k:'Học tập CT',l:'Học tập CT'},{k:'Phong trào',l:'Phong trào'},{k:'Hành chính',l:'Hành chính'}];$('#docTabs').innerHTML=cats.map(c=>{const n=c.k==='all'?tl.length:tl.filter(d=>d.danhMuc===c.k).length;return`<button class="tab-filter ${c.k==='all'?'active':''}" data-cat="${c.k}">${c.l} <span class="count">(${n})</span></button>`}).join('');$$('#docTabs .tab-filter').forEach(t=>t.addEventListener('click',()=>{$$('#docTabs .tab-filter').forEach(x=>x.classList.remove('active'));t.classList.add('active');App.TaiLieu.render()}))},
  render(){const tl=DB.get('tailieu')||[];const cat=$('#docTabs .tab-filter.active')?.dataset.cat||'all';const type=$('#docTypeFilter').value;const search=($('#docSearch').value||'').toLowerCase();const sort=$('#docSort').value;const isAdmin=currentUser&&currentUser.role==='admin';let list=tl.filter(d=>{if(cat!=='all'&&d.danhMuc!==cat)return false;if(type!=='all'&&d.loaiFile!==type)return false;if(search&&!d.tieuDe.toLowerCase().includes(search)&&!(d.tags||[]).some(t=>t.includes(search)))return false;return true});if(sort==='newest')list.sort((a,b)=>new Date(b.ngayUpload)-new Date(a.ngayUpload));else if(sort==='views')list.sort((a,b)=>b.luotXem-a.luotXem);else if(sort==='az')list.sort((a,b)=>a.tieuDe.localeCompare(b.tieuDe,'vi'));$('#docGrid').innerHTML=list.map(d=>{const delBtn=isAdmin?`<button class="btn-icon" onclick="event.stopPropagation();App.TaiLieu.confirmDel('${d.id}')" title="Xóa" style="margin-left:auto">🗑️</button>`:'';return`<div class="doc-card" onclick="App.TaiLieu.preview('${d.id}')"><div class="doc-card-preview ${TYPE_CSS[d.loaiFile]||'pdf'}">${TYPE_ICONS[d.loaiFile]||'📄'}<span class="doc-category">${d.danhMuc}</span></div><div class="doc-card-body"><h4>${d.tieuDe}</h4><div class="doc-card-meta"><span>${d.loaiFile}</span><span>•</span><span>${d.kichThuoc}</span><span>•</span><span>${fmtDate(d.ngayUpload.slice(0,10))}</span></div></div><div class="doc-card-footer"><span class="badge badge-info">${d.nguoiUpload}</span><span>👁️ ${d.luotXem}</span>${delBtn}</div></div>`}).join('');$('#docBadge').textContent=tl.length},
  preview(id){const tl=DB.get('tailieu')||[];const d=tl.find(x=>x.id===id);if(!d)return;d.luotXem=(d.luotXem||0)+1;DB.set('tailieu',tl);const isAdmin=currentUser&&currentUser.role==='admin';const delBtn=isAdmin?`<button class="btn btn-sm" style="background:#ef4444;color:#fff" onclick="App.TaiLieu.confirmDel('${d.id}')">🗑️ Xóa</button>`:'';const dlBtn=d.hasFile?`<button class="btn btn-primary btn-sm" onclick="App.TaiLieu.download('${d.id}')">📥 Tải xuống</button>`:`<span style="font-size:12px;color:var(--muted)">📋 Chưa có file đính kèm</span>`;$('#previewTitle').textContent=d.tieuDe;$('#previewBody').innerHTML=`<p><b>Mô tả:</b> ${d.moTa||'—'}</p><p><b>Loại:</b> ${d.loaiFile}</p><p><b>Kích thước:</b> ${d.kichThuoc}</p><p><b>Danh mục:</b> ${d.danhMuc}</p><p><b>Quyền xem:</b> ${d.quyenXem}</p><p><b>Ngày upload:</b> ${fmtDate(d.ngayUpload.slice(0,10))}</p><p><b>Người upload:</b> ${d.nguoiUpload}</p><p><b>Lượt xem:</b> ${d.luotXem}</p><p><b>Tags:</b> ${(d.tags||[]).join(', ')}</p><div style="margin-top:12px;display:flex;gap:6px;align-items:center">${dlBtn}${delBtn}</div>`;openModal('previewModal')},
  download(id){
    const d=(DB.get('tailieu')||[]).find(x=>x.id===id);
    if(!d){showToast('Không tìm thấy tài liệu','error');return}
    if(!d.hasFile){showToast('Tài liệu chưa có file','warning');return}
    showToast('Đang tải file từ cloud...','info');
    // Try Firebase RTDB first
    if(firebaseReady&&firebaseDB){
      firebaseDB.ref('files/'+id).once('value').then(snap=>{
        const base64=snap.val();
        if(base64){
          const a=document.createElement('a');a.href=base64;
          a.download=d.tieuDe+(d.fileName?'.'+d.fileName.split('.').pop():'');
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          showToast('Tải xuống thành công!');
        }else{showToast('File không tìm thấy trên cloud','error')}
      }).catch(e=>{console.error(e);showToast('Lỗi tải file: '+e.message,'error')});
    }else{showToast('Không có kết nối Firebase','error')}
  },
  confirmDel(id){const d=(DB.get('tailieu')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Xóa tài liệu "${d?d.tieuDe:id}"?`;$('#confirmOk').onclick=()=>{const arr=(DB.get('tailieu')||[]).filter(x=>x.id!==id);DB.set('tailieu',arr);if(firebaseReady&&firebaseDB){firebaseDB.ref('files/'+id).remove().catch(()=>{})}closeModal('confirmModal');closeModal('previewModal');this.renderTabs();this.render();showToast('Đã xóa tài liệu')};openModal('confirmModal')},
  upload(){
    const title=$('#docTitle').value.trim();$('#docTitleErr').textContent='';
    if(!title){$('#docTitleErr').textContent='Vui lòng nhập tiêu đề';return}
    const fi=$('#fileInput').files[0];
    if(fi&&fi.size>10*1024*1024){showToast('File quá lớn (tối đa 10MB)','error');return}
    const btn=$('#uploadBtn');btn.disabled=true;btn.textContent='Đang xử lý...';
    const prog=$('#uploadProgress');prog.style.display='block';const fill=$('#progressFill');const ptxt=$('#progressText');
    const ext=fi?fi.name.split('.').pop().toLowerCase():'';
    const loaiFile=fi?({pdf:'PDF',docx:'DOCX',doc:'DOCX',pptx:'PPTX',ppt:'PPTX',jpg:'Image',jpeg:'Image',png:'Image',gif:'Image',mp4:'MP4',xlsx:'XLSX',xls:'XLSX',csv:'CSV',txt:'PDF',zip:'PDF'}[ext]||'PDF'):'PDF';
    const docId=genId('TL',DB.get('tailieu')||[]);
    const finish=(hasFile)=>{
      const tl=DB.get('tailieu')||[];
      tl.push({id:docId,tieuDe:title,moTa:$('#docDesc').value,danhMuc:$('#docCat').value,loaiFile:loaiFile,quyenXem:$('#docAccess').value,tags:$('#docTags').value.split(',').map(s=>s.trim()).filter(Boolean),ngayUpload:new Date().toISOString(),nguoiUpload:currentUser?currentUser.name:'Admin',luotXem:0,kichThuoc:fi?(fi.size/1024/1024).toFixed(1)+' MB':'0 KB',hasFile:hasFile,fileName:fi?fi.name:''});
      DB.set('tailieu',tl);
      closeModal('uploadModal');btn.disabled=false;btn.textContent='📤 Upload';prog.style.display='none';fill.style.width='0';$('#filePreview').style.display='none';$('#docTitle').value='';$('#docDesc').value='';$('#docTags').value='';this.renderTabs();this.render();
      showToast(hasFile?'Upload thành công! File đã đồng bộ ☁️':'Đã lưu thông tin tài liệu');
    };
    if(fi){
      const reader=new FileReader();
      reader.onprogress=(e)=>{if(e.lengthComputable){const pct=Math.round((e.loaded/e.total)*50);fill.style.width=pct+'%';ptxt.textContent='Đọc file: '+pct+'%'}};
      reader.onload=(ev)=>{
        const base64=ev.target.result;
        fill.style.width='50%';ptxt.textContent='Đang upload lên cloud...';
        if(firebaseReady&&firebaseDB){
          firebaseDB.ref('files/'+docId).set(base64).then(()=>{
            fill.style.width='100%';ptxt.textContent='100%';finish(true);
          }).catch(e=>{
            console.error('Firebase upload error:',e);
            fill.style.width='100%';ptxt.textContent='100%';finish(false);
            showToast('Lỗi lưu file lên cloud: '+e.message,'error');
          });
        }else{fill.style.width='100%';ptxt.textContent='100%';finish(false);showToast('Không có kết nối Firebase, chỉ lưu metadata','warning')}
      };
      reader.readAsDataURL(fi);
    }else{
      let p=0;const iv=setInterval(()=>{p+=10;fill.style.width=p+'%';ptxt.textContent=p+'%';if(p>=100){clearInterval(iv);finish(false)}},30);
    }
  }
},
SuKien:{
  renderStats(){const sk=DB.get('sukien')||[];const done=sk.filter(e=>e.trangThai==='hoan-thanh').length;const upcoming=sk.filter(e=>e.trangThai==='sap-dien-ra'||e.trangThai==='dang-dien-ra').length;const att=sk.reduce((s,e)=>s+e.soLuongThamGia,0);$('#eventStats').innerHTML=[{icon:'📅',val:sk.length,label:'Tổng sự kiện'},{icon:'✅',val:done,label:'Đã hoàn thành'},{icon:'⏳',val:upcoming,label:'Sắp/Đang diễn ra'},{icon:'👥',val:att,label:'Lượt tham gia'}].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-value">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('')},
  render(filter='all'){const sk=DB.get('sukien')||[];const list=sk.filter(e=>filter==='all'||e.trangThai===filter);const isAdmin=currentUser&&currentUser.role==='admin';$('#eventList').innerHTML=list.map(e=>{const d=new Date(e.ngayToChuc);const st=EVT_STATUS[e.trangThai]||{l:'?',c:''};const regBtn=e.trangThai==='sap-dien-ra'&&!isAdmin?`<button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="App.SuKien.register('${e.id}')">Đăng ký</button>`:'';const delBtn=isAdmin?`<button class="btn-icon" onclick="App.SuKien.confirmDel('${e.id}')" title="Xóa" style="margin-top:6px">🗑️</button>`:'';return`<div class="event-card"><div class="event-date"><div class="day">${d.getDate()}</div><div class="month">${MONTHS[d.getMonth()]}</div></div><div class="event-info"><h4>${e.tenSuKien}</h4><p>${e.moTa||''}</p><div class="event-meta"><span>📍 ${e.diaDiem}</span><span>🕐 ${e.thoiGian||''}</span><span>👥 ${e.soLuongThamGia}</span></div></div><div class="event-status"><span class="badge ${st.c}">${st.l}</span>${regBtn}${delBtn}</div></div>`}).join('')||'<p style="color:var(--muted)">Không có sự kiện</p>'},
  register(id){const sk=DB.get('sukien')||[];const e=sk.find(x=>x.id===id);if(!e)return;e.soLuongThamGia++;if(currentUser)e.danhSachThamGia.push(currentUser.username);DB.set('sukien',sk);this.render();this.renderStats();showToast('Đã đăng ký tham gia!')},
  create(){
    let ok=true;$('#eNameErr').textContent='';$('#eDateErr').textContent='';
    const name=$('#eName').value.trim(),date=$('#eDate').value;
    if(!name){$('#eNameErr').textContent='Nhập tên sự kiện';ok=false}
    if(!date){$('#eDateErr').textContent='Chọn ngày';ok=false}else if(new Date(date)<new Date(new Date().toDateString())){$('#eDateErr').textContent='Ngày không được trong quá khứ';ok=false}
    if(!ok)return;
    const sk=DB.get('sukien')||[];sk.push({id:genId('SK',sk),tenSuKien:name,moTa:$('#eDesc').value,ngayToChuc:date,thoiGian:$('#eTime').value||'08:00',diaDiem:$('#eLocation').value||'TBD',trangThai:'sap-dien-ra',soLuongThamGia:0,danhSachThamGia:[]});DB.set('sukien',sk);closeModal('eventModal');this.render();this.renderStats();showToast('Đã tạo sự kiện mới!')
  },
  confirmDel(id){const e=(DB.get('sukien')||[]).find(x=>x.id===id);$('#confirmMsg').textContent=`Xóa sự kiện "${e?e.tenSuKien:id}"? Hành động này không thể hoàn tác.`;$('#confirmOk').onclick=()=>{const arr=(DB.get('sukien')||[]).filter(x=>x.id!==id);DB.set('sukien',arr);closeModal('confirmModal');this.render();this.renderStats();showToast('Đã xóa sự kiện')};openModal('confirmModal')}
},
