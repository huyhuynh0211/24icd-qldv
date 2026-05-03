// Clean up legacy localStorage data to protect user privacy
try {
  ['_accounts', 'doanvien', 'sukien', 'tailieu', 'thongbao', 'caiDat'].forEach(k => localStorage.removeItem(k));
} catch(e) {}

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
let firebaseApp = null, firebaseDB = null, firebaseReady = false;
try {
  firebaseApp = firebase.initializeApp(firebaseConfig);
  firebaseDB = firebase.database();
  firebaseReady = true;
  console.log('Firebase connected');
} catch (e) { console.warn('Firebase init failed, using localStorage only', e) }

const MEMORY_DB = {};
const DB = {
  get(key) {
    try {
      const val = MEMORY_DB[key];
      if (!val) return null;
      // Known array keys - ensure they're always arrays
      const arrayKeys = ['doanvien', 'sukien', 'tailieu', 'thongbao'];
      if (arrayKeys.includes(key) && val && !Array.isArray(val)) {
        return Object.values(val);
      }
      return val;
    } catch (e) { return null }
  },
  set(key, val) {
    MEMORY_DB[key] = val;
    if (firebaseReady && firebaseDB) {
      try {
        // Don't save fileData to Firebase (too large), strip it
        let cleanVal = val;
        if (key === 'tailieu' && Array.isArray(val)) {
          cleanVal = val.map(d => { const c = { ...d }; delete c.fileData; return c });
        }
        firebaseDB.ref(key).set(cleanVal).catch(e => console.warn('Firebase write error:', e));
      } catch (e) { console.warn('Firebase set error', e) }
    }
  },
  remove(key) {
    delete MEMORY_DB[key];
    if (firebaseReady && firebaseDB) {
      try { firebaseDB.ref(key).remove() } catch (e) { }
    }
  }
};

// ===== FIREBASE REAL-TIME LISTENERS =====
// These auto-update localStorage when another device changes data
const SYNC_KEYS = ['doanvien', 'tailieu', 'sukien', 'thongbao', 'caiDat'];
function setupFirebaseListeners() {
  if (!firebaseReady || !firebaseDB) return;
  // Monitor connection status
  firebaseDB.ref('.info/connected').on('value', (snap) => {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    if (snap.val() === true) {
      el.innerHTML = '🟢 Online'; el.style.background = 'rgba(16,185,129,.15)'; el.style.color = '#10b981';
    } else {
      el.innerHTML = '🔴 Offline'; el.style.background = 'rgba(239,68,68,.15)'; el.style.color = '#ef4444';
    }
  });
  // Listen for data changes from other devices
  SYNC_KEYS.forEach(key => {
    firebaseDB.ref(key).on('value', (snap) => {
      const data = snap.val();
      if (data !== null && data !== undefined) {
        // Only update memory if data is different (avoid loops)
        const current = JSON.stringify(MEMORY_DB[key] || null);
        const incoming = JSON.stringify(data);
        if (current !== incoming) {
          MEMORY_DB[key] = data;
          // Re-render the relevant section if app is loaded
          if (typeof App !== 'undefined' && App.init) {
            try {
              if (key === 'doanvien' && App.DoanVien) App.DoanVien.render();
              if (key === 'tailieu' && App.TaiLieu) { App.TaiLieu.renderTabs(); App.TaiLieu.render() }
              if (key === 'sukien' && App.SuKien) { App.SuKien.renderStats(); App.SuKien.render() }
              if (key === 'thongbao' && App.ThongBao) App.ThongBao.render();
              if (key === 'doanvien' || key === 'tailieu' || key === 'sukien') {
                if (App.Dashboard) { App.Dashboard.render() }
              }
            } catch (e) { console.warn('Re-render error:', e) }
          }
        }
      }
    });
  });
}

// ===== ACCOUNTS (loaded from Firebase, no hardcoded passwords) =====
let ACCOUNTS = {};
let accountsLoaded = false;

// Simple SHA-256 hash for password security
async function hashPass(str) {
  if (!crypto || !crypto.subtle) {
    console.warn('crypto.subtle not available (needs HTTPS or localhost). Using plain text comparison for testing.');
    return str; // Fallback for file:// testing (INSECURE in production)
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Load accounts from Firebase into memory
async function loadAccounts() {
  if (!firebaseReady || !firebaseDB) {
    console.warn('Offline mode: Cannot load accounts.');
    return;
  }
  try {
    const snap = await firebaseDB.ref('accounts').once('value');
    const data = snap.val();
    if (data) {
      ACCOUNTS = data;
      accountsLoaded = true;
    } else {
      // First time: seed accounts to Firebase
      await seedAccountsToFirebase();
    }
  } catch (e) {
    console.warn('Failed to load accounts from Firebase:', e);
  }
}

// Accounts are stored in Firebase RTDB only (hashed passwords)
// No plaintext passwords in source code
async function seedAccountsToFirebase() {
  console.warn('Accounts must be managed via Firebase Console or admin panel');
}
let currentUser = null;
const COLORS = ['#d32f2f', '#1e88e5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

// ===== SEED DATA =====
function initSampleData() {
  // First try to load from Firebase, then seed if empty
  if (firebaseReady && firebaseDB) {
    firebaseDB.ref('doanvien').once('value').then(snap => {
      if (snap.val()) {
        // Firebase has data — sync to memory
        SYNC_KEYS.forEach(k => {
          firebaseDB.ref(k).once('value').then(s => {
            if (s.val() !== null) MEMORY_DB[k] = s.val();
          });
        });
      } else {
        // Firebase empty — seed and push
        seedLocalData();
        SYNC_KEYS.forEach(k => {
          const d = DB.get(k);
          if (d) firebaseDB.ref(k).set(k === 'tailieu' ? d.map(x => { const c = { ...x }; delete c.fileData; return c }) : d);
        });
      }
      // Setup listeners after initial load
      setupFirebaseListeners();
      // Re-render after sync
      setTimeout(() => { if (typeof App !== 'undefined' && App.init) App.init() }, 500);
    }).catch(e => {
      console.warn('Firebase read failed:', e);
      setupFirebaseListeners();
    });
  }
}
