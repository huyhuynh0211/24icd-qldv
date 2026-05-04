# Đoàn TNCS HCM — Member Management & Document Digitization System

**Chi Đoàn 24ICD — Department of Electronics & Telecommunications, University of Science, VNU-HCM**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Deployment](#deployment)
- [Firebase Data Structure](#firebase-data-structure)
- [User Roles](#user-roles)
- [Contributing](#contributing)

---

## Overview

A comprehensive web platform for the Ho Chi Minh Communist Youth Union — managing member records, organizing youth activities, and digitizing learning materials according to modern standards.

---

## Features

### 1. Dashboard
- Summary statistics: total members, active members, events this month, documents
- 6-month enrollment trend (Line Chart)
- Gender distribution (Doughnut Chart)
- Recent activity feed

### 2. Member Management
- Data table with 31 fields per member
- Search, filter by status, sortable columns
- Add / Edit / Delete members (Admin)
- Import members from CSV/Excel files
- Inline evaluation rating updates
- **Member Card PDF export** (85×54mm) with QR code

### 3. Document Library
- Upload PDF, DOCX, PPTX, images, videos
- Storage on Google Drive via Apps Script API
- Categories: Nghị quyết, Học tập CT, Phong trào, Hành chính
- Search by title or tags
- Filter by file type, sort by date/views/alphabetical

### 4. Events & Activities
- **List View** — event listing, filter by status, register, export attendee list
- **Calendar View** — monthly grid with red-highlighted event dates, click to filter list
- **Tasks Tab** — assign tasks to members per event, track deadlines, mark done
- Stats: total events, completed, upcoming, attendance count
- Dashboard stat card: "Tasks due today: X pending"

### 5. Reports & Analytics
- Export reports for members, activities, documents
- Formats: **Excel (XLSX)** and **PDF (jsPDF)**
- Interactive charts for visual reporting

### 6. Settings
- Theme: Dark / Light mode, animation effects
- Notifications: Email / Web push
- Security: 2FA, auto-logout (Admin)
- Change password
- **System Log (Admin)** — timeline of all actions: add/edit/delete members, documents, events, tasks. Export log to Excel

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | Vanilla JS, CSS Custom Properties |
| Backend | Firebase Realtime Database |
| Charts | Chart.js 4.4 |
| File Upload | Google Apps Script (Google Drive) |
| Excel Export | SheetJS (XLSX) |
| PDF Export | jsPDF + jsPDF AutoTable |
| QR Code | QRCode.js |
| Password Hashing | SHA-256 (Web Crypto API) |
| Font | Google Fonts — Inter |

---

## Setup

### Requirements
- Modern browser with ES6+ support
- Firebase account (pre-configured in `index.html`)
- HTTPS for Web Crypto API and Firebase (or use localhost)

### Run locally

```bash
# Clone the repository
git clone https://github.com/huyhuynh0211/24icd-qldv.git
cd 24icd-qldv

# Serve with a local server (Firebase requires HTTPS)
python3 -m http.server 8080
# or
npx serve .

# Open http://localhost:8080
```

### Default accounts

> **Note:** This project uses Firebase Realtime Database — accounts are managed entirely through Firebase Console. No default passwords are hardcoded. Contact the Admin to request an account.

---

## Deployment

### GitHub Pages
```bash
./build.sh
```
The build script concatenates part files into `index.html`. Push to the `gh-pages` branch to deploy.

### Custom Firebase Configuration

Update the Firebase config in the `<script>` tag of the HTML file:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Firebase Data Structure

```
icd-qldv/
├── accounts/         # User accounts {username: {pass, name, role}}
├── doanvien/         # Member list []
├── tailieu/          # Document list []
├── sukien/           # Event list []
├── thongbao/         # Notifications []
├── tasks/            # Tasks []
├── logs/             # System audit log []
├── caiDat/           # User preferences {}
└── sessions/         # Login sessions {token: {username, createdAt}}
```

### Member object
```json
{
  "id": "DVxxxxx",
  "hoTen": "Nguyen Van A",
  "ngaySinh": "2002-01-01",
  "gioiTinh": "Nam",
  "chiDoan": "24ICD",
  "trangThai": "hoat-dong",
  "email": "email@student.hcmus.edu.vn",
  "soDienThoai": "0912345678",
  "maDinhDanh": "",
  "soTheDoan": "",
  "soCCCD": "",
  "ngayKetNap": "2020-05-01",
  "thiDua": "Hoàn thành",
  "danhGia": "Hoàn thành nhiệm vụ"
}
```

### Event object
```json
{
  "id": "SKxxxxx",
  "tenSuKien": "Spring Camp 2025",
  "ngayToChuc": "2025-03-01",
  "thoiGian": "08:00",
  "diaDiem": "Zone A",
  "trangThai": "sap-dien-ra",
  "soLuongThamGia": 50,
  "danhSachThamGia": ["username1", "username2"]
}
```

### Task object
```json
{
  "id": "TKxxxxx",
  "title": "Prepare program",
  "assignee": "memberId",
  "eventId": "SKxxxxx",
  "deadline": "2025-03-01",
  "status": "todo",
  "createdBy": "adminUsername",
  "createdAt": 1704067200000
}
```

### Log object
```json
{
  "action": "add",
  "target": "DoanVien: Nguyen Van A",
  "user": "adminUsername",
  "time": 1704067200000
}
```

---

## User Roles

| Feature | Admin | Member |
|---|---|---|
| View Dashboard | ✅ | ✅ |
| View member list | ✅ | ✅ |
| Add/Edit/Delete members | ✅ | ❌ |
| Import CSV/Excel | ✅ | ❌ |
| Export member card PDF | ✅ | ✅ |
| Upload documents | ✅ | ✅ |
| Delete documents | ✅ | ❌ |
| Create events | ✅ | ❌ |
| Delete events | ✅ | ❌ |
| View/Export attendee list | ✅ | ❌ |
| Create/Assign tasks | ✅ | ❌ |
| Mark task done | ✅ | ✅ (own tasks) |
| View system log | ✅ | ❌ |
| Security settings | ✅ | ❌ |

---

## Contributing

Contributions are welcome:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add feature-name'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

---

**© 2025 Chi Đoàn — Chi Hội ICD1 K24 — University of Science, VNU-HCM**