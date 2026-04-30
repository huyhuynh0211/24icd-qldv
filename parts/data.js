// ===== DATA =====
const ACCOUNTS={admin:{pass:'admin123',role:'admin',name:'Admin'},doanvien:{pass:'user123',role:'user',name:'Đoàn viên'}};
let currentUser=null;
const COLORS=['#d32f2f','#1e88e5','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1','#ef4444','#84cc16'];
const MEMBERS=[
{id:'24ICD001',name:'Nguyễn Văn An',dob:'2004-03-15',gender:'Nam',unit:'K22A',phone:'0901234001',email:'an.nv@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD002',name:'Trần Thị Bích',dob:'2004-06-20',gender:'Nữ',unit:'K22B',phone:'0901234002',email:'bich.tt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'debt',Q4:'debt'},rank:'Khá'},
{id:'24ICD003',name:'Lê Minh Đức',dob:'2003-01-10',gender:'Nam',unit:'K21C',phone:'0901234003',email:'duc.lm@email.com',joinDate:'2021-10-20',status:'paused',fee:{Q1:'paid',Q2:'debt',Q3:'debt',Q4:'debt'},rank:'TB'},
{id:'24ICD004',name:'Phạm Thị Hoa',dob:'2005-09-05',gender:'Nữ',unit:'K23A',phone:'0901234004',email:'hoa.pt@email.com',joinDate:'2023-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD005',name:'Hoàng Văn Khánh',dob:'2004-12-25',gender:'Nam',unit:'K22A',phone:'0901234005',email:'khanh.hv@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'debt'},rank:'Khá'},
{id:'24ICD006',name:'Ngô Thị Lan',dob:'2004-04-18',gender:'Nữ',unit:'K22B',phone:'0901234006',email:'lan.nt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD007',name:'Đỗ Quang Minh',dob:'2003-07-30',gender:'Nam',unit:'K21C',phone:'0901234007',email:'minh.dq@email.com',joinDate:'2021-10-20',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD008',name:'Vũ Thanh Nga',dob:'2005-02-14',gender:'Nữ',unit:'K23A',phone:'0901234008',email:'nga.vt@email.com',joinDate:'2023-10-15',status:'expired',fee:{Q1:'debt',Q2:'debt',Q3:'debt',Q4:'debt'},rank:'TB'},
{id:'24ICD009',name:'Bùi Văn Phong',dob:'2004-08-22',gender:'Nam',unit:'K22A',phone:'0901234009',email:'phong.bv@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'},
{id:'24ICD010',name:'Lý Thị Quỳnh',dob:'2004-11-08',gender:'Nữ',unit:'K22B',phone:'0901234010',email:'quynh.lt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD011',name:'Nguyễn Hữu Rạng',dob:'2003-05-12',gender:'Nam',unit:'K21C',phone:'0901234011',email:'rang.nh@email.com',joinDate:'2021-10-20',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'debt',Q4:'debt'},rank:'Khá'},
{id:'24ICD012',name:'Phan Thị Sương',dob:'2005-10-30',gender:'Nữ',unit:'K23A',phone:'0901234012',email:'suong.pt@email.com',joinDate:'2023-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD013',name:'Trương Văn Tài',dob:'2004-01-25',gender:'Nam',unit:'K22A',phone:'0901234013',email:'tai.tv@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'},
{id:'24ICD014',name:'Huỳnh Thị Uyên',dob:'2004-07-17',gender:'Nữ',unit:'K22B',phone:'0901234014',email:'uyen.ht@email.com',joinDate:'2022-10-15',status:'paused',fee:{Q1:'paid',Q2:'paid',Q3:'debt',Q4:'debt'},rank:'TB'},
{id:'24ICD015',name:'Đặng Quốc Việt',dob:'2003-03-03',gender:'Nam',unit:'K21C',phone:'0901234015',email:'viet.dq@email.com',joinDate:'2021-10-20',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD016',name:'Mai Xuân Vy',dob:'2005-12-12',gender:'Nữ',unit:'K23A',phone:'0901234016',email:'vy.mx@email.com',joinDate:'2023-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'debt'},rank:'Khá'},
{id:'24ICD017',name:'Cao Thanh Bình',dob:'2004-09-09',gender:'Nam',unit:'K22A',phone:'0901234017',email:'binh.ct@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD018',name:'Lương Thị Cẩm',dob:'2004-06-06',gender:'Nữ',unit:'K22B',phone:'0901234018',email:'cam.lt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'},
{id:'24ICD019',name:'Tô Minh Dũng',dob:'2003-04-04',gender:'Nam',unit:'K21C',phone:'0901234019',email:'dung.tm@email.com',joinDate:'2021-10-20',status:'paused',fee:{Q1:'paid',Q2:'debt',Q3:'debt',Q4:'debt'},rank:'TB'},
{id:'24ICD020',name:'Hồ Ngọc Giang',dob:'2005-08-28',gender:'Nam',unit:'K23A',phone:'0901234020',email:'giang.hn@email.com',joinDate:'2023-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD021',name:'Võ Thị Hạnh',dob:'2004-02-19',gender:'Nữ',unit:'K22A',phone:'0901234021',email:'hanh.vt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'},
{id:'24ICD022',name:'Đinh Văn Khôi',dob:'2004-10-10',gender:'Nam',unit:'K22B',phone:'0901234022',email:'khoi.dv@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Xuất sắc'},
{id:'24ICD023',name:'Châu Thị Linh',dob:'2003-11-11',gender:'Nữ',unit:'K21C',phone:'0901234023',email:'linh.ct@email.com',joinDate:'2021-10-20',status:'expired',fee:{Q1:'debt',Q2:'debt',Q3:'debt',Q4:'debt'},rank:'TB'},
{id:'24ICD024',name:'Trịnh Quang Nam',dob:'2005-05-25',gender:'Nam',unit:'K23A',phone:'0901234024',email:'nam.tq@email.com',joinDate:'2023-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'paid',Q4:'paid'},rank:'Khá'},
{id:'24ICD025',name:'Lê Thị Phượng',dob:'2004-04-04',gender:'Nữ',unit:'K22A',phone:'0901234025',email:'phuong.lt@email.com',joinDate:'2022-10-15',status:'active',fee:{Q1:'paid',Q2:'paid',Q3:'debt',Q4:'debt'},rank:'Khá'}
];
const DOCUMENTS=[
{id:1,title:'Nghị quyết Đại hội Đoàn toàn quốc lần thứ XII',type:'pdf',size:'2.4MB',date:'2025-01-15',category:'nghi-quyet',views:324,uploader:'Admin',tags:['nghị quyết','đại hội','XII']},
{id:2,title:'Tài liệu học tập Nghị quyết Đại hội XIV của Đảng',type:'docx',size:'1.1MB',date:'2025-02-22',category:'hoc-tap',views:189,uploader:'Admin',tags:['nghị quyết','đảng','XIV']},
{id:3,title:'Ảnh hoạt động Mùa hè xanh 2025',type:'img',size:'45MB',date:'2025-03-30',category:'phong-trao',views:567,uploader:'Admin',tags:['tình nguyện','mùa hè xanh']},
{id:4,title:'Kế hoạch công tác Đoàn năm 2025',type:'pdf',size:'890KB',date:'2025-01-05',category:'hanh-chinh',views:234,uploader:'Admin',tags:['kế hoạch','2025']},
{id:5,title:'Báo cáo tổng kết công tác Đoàn 2024',type:'pdf',size:'3.2MB',date:'2024-12-28',category:'hanh-chinh',views:412,uploader:'Admin',tags:['báo cáo','tổng kết']},
{id:6,title:'Slide bồi dưỡng lý luận chính trị',type:'pptx',size:'15MB',date:'2025-02-10',category:'hoc-tap',views:298,uploader:'Admin',tags:['chính trị','lý luận']},
{id:7,title:'Hướng dẫn tổ chức Đại hội Chi đoàn',type:'docx',size:'520KB',date:'2025-03-18',category:'hanh-chinh',views:156,uploader:'Admin',tags:['đại hội','chi đoàn']},
{id:8,title:'6 bài học lý luận chính trị dành cho Đoàn viên',type:'pdf',size:'4.7MB',date:'2025-03-01',category:'hoc-tap',views:723,uploader:'Admin',tags:['6 bài','đoàn viên']},
{id:9,title:'Ảnh Lễ kết nạp Đoàn viên mới K23',type:'img',size:'28MB',date:'2025-03-20',category:'phong-trao',views:445,uploader:'Admin',tags:['kết nạp','K23']},
{id:10,title:'Nghị quyết Hội nghị BCH TW Đoàn lần thứ 5',type:'pdf',size:'1.8MB',date:'2025-02-12',category:'nghi-quyet',views:267,uploader:'Admin',tags:['BCH','trung ương']},
{id:11,title:'Phong trào Thanh niên tình nguyện 2025',type:'docx',size:'780KB',date:'2025-03-25',category:'phong-trao',views:198,uploader:'Admin',tags:['tình nguyện','thanh niên']},
{id:12,title:'Biểu mẫu đánh giá thi đua Chi đoàn',type:'docx',size:'340KB',date:'2025-04-08',category:'hanh-chinh',views:89,uploader:'Admin',tags:['thi đua','biểu mẫu']},
{id:13,title:'Nghị quyết về chuyển đổi số trong công tác Đoàn',type:'pdf',size:'1.5MB',date:'2025-01-20',category:'nghi-quyet',views:312,uploader:'Admin',tags:['chuyển đổi số']},
{id:14,title:'Tài liệu tập huấn kỹ năng mềm cho cán bộ Đoàn',type:'pptx',size:'22MB',date:'2025-02-28',category:'hoc-tap',views:445,uploader:'Admin',tags:['kỹ năng mềm','tập huấn']},
{id:15,title:'Ảnh Giải bóng đá Đoàn viên 2025',type:'img',size:'35MB',date:'2025-04-10',category:'phong-trao',views:332,uploader:'Admin',tags:['bóng đá','thể thao']},
{id:16,title:'Quy chế hoạt động BCH Chi đoàn',type:'pdf',size:'450KB',date:'2025-01-08',category:'hanh-chinh',views:178,uploader:'Admin',tags:['quy chế','BCH']},
{id:17,title:'Chương trình hành động thực hiện NQ Đại hội Đoàn',type:'pdf',size:'2.1MB',date:'2025-02-05',category:'nghi-quyet',views:289,uploader:'Admin',tags:['chương trình','hành động']},
{id:18,title:'Tài liệu sinh hoạt Chi đoàn chủ đề tháng 3',type:'docx',size:'650KB',date:'2025-03-05',category:'hoc-tap',views:534,uploader:'Admin',tags:['sinh hoạt','tháng 3']},
{id:19,title:'Ảnh Lễ hội Xuân tình nguyện 2025',type:'img',size:'52MB',date:'2025-01-28',category:'phong-trao',views:678,uploader:'Admin',tags:['xuân','tình nguyện']},
{id:20,title:'Hướng dẫn đóng đoàn phí năm 2025',type:'pdf',size:'280KB',date:'2025-01-02',category:'hanh-chinh',views:892,uploader:'Admin',tags:['đoàn phí','hướng dẫn']}
];
const EVENTS=[
{id:1,title:'Ngày hội Thanh niên tình nguyện',startDate:'2025-05-15',endDate:'2025-05-15',location:'Quảng trường Trung tâm',attendees:120,maxAttendees:150,status:'upcoming',desc:'Hoạt động tình nguyện vì cộng đồng, dọn vệ sinh môi trường'},
{id:2,title:'Lễ kết nạp Đoàn viên mới đợt 2',startDate:'2025-05-20',endDate:'2025-05-20',location:'Hội trường lớn',attendees:45,maxAttendees:60,status:'upcoming',desc:'Kết nạp 45 thanh niên ưu tú vào tổ chức Đoàn'},
{id:3,title:'Tập huấn cán bộ Đoàn cơ sở',startDate:'2025-04-28',endDate:'2025-04-29',location:'Phòng họp A3',attendees:30,maxAttendees:30,status:'ongoing',desc:'Bồi dưỡng nghiệp vụ cho cán bộ Đoàn các chi đoàn'},
{id:4,title:'Hội thi Ánh sáng soi đường',startDate:'2025-04-20',endDate:'2025-04-20',location:'Sân khấu ngoài trời',attendees:200,maxAttendees:200,status:'done',desc:'Cuộc thi tìm hiểu lịch sử Đảng và Đoàn'},
{id:5,title:'Giải bóng đá Đoàn viên 2025',startDate:'2025-04-10',endDate:'2025-04-12',location:'Sân vận động',attendees:160,maxAttendees:200,status:'done',desc:'Giải đấu thể thao giao lưu giữa các chi đoàn'},
{id:6,title:'Hiến máu nhân đạo đợt 1/2025',startDate:'2025-04-05',endDate:'2025-04-05',location:'Nhà văn hóa',attendees:301,maxAttendees:300,status:'done',desc:'Chương trình hiến máu tình nguyện'},
{id:7,title:'Chiến dịch Xuân tình nguyện',startDate:'2025-01-28',endDate:'2025-02-02',location:'Các xã vùng sâu',attendees:80,maxAttendees:100,status:'done',desc:'Tặng quà Tết cho bà con vùng khó khăn'},
{id:8,title:'Hội nghị BCH Đoàn mở rộng',startDate:'2025-03-15',endDate:'2025-03-15',location:'Hội trường lớn',attendees:55,maxAttendees:60,status:'done',desc:'Đánh giá công tác quý 1 và triển khai kế hoạch quý 2'},
{id:9,title:'Cuộc thi Ý tưởng sáng tạo trẻ',startDate:'2025-05-25',endDate:'2025-05-27',location:'Trung tâm CNTT',attendees:0,maxAttendees:100,status:'upcoming',desc:'Khuyến khích đoàn viên sáng tạo giải pháp công nghệ'},
{id:10,title:'Ngày hội việc làm cho thanh niên',startDate:'2025-06-01',endDate:'2025-06-01',location:'Khuôn viên trường',attendees:0,maxAttendees:500,status:'upcoming',desc:'Kết nối sinh viên với doanh nghiệp tuyển dụng'},
{id:11,title:'Lễ tuyên dương Đoàn viên tiêu biểu',startDate:'2025-03-26',endDate:'2025-03-26',location:'Hội trường lớn',attendees:120,maxAttendees:150,status:'done',desc:'Khen thưởng đoàn viên xuất sắc năm 2024'},
{id:12,title:'Dọn vệ sinh bãi biển',startDate:'2025-04-22',endDate:'2025-04-22',location:'Bãi biển Mỹ Khê',attendees:95,maxAttendees:100,status:'done',desc:'Hưởng ứng Ngày Trái đất 22/4'}
];
