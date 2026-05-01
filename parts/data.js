// ===== FIREBASE SETUP =====
const firebaseConfig = {
  apiKey: "AIzaSyBB8Bus9Tqlrssa9hl1BNlXv5jzYUVdQPw",
  authDomain: "icd-qldv.firebaseapp.com",
  databaseURL: "https://icd-qldv-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "icd-qldv",
  storageBucket: "icd-qldv.firebasestorage.app",
  messagingSenderId: "881012602229",
  appId: "1:881012602229:web:5335178991a9970e460f3c"
};
let firebaseApp=null,firebaseDB=null,firebaseReady=false;
try{
  firebaseApp=firebase.initializeApp(firebaseConfig);
  firebaseDB=firebase.database();
  firebaseReady=true;
  console.log('Firebase connected');
}catch(e){console.warn('Firebase init failed, using localStorage only',e)}

// ===== STORAGE HELPERS (Firebase + localStorage cache) =====
const DB={
  // Read from localStorage cache (instant), Firebase updates via listeners
  // Ensures array keys always return arrays (Firebase may convert to objects)
  get(key){
    try{
      const val=JSON.parse(localStorage.getItem(key));
      if(!val)return null;
      // Known array keys - ensure they're always arrays
      const arrayKeys=['doanvien','sukien','tailieu','thongbao'];
      if(arrayKeys.includes(key)&&val&&!Array.isArray(val)){
        return Object.values(val);
      }
      return val;
    }catch(e){return null}
  },
  // Write to both localStorage AND Firebase
  set(key,val){
    try{localStorage.setItem(key,JSON.stringify(val))}catch(e){console.warn('localStorage error',e)}
    if(firebaseReady&&firebaseDB){
      try{
        // Don't save fileData to Firebase (too large), strip it
        let cleanVal=val;
        if(key==='tailieu'&&Array.isArray(val)){
          cleanVal=val.map(d=>{const c={...d};delete c.fileData;return c});
        }
        firebaseDB.ref(key).set(cleanVal).catch(e=>console.warn('Firebase write error:',e));
      }catch(e){console.warn('Firebase set error',e)}
    }
  },
  remove(key){
    try{localStorage.removeItem(key)}catch(e){}
    if(firebaseReady&&firebaseDB){
      try{firebaseDB.ref(key).remove()}catch(e){}
    }
  }
};

// ===== FIREBASE REAL-TIME LISTENERS =====
// These auto-update localStorage when another device changes data
const SYNC_KEYS=['doanvien','tailieu','sukien','thongbao','caiDat'];
function setupFirebaseListeners(){
  if(!firebaseReady||!firebaseDB)return;
  // Monitor connection status
  firebaseDB.ref('.info/connected').on('value',(snap)=>{
    const el=document.getElementById('syncStatus');
    if(!el)return;
    if(snap.val()===true){
      el.innerHTML='🟢 Online';el.style.background='rgba(16,185,129,.15)';el.style.color='#10b981';
    }else{
      el.innerHTML='🔴 Offline';el.style.background='rgba(239,68,68,.15)';el.style.color='#ef4444';
    }
  });
  // Listen for data changes from other devices
  SYNC_KEYS.forEach(key=>{
    firebaseDB.ref(key).on('value',(snap)=>{
      const data=snap.val();
      if(data!==null&&data!==undefined){
        // Only update localStorage if data is different (avoid loops)
        const current=localStorage.getItem(key);
        const incoming=JSON.stringify(data);
        if(current!==incoming){
          localStorage.setItem(key,incoming);
          // Re-render the relevant section if app is loaded
          if(typeof App!=='undefined'&&App.init){
            try{
              if(key==='doanvien'&&App.DoanVien)App.DoanVien.render();
              if(key==='tailieu'&&App.TaiLieu){App.TaiLieu.renderTabs();App.TaiLieu.render()}
              if(key==='sukien'&&App.SuKien){App.SuKien.renderStats();App.SuKien.render()}
              if(key==='thongbao'&&App.ThongBao)App.ThongBao.render();
              if(key==='doanvien'||key==='tailieu'||key==='sukien'){
                if(App.Dashboard){App.Dashboard.render()}
              }
            }catch(e){console.warn('Re-render error:',e)}
          }
        }
      }
    });
  });
}

// ===== ACCOUNTS (loaded from Firebase, no hardcoded passwords) =====
let ACCOUNTS={};
let accountsLoaded=false;

// Simple SHA-256 hash for password security
async function hashPass(str){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// Load accounts from Firebase into memory
async function loadAccounts(){
  if(!firebaseReady||!firebaseDB){
    // Offline fallback: try localStorage cache
    try{const cached=JSON.parse(localStorage.getItem('_accounts'));if(cached){ACCOUNTS=cached;accountsLoaded=true}}catch(e){}
    return;
  }
  try{
    const snap=await firebaseDB.ref('accounts').once('value');
    const data=snap.val();
    if(data){
      ACCOUNTS=data;
      accountsLoaded=true;
      // Cache locally for offline access
      try{localStorage.setItem('_accounts',JSON.stringify(data))}catch(e){}
    }else{
      // First time: seed accounts to Firebase
      await seedAccountsToFirebase();
    }
  }catch(e){
    console.warn('Failed to load accounts from Firebase:',e);
    try{const cached=JSON.parse(localStorage.getItem('_accounts'));if(cached){ACCOUNTS=cached;accountsLoaded=true}}catch(e2){}
  }
}

// Accounts are stored in Firebase RTDB only (hashed passwords)
// No plaintext passwords in source code
async function seedAccountsToFirebase(){
  console.warn('Accounts must be managed via Firebase Console or admin panel');
}
let currentUser=null;
const COLORS=['#d32f2f','#1e88e5','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1'];

// ===== SEED DATA =====
function initSampleData(){
  // First try to load from Firebase, then seed if empty
  if(firebaseReady&&firebaseDB){
    firebaseDB.ref('doanvien').once('value').then(snap=>{
      if(snap.val()){
        // Firebase has data — sync to localStorage
        SYNC_KEYS.forEach(k=>{
          firebaseDB.ref(k).once('value').then(s=>{
            if(s.val()!==null)localStorage.setItem(k,JSON.stringify(s.val()));
          });
        });
      }else{
        // Firebase empty — seed and push
        seedLocalData();
        SYNC_KEYS.forEach(k=>{
          const d=DB.get(k);
          if(d)firebaseDB.ref(k).set(k==='tailieu'?d.map(x=>{const c={...x};delete c.fileData;return c}):d);
        });
      }
      // Setup listeners after initial load
      setupFirebaseListeners();
      // Re-render after sync
      setTimeout(()=>{if(typeof App!=='undefined'&&App.init)App.init()},500);
    }).catch(e=>{
      console.warn('Firebase read failed:',e);
      seedLocalData();
      setupFirebaseListeners();
    });
  }else{
    seedLocalData();
  }
}

function seedLocalData(){
  if(!DB.get('doanvien')){
    DB.set('doanvien',[
      {id:'DV001',hoTen:'Nguyễn Văn An',ngaySinh:'2002-05-15',gioiTinh:'Nam',chiDoan:'24ICD',soDienThoai:'0901234001',email:'an@email.com',ngayKetNap:'2024-09-01',trangThai:'hoat-dong',thiDua:'Xuất sắc'},
      {id:'DV002',hoTen:'Trần Thị Bích',ngaySinh:'2003-06-20',gioiTinh:'Nữ',chiDoan:'24ICD',soDienThoai:'0901234002',email:'bich@email.com',ngayKetNap:'2024-10-15',trangThai:'hoat-dong',thiDua:'Tiên tiến'},
      {id:'DV003',hoTen:'Lê Minh Đức',ngaySinh:'2001-01-10',gioiTinh:'Nam',chiDoan:'24ICD',soDienThoai:'0901234003',email:'duc@email.com',ngayKetNap:'2024-03-20',trangThai:'tam-hoan',thiDua:'Hoàn thành'},
      {id:'DV004',hoTen:'Phạm Thị Hoa',ngaySinh:'2004-09-05',gioiTinh:'Nữ',chiDoan:'24ICD',soDienThoai:'0901234004',email:'hoa@email.com',ngayKetNap:'2025-01-15',trangThai:'hoat-dong',thiDua:'Xuất sắc'},
      {id:'DV005',hoTen:'Hoàng Văn Khánh',ngaySinh:'2002-12-25',gioiTinh:'Nam',chiDoan:'24ICD',soDienThoai:'0901234005',email:'khanh@email.com',ngayKetNap:'2024-11-01',trangThai:'hoat-dong',thiDua:'Tiên tiến'},
      {id:'DV006',hoTen:'Ngô Thị Lan',ngaySinh:'2003-04-18',gioiTinh:'Nữ',chiDoan:'24ICD',soDienThoai:'0901234006',email:'lan@email.com',ngayKetNap:'2025-02-10',trangThai:'hoat-dong',thiDua:'Xuất sắc'},
      {id:'DV007',hoTen:'Đỗ Quang Minh',ngaySinh:'2001-07-30',gioiTinh:'Nam',chiDoan:'24ICD',soDienThoai:'0901234007',email:'minh@email.com',ngayKetNap:'2024-06-15',trangThai:'hoat-dong',thiDua:'Hoàn thành'},
      {id:'DV008',hoTen:'Vũ Thanh Nga',ngaySinh:'2004-02-14',gioiTinh:'Nữ',chiDoan:'24ICD',soDienThoai:'0901234008',email:'nga@email.com',ngayKetNap:'2024-12-01',trangThai:'het-han',thiDua:'Không HT'},
      {id:'DV009',hoTen:'Bùi Văn Phong',ngaySinh:'2002-08-22',gioiTinh:'Nam',chiDoan:'24ICD',soDienThoai:'0901234009',email:'phong@email.com',ngayKetNap:'2025-03-01',trangThai:'hoat-dong',thiDua:'Tiên tiến'},
      {id:'DV010',hoTen:'Lý Thị Quỳnh',ngaySinh:'2003-11-08',gioiTinh:'Nữ',chiDoan:'24ICD',soDienThoai:'0901234010',email:'quynh@email.com',ngayKetNap:'2024-08-20',trangThai:'tam-hoan',thiDua:'Hoàn thành'}
    ]);
  }
  if(!DB.get('tailieu')){
    DB.set('tailieu',[
      {id:'TL001',tieuDe:'Nghị quyết Đại hội Đoàn lần XII',moTa:'Văn kiện chính thức',danhMuc:'Nghị quyết',loaiFile:'PDF',quyenXem:'Công khai',tags:['nghị quyết','đại hội'],ngayUpload:'2025-01-15T10:30:00',nguoiUpload:'Admin',luotXem:324,kichThuoc:'2.4 MB',fileData:null},
      {id:'TL002',tieuDe:'Tài liệu học tập NQ Đại hội XIV Đảng',moTa:'Tài liệu bồi dưỡng',danhMuc:'Học tập CT',loaiFile:'DOCX',quyenXem:'Nội bộ',tags:['nghị quyết','đảng'],ngayUpload:'2025-02-22T14:00:00',nguoiUpload:'Admin',luotXem:189,kichThuoc:'1.1 MB',fileData:null},
      {id:'TL003',tieuDe:'Ảnh Mùa hè xanh 2025',moTa:'Album hoạt động tình nguyện',danhMuc:'Phong trào',loaiFile:'Image',quyenXem:'Công khai',tags:['tình nguyện','mùa hè xanh'],ngayUpload:'2025-03-30T09:00:00',nguoiUpload:'Admin',luotXem:567,kichThuoc:'45 MB',fileData:null},
      {id:'TL004',tieuDe:'Kế hoạch công tác Đoàn 2025',moTa:'Kế hoạch năm',danhMuc:'Hành chính',loaiFile:'PDF',quyenXem:'Nội bộ',tags:['kế hoạch','2025'],ngayUpload:'2025-01-05T08:00:00',nguoiUpload:'Admin',luotXem:234,kichThuoc:'890 KB',fileData:null},
      {id:'TL005',tieuDe:'Slide bồi dưỡng lý luận chính trị',moTa:'6 bài LLCT',danhMuc:'Học tập CT',loaiFile:'PPTX',quyenXem:'Công khai',tags:['chính trị','lý luận'],ngayUpload:'2025-02-10T11:00:00',nguoiUpload:'Admin',luotXem:298,kichThuoc:'15 MB',fileData:null}
    ]);
  }
  if(!DB.get('sukien')){
    DB.set('sukien',[
      {id:'SK001',tenSuKien:'Ngày hội Thanh niên tình nguyện',moTa:'Tình nguyện vì cộng đồng',ngayToChuc:'2025-05-15',thoiGian:'08:00',diaDiem:'Quảng trường',trangThai:'sap-dien-ra',soLuongThamGia:120,danhSachThamGia:['DV001','DV004']},
      {id:'SK002',tenSuKien:'Lễ kết nạp Đoàn viên đợt 2',moTa:'Kết nạp 45 thanh niên ưu tú',ngayToChuc:'2025-05-20',thoiGian:'14:00',diaDiem:'Hội trường lớn',trangThai:'sap-dien-ra',soLuongThamGia:45,danhSachThamGia:[]},
      {id:'SK003',tenSuKien:'Hội thi Ánh sáng soi đường',moTa:'Tìm hiểu lịch sử Đảng và Đoàn',ngayToChuc:'2025-04-20',thoiGian:'08:00',diaDiem:'Sân khấu ngoài trời',trangThai:'hoan-thanh',soLuongThamGia:200,danhSachThamGia:['DV001','DV002','DV005']},
      {id:'SK004',tenSuKien:'Hiến máu nhân đạo đợt 1',moTa:'Hiến máu tình nguyện',ngayToChuc:'2025-04-05',thoiGian:'07:30',diaDiem:'Nhà văn hóa',trangThai:'hoan-thanh',soLuongThamGia:301,danhSachThamGia:['DV001','DV002','DV003','DV006']}
    ]);
  }
  if(!DB.get('thongbao')){
    DB.set('thongbao',[
      {id:'TB001',tieuDe:'Hoạt động mới',noiDung:'Sự kiện "Ngày hội Thanh niên tình nguyện" sẽ diễn ra vào 15/05.',loai:'info',daDoc:false,thoiGian:new Date(Date.now()-1000*60*60).toISOString()},
      {id:'TB002',tieuDe:'Tài liệu mới',noiDung:'Tài liệu "Nghị quyết Đại hội Đoàn lần XII" đã được upload.',loai:'info',daDoc:false,thoiGian:new Date(Date.now()-1000*60*60*2).toISOString()},
      {id:'TB003',tieuDe:'Kết nạp thành công',noiDung:'Bạn đã được kết nạp vào Đoàn TNCS HCM.',loai:'success',daDoc:true,thoiGian:new Date(Date.now()-1000*60*60*24).toISOString()}
    ]);
  }
  if(!DB.get('caiDat')){
    DB.set('caiDat',{thongBaoEmail:true,thongBaoWeb:false,darkMode:false,hieu_ung:true,baoMat2FA:false,tuDongDangXuat:true});
  }
}
