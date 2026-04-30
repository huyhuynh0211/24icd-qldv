// ===== STORAGE HELPERS =====
const DB={
  get(key){try{return JSON.parse(localStorage.getItem(key))||null}catch(e){return null}},
  set(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){console.warn('localStorage error',e)}},
  remove(key){try{localStorage.removeItem(key)}catch(e){}}
};
const ACCOUNTS={admin:{pass:'admin123',role:'admin',name:'Admin'},doanvien:{pass:'user123',role:'user',name:'Đoàn viên'}};
let currentUser=null;
const COLORS=['#d32f2f','#1e88e5','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1'];

// ===== SEED DATA =====
function initSampleData(){
  if(!DB.get('doanvien')){
    DB.set('doanvien',[
      {id:'DV001',hoTen:'Nguyễn Văn An',ngaySinh:'2002-05-15',gioiTinh:'Nam',chiDoan:'Chi đoàn K22A',soDienThoai:'0901234001',email:'an@email.com',ngayKetNap:'2024-09-01',trangThai:'hoat-dong',thiDua:'Xuất sắc',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:false,Q4_2025:false}},
      {id:'DV002',hoTen:'Trần Thị Bích',ngaySinh:'2003-06-20',gioiTinh:'Nữ',chiDoan:'Chi đoàn K22B',soDienThoai:'0901234002',email:'bich@email.com',ngayKetNap:'2024-10-15',trangThai:'hoat-dong',thiDua:'Tiên tiến',doanPhi:{Q1_2025:true,Q2_2025:false,Q3_2025:false,Q4_2025:false}},
      {id:'DV003',hoTen:'Lê Minh Đức',ngaySinh:'2001-01-10',gioiTinh:'Nam',chiDoan:'Chi đoàn K21C',soDienThoai:'0901234003',email:'duc@email.com',ngayKetNap:'2024-03-20',trangThai:'tam-hoan',thiDua:'Hoàn thành',doanPhi:{Q1_2025:true,Q2_2025:false,Q3_2025:false,Q4_2025:false}},
      {id:'DV004',hoTen:'Phạm Thị Hoa',ngaySinh:'2004-09-05',gioiTinh:'Nữ',chiDoan:'Chi đoàn K23A',soDienThoai:'0901234004',email:'hoa@email.com',ngayKetNap:'2025-01-15',trangThai:'hoat-dong',thiDua:'Xuất sắc',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:true,Q4_2025:false}},
      {id:'DV005',hoTen:'Hoàng Văn Khánh',ngaySinh:'2002-12-25',gioiTinh:'Nam',chiDoan:'Chi đoàn K22A',soDienThoai:'0901234005',email:'khanh@email.com',ngayKetNap:'2024-11-01',trangThai:'hoat-dong',thiDua:'Tiên tiến',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:false,Q4_2025:false}},
      {id:'DV006',hoTen:'Ngô Thị Lan',ngaySinh:'2003-04-18',gioiTinh:'Nữ',chiDoan:'Chi đoàn K22B',soDienThoai:'0901234006',email:'lan@email.com',ngayKetNap:'2025-02-10',trangThai:'hoat-dong',thiDua:'Xuất sắc',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:true,Q4_2025:true}},
      {id:'DV007',hoTen:'Đỗ Quang Minh',ngaySinh:'2001-07-30',gioiTinh:'Nam',chiDoan:'Chi đoàn K21C',soDienThoai:'0901234007',email:'minh@email.com',ngayKetNap:'2024-06-15',trangThai:'hoat-dong',thiDua:'Hoàn thành',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:true,Q4_2025:true}},
      {id:'DV008',hoTen:'Vũ Thanh Nga',ngaySinh:'2004-02-14',gioiTinh:'Nữ',chiDoan:'Chi đoàn K23A',soDienThoai:'0901234008',email:'nga@email.com',ngayKetNap:'2024-12-01',trangThai:'het-han',thiDua:'Không HT',doanPhi:{Q1_2025:false,Q2_2025:false,Q3_2025:false,Q4_2025:false}},
      {id:'DV009',hoTen:'Bùi Văn Phong',ngaySinh:'2002-08-22',gioiTinh:'Nam',chiDoan:'Chi đoàn K22A',soDienThoai:'0901234009',email:'phong@email.com',ngayKetNap:'2025-03-01',trangThai:'hoat-dong',thiDua:'Tiên tiến',doanPhi:{Q1_2025:true,Q2_2025:true,Q3_2025:true,Q4_2025:false}},
      {id:'DV010',hoTen:'Lý Thị Quỳnh',ngaySinh:'2003-11-08',gioiTinh:'Nữ',chiDoan:'Chi đoàn K22B',soDienThoai:'0901234010',email:'quynh@email.com',ngayKetNap:'2024-08-20',trangThai:'tam-hoan',thiDua:'Hoàn thành',doanPhi:{Q1_2025:true,Q2_2025:false,Q3_2025:false,Q4_2025:false}}
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
      {id:'TB001',tieuDe:'Nhắc đóng đoàn phí',noiDung:'Bạn chưa đóng đoàn phí Q2/2025. Vui lòng đóng trước 30/06.',loai:'warning',daDoc:false,thoiGian:new Date(Date.now()-1000*60*5).toISOString()},
      {id:'TB002',tieuDe:'Sự kiện sắp diễn ra',noiDung:'Ngày hội Thanh niên tình nguyện sẽ diễn ra vào 15/05.',loai:'info',daDoc:false,thoiGian:new Date(Date.now()-1000*60*60).toISOString()},
      {id:'TB003',tieuDe:'Kết nạp thành công',noiDung:'Bạn đã được kết nạp vào Đoàn TNCS HCM.',loai:'success',daDoc:true,thoiGian:new Date(Date.now()-1000*60*60*24).toISOString()}
    ]);
  }
  if(!DB.get('caiDat')){
    DB.set('caiDat',{thongBaoEmail:true,thongBaoWeb:false,nhacDoanPhi:true,darkMode:false,hieu_ung:true,baoMat2FA:false,tuDongDangXuat:true});
  }
}
