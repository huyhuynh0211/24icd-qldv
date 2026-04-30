/**
 * Script.js — Đoàn TNCS HCM Management System
 * SPA navigation, mock data rendering, search/filter, animations
 */

// ========== MOCK DATA ==========

const MEMBERS = [
  { id: 'DV001', name: 'Nguyễn Văn An', unit: 'Chi đoàn K22A', fee: 'Đã đóng', rank: 'Xuất sắc', status: 'active', color: '#1E88E5' },
  { id: 'DV002', name: 'Trần Thị Bích', unit: 'Chi đoàn K22B', fee: 'Nợ Q3', rank: 'Khá', status: 'active', color: '#10B981' },
  { id: 'DV003', name: 'Lê Minh Đức', unit: 'Chi đoàn K21C', fee: 'Chưa đóng', rank: 'TB', status: 'paused', color: '#F59E0B' },
  { id: 'DV004', name: 'Phạm Thị Hoa', unit: 'Chi đoàn K23A', fee: 'Đã đóng', rank: 'Xuất sắc', status: 'active', color: '#8B5CF6' },
  { id: 'DV005', name: 'Hoàng Văn Khánh', unit: 'Chi đoàn K22A', fee: 'Đã đóng', rank: 'Khá', status: 'active', color: '#EF4444' },
  { id: 'DV006', name: 'Ngô Thị Lan', unit: 'Chi đoàn K22B', fee: 'Nợ Q2', rank: 'TB', status: 'active', color: '#06B6D4' },
  { id: 'DV007', name: 'Đỗ Quang Minh', unit: 'Chi đoàn K21C', fee: 'Đã đóng', rank: 'Xuất sắc', status: 'active', color: '#EC4899' },
  { id: 'DV008', name: 'Vũ Thanh Nga', unit: 'Chi đoàn K23A', fee: 'Chưa đóng', rank: 'Khá', status: 'expired', color: '#F97316' },
  { id: 'DV009', name: 'Bùi Văn Phong', unit: 'Chi đoàn K22A', fee: 'Đã đóng', rank: 'Xuất sắc', status: 'active', color: '#14B8A6' },
  { id: 'DV010', name: 'Lý Thị Quỳnh', unit: 'Chi đoàn K22B', fee: 'Đã đóng', rank: 'Khá', status: 'active', color: '#6366F1' },
];

const DOCUMENTS = [
  { id: 1, title: 'Nghị quyết Đại hội Đoàn lần XII', type: 'pdf', size: '2.4MB', date: '15/01/2025', category: 'nghi-quyet', views: 324, access: 'Công khai' },
  { id: 2, title: 'Tài liệu học tập Nghị quyết Đại hội XIV của Đảng', type: 'docx', size: '1.1MB', date: '22/02/2025', category: 'hoc-tap', views: 189, access: 'Nội bộ' },
  { id: 3, title: 'Ảnh hoạt động tình nguyện Mùa hè xanh T3/2025', type: 'img', size: '45MB', date: '30/03/2025', category: 'phong-trao', views: 567, access: 'Công khai' },
  { id: 4, title: 'Kế hoạch công tác Đoàn năm 2025', type: 'pdf', size: '890KB', date: '05/01/2025', category: 'hanh-chinh', views: 234, access: 'Nội bộ' },
  { id: 5, title: 'Báo cáo tổng kết công tác Đoàn 2024', type: 'pdf', size: '3.2MB', date: '28/12/2024', category: 'hanh-chinh', views: 412, access: 'Nội bộ' },
  { id: 6, title: 'Slide bồi dưỡng lý luận chính trị', type: 'pptx', size: '15MB', date: '10/02/2025', category: 'hoc-tap', views: 298, access: 'Công khai' },
  { id: 7, title: 'Hướng dẫn tổ chức Đại hội Chi đoàn', type: 'docx', size: '520KB', date: '18/03/2025', category: 'hanh-chinh', views: 156, access: 'Nội bộ' },
  { id: 8, title: '6 bài học lý luận chính trị cho Đoàn viên', type: 'pdf', size: '4.7MB', date: '01/03/2025', category: 'hoc-tap', views: 723, access: 'Công khai' },
  { id: 9, title: 'Ảnh Lễ kết nạp Đoàn viên mới K23', type: 'img', size: '28MB', date: '20/03/2025', category: 'phong-trao', views: 445, access: 'Công khai' },
  { id: 10, title: 'Nghị quyết Hội nghị BCH Trung ương Đoàn', type: 'pdf', size: '1.8MB', date: '12/02/2025', category: 'nghi-quyet', views: 267, access: 'Nội bộ' },
  { id: 11, title: 'Phong trào Thanh niên tình nguyện 2025', type: 'docx', size: '780KB', date: '25/03/2025', category: 'phong-trao', views: 198, access: 'Công khai' },
  { id: 12, title: 'Biểu mẫu đánh giá thi đua Chi đoàn', type: 'docx', size: '340KB', date: '08/04/2025', category: 'hanh-chinh', views: 89, access: 'Nội bộ' },
];

const EVENTS = [
  { id: 1, title: 'Ngày hội Thanh niên tình nguyện', date: '2025-05-15', location: 'Quảng trường Trung tâm', attendees: 120, status: 'upcoming', desc: 'Hoạt động tình nguyện vì cộng đồng, dọn vệ sinh môi trường' },
  { id: 2, title: 'Lễ kết nạp Đoàn viên mới đợt 2', date: '2025-05-20', location: 'Hội trường lớn', attendees: 45, status: 'upcoming', desc: 'Kết nạp 45 thanh niên ưu tú vào tổ chức Đoàn' },
  { id: 3, title: 'Tập huấn cán bộ Đoàn cơ sở', date: '2025-04-28', location: 'Phòng họp A3', attendees: 30, status: 'done', desc: 'Bồi dưỡng nghiệp vụ cho cán bộ Đoàn các chi đoàn' },
  { id: 4, title: 'Hội thi "Ánh sáng soi đường"', date: '2025-04-20', location: 'Sân khấu ngoài trời', attendees: 200, status: 'done', desc: 'Cuộc thi tìm hiểu lịch sử Đảng và Đoàn' },
  { id: 5, title: 'Giải bóng đá Đoàn viên', date: '2025-04-10', location: 'Sân vận động', attendees: 160, status: 'done', desc: 'Giải đấu thể thao giao lưu giữa các chi đoàn' },
  { id: 6, title: 'Hiến máu nhân đạo đợt 1/2025', date: '2025-04-05', location: 'Nhà văn hóa', attendees: 301, status: 'done', desc: 'Chương trình hiến máu tình nguyện' },
];

// ========== DOM ELEMENTS ==========

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const navItems = document.querySelectorAll('.nav-item[data-page]');
const pages = document.querySelectorAll('.page');

// ========== SPA NAVIGATION ==========

/**
 * Chuyển trang SPA - ẩn tất cả page, hiện page được chọn
 * @param {string} pageId - ID trang cần hiển thị
 */
function navigateTo(pageId) {
  // Cập nhật sidebar active state
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Chuyển page
  pages.forEach(page => {
    page.classList.toggle('active', page.id === `page-${pageId}`);
  });

  // Đóng sidebar trên mobile
  closeSidebar();

  // Trigger animations khi vào dashboard
  if (pageId === 'dashboard') {
    animateCounters();
  }
}

navItems.forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ========== SIDEBAR MOBILE ==========

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}

menuToggle.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// ========== COUNTER ANIMATION ==========

/**
 * Animate số trên dashboard cards từ 0 đến giá trị thật
 */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count, 10);
    const duration = 1500;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      counter.textContent = current.toLocaleString('vi-VN');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

// ========== RENDER MEMBERS TABLE ==========

/**
 * Render bảng đoàn viên dựa trên filter và search
 */
function renderMembers(searchTerm = '', statusFilter = 'all') {
  const tbody = document.getElementById('memberTableBody');
  const countEl = document.getElementById('memberCount');

  let filtered = MEMBERS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  countEl.textContent = `Hiển thị ${filtered.length} đoàn viên`;

  tbody.innerHTML = filtered.map(m => {
    const statusMap = {
      active: { label: 'Hoạt động', class: 'badge-success' },
      paused: { label: 'Tạm hoãn', class: 'badge-warning' },
      expired: { label: 'Hết hạn', class: 'badge-danger' },
    };
    const feeClass = m.fee === 'Đã đóng' ? 'badge-success' : m.fee.includes('Nợ') ? 'badge-warning' : 'badge-danger';
    const rankClass = m.rank === 'Xuất sắc' ? 'badge-primary' : m.rank === 'Khá' ? 'badge-info' : 'badge-warning';
    const st = statusMap[m.status];
    const initials = m.name.split(' ').slice(-2).map(w => w[0]).join('');

    return `<tr>
      <td>
        <div class="member-info">
          <div class="member-avatar" style="background:${m.color}">${initials}</div>
          <div>
            <div class="member-name">${m.name}</div>
            <div class="member-id">${m.id}</div>
          </div>
        </div>
      </td>
      <td>${m.unit}</td>
      <td><span class="badge ${feeClass}">${m.fee}</span></td>
      <td><span class="badge ${rankClass}">${m.rank}</span></td>
      <td><span class="badge ${st.class}">${st.label}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-icon" title="Xem">👁️</button>
          <button class="btn-icon" title="Sửa">✏️</button>
          <button class="btn-icon" title="Xóa">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// Search & filter events for members
document.getElementById('memberSearch').addEventListener('input', (e) => {
  const filter = document.getElementById('memberFilter').value;
  renderMembers(e.target.value, filter);
});

document.getElementById('memberFilter').addEventListener('change', (e) => {
  const search = document.getElementById('memberSearch').value;
  renderMembers(search, e.target.value);
});

// ========== RENDER DOCUMENTS ==========

const TYPE_ICONS = { pdf: '📄', docx: '📘', img: '🖼️', pptx: '📊', zip: '📦' };

/**
 * Render grid tài liệu với filter theo category, type, search và sort
 */
function renderDocuments(options = {}) {
  const { category = 'all', type = 'all', search = '', sort = 'newest' } = options;
  const grid = document.getElementById('docGrid');

  let filtered = DOCUMENTS.filter(doc => {
    const matchCat = category === 'all' || doc.category === category;
    const matchType = type === 'all' || doc.type === type;
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  // Sort
  if (sort === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  } else if (sort === 'views') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sort === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  }

  grid.innerHTML = filtered.map(doc => `
    <div class="doc-card">
      <div class="doc-card-preview ${doc.type}">
        ${TYPE_ICONS[doc.type] || '📄'}
        <span class="doc-category">${getCategoryLabel(doc.category)}</span>
      </div>
      <div class="doc-card-body">
        <h4>${doc.title}</h4>
        <div class="doc-card-meta">
          <span>${doc.type.toUpperCase()}</span>
          <span>•</span>
          <span>${doc.size}</span>
          <span>•</span>
          <span>${doc.date}</span>
        </div>
      </div>
      <div class="doc-card-footer">
        <span class="badge ${doc.access === 'Công khai' ? 'badge-success' : 'badge-warning'}">${doc.access}</span>
        <span class="views">👁️ ${doc.views}</span>
      </div>
    </div>
  `).join('');
}

function getCategoryLabel(cat) {
  const map = {
    'nghi-quyet': 'Nghị quyết',
    'hoc-tap': 'Học tập CT',
    'phong-trao': 'Phong trào',
    'hanh-chinh': 'Hành chính',
  };
  return map[cat] || cat;
}

// Tab filter events
document.querySelectorAll('#docTabs .tab-filter').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#docTabs .tab-filter').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    applyDocFilters();
  });
});

document.getElementById('docSearchInput').addEventListener('input', applyDocFilters);
document.getElementById('docTypeFilter').addEventListener('change', applyDocFilters);
document.getElementById('docSortFilter').addEventListener('change', applyDocFilters);

function applyDocFilters() {
  const category = document.querySelector('#docTabs .tab-filter.active').dataset.category;
  const type = document.getElementById('docTypeFilter').value;
  const search = document.getElementById('docSearchInput').value;
  const sort = document.getElementById('docSortFilter').value;
  renderDocuments({ category, type, search, sort });
}

// ========== RENDER EVENTS ==========

/**
 * Render danh sách sự kiện với filter trạng thái
 */
function renderEvents(filter = 'all') {
  const list = document.getElementById('eventList');

  const filtered = EVENTS.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  list.innerHTML = filtered.map(e => {
    const d = new Date(e.date);
    const day = d.getDate();
    const months = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];
    const month = months[d.getMonth()];
    const statusLabel = e.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã hoàn thành';
    const statusClass = e.status === 'upcoming' ? 'badge-info' : 'badge-success';

    return `
      <div class="event-card">
        <div class="event-date">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
        </div>
        <div class="event-info">
          <h4>${e.title}</h4>
          <p>${e.desc}</p>
          <div class="event-meta">
            <span>📍 ${e.location}</span>
            <span>👥 ${e.attendees} người</span>
          </div>
        </div>
        <div class="event-status">
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Event filter buttons
document.querySelectorAll('[data-event-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-event-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderEvents(btn.dataset.eventFilter);
  });
});

// ========== MODALS ==========

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

// Upload modal
document.getElementById('btnUploadDoc').addEventListener('click', () => openModal('uploadModal'));
document.getElementById('navUpload').addEventListener('click', () => openModal('uploadModal'));
document.getElementById('closeUploadModal').addEventListener('click', () => closeModal('uploadModal'));
document.getElementById('cancelUpload').addEventListener('click', () => closeModal('uploadModal'));

// Member modal
document.getElementById('btnAddMember').addEventListener('click', () => openModal('memberModal'));
document.getElementById('closeMemberModal').addEventListener('click', () => closeModal('memberModal'));
document.getElementById('cancelMember').addEventListener('click', () => closeModal('memberModal'));

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

// ========== TOGGLE SWITCHES ==========

document.querySelectorAll('.toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
  });
});

// ========== SIMPLE BAR CHART (Canvas) ==========

/**
 * Vẽ biểu đồ cột đơn giản trên canvas
 */
function drawChart() {
  const canvas = document.getElementById('memberChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 30, right: 20, bottom: 50, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const data = [
    { label: 'T1', value: 42 },
    { label: 'T2', value: 35 },
    { label: 'T3', value: 58 },
    { label: 'T4', value: 47 },
    { label: 'T5', value: 63 },
    { label: 'T6', value: 71 },
    { label: 'T7', value: 55 },
    { label: 'T8', value: 48 },
    { label: 'T9', value: 82 },
    { label: 'T10', value: 67 },
    { label: 'T11', value: 74 },
    { label: 'T12', value: 90 },
  ];

  const maxVal = Math.max(...data.map(d => d.value));
  const barGap = 8;
  const barWidth = (chartW - barGap * (data.length + 1)) / data.length;

  // Grid lines
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
  ctx.lineWidth = 0.5;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = '#64748B';

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
    const label = Math.round((maxVal / 4) * i);
    ctx.fillText(label, padding.left - 30, y + 4);
  }

  // Bars
  const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
  gradient.addColorStop(0, '#42A5F5');
  gradient.addColorStop(1, '#1565C0');

  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + barGap + i * (barWidth + barGap);
    const y = padding.top + chartH - barH;

    // Bar
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const radius = 4;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, padding.top + chartH);
    ctx.lineTo(x, padding.top + chartH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();

    // Label
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barWidth / 2, h - padding.bottom + 20);

    // Value on top
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(d.value, x + barWidth / 2, y - 8);
  });

  ctx.textAlign = 'start';
}

// ========== INITIALIZATION ==========

function init() {
  renderMembers();
  renderDocuments();
  renderEvents();
  animateCounters();
  // Delay chart drawing to ensure container is sized
  setTimeout(drawChart, 100);
}

// Redraw chart on resize
window.addEventListener('resize', () => {
  clearTimeout(window._chartResize);
  window._chartResize = setTimeout(drawChart, 200);
});

// Keyboard shortcut: Escape closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  }
});

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);
