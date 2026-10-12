/**
 * ============================================================
 * MOCHA & MISO — ADMIN PORTAL JAVASCRIPT
 * Admin authentication & reservation management system
 * Authentication: Firebase Auth (email/password)
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   BOOT — wait for Firebase SDKs to be ready before init
   ────────────────────────────────────────────────────────── */
function bootAdmin() {
  // Firebase SDKs are loaded with defer, so poll until ready
  const waitForFirebase = setInterval(() => {
    const authInstance = window.firebaseAuth || window.auth || (typeof firebase !== 'undefined' ? firebase.auth() : null);
    if (authInstance && typeof authInstance.onAuthStateChanged === 'function') {
      clearInterval(waitForFirebase);
      initAdminAuth(authInstance);
      initAdminDashboard();
    }
  }, 80);

  // Safety fallback: if Firebase never loads, show a clear error
  setTimeout(() => {
    clearInterval(waitForFirebase);
    const authInstance = window.firebaseAuth || window.auth;
    if (!authInstance) {
      showLoginError('Không tải được Firebase. Vui lòng tải lại trang.');
    }
  }, 8000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
  bootAdmin();
}

/* ──────────────────────────────────────────────────────────
  1. ADMIN AUTHENTICATION — Firebase Auth primary
  ────────────────────────────────────────────────────────── */

const ADMIN_EMAIL = 'lehwangduong@gmail.com';

function initAdminAuth(authInstance) {
  const loginSection = document.getElementById('admin-login-section');
  const dashSection  = document.getElementById('admin-dashboard-section');
  const loginForm    = document.getElementById('admin-login-form');
  const logoutBtn    = document.getElementById('admin-logout-btn');
  const emailDisplay = document.getElementById('logged-admin-email');
  const forgotPasswordBtn = document.getElementById('admin-forgot-password');

  // ── Session state driven by Firebase Auth ──────────────────
  authInstance.onAuthStateChanged(async (user) => {
    if (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
      // Authenticated: show dashboard
      if (emailDisplay) emailDisplay.textContent = user.email;
      loginSection.hidden = true;
      loginSection.style.display = 'none';
      dashSection.hidden = false;
      dashSection.style.display = 'block';
      loadReservations();
      loadOrders();
    } else {
      // Not authenticated: show login
      loginSection.hidden = false;
      loginSection.style.display = 'flex';
      dashSection.hidden = true;
      dashSection.style.display = 'none';

      if (user) {
        await authInstance.signOut();
        showLoginError('Tài khoản này không có quyền truy cập cổng quản trị.');
      }
    }
  });

  // ── Login form submission ──────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('admin-email');
      const passInput  = document.getElementById('admin-password');
      const submitBtn  = document.getElementById('admin-login-submit');
      const btnText    = submitBtn ? submitBtn.querySelector('.btn-text') : null;

      const email = emailInput ? emailInput.value.trim() : '';
      const pass  = passInput  ? passInput.value.trim()  : '';

      // Clear previous error
      const existingErr = loginForm.querySelector('.form-error');
      if (existingErr) existingErr.remove();

      if (!email || !pass) {
        showLoginError('Vui lòng nhập email quản trị và mật khẩu.');
        return;
      }

      if (email.toLowerCase() !== ADMIN_EMAIL) {
        showLoginError('Email này không có quyền truy cập cổng quản trị.');
        return;
      }

      // Loading state
      if (btnText) btnText.textContent = 'Đang xác minh…';
      if (submitBtn) submitBtn.disabled = true;

      try {
        // Firebase Auth is the ONLY authentication gate
        await authInstance.signInWithEmailAndPassword(email, pass);
        // onAuthStateChanged above handles the view switch
      } catch (err) {
        // Map Firebase error codes to friendly messages
        let msg = 'Truy cập bị từ chối: email hoặc mật khẩu không đúng.';
        if (err.code === 'auth/invalid-email') {
          msg = 'Vui lòng nhập địa chỉ email hợp lệ.';
        } else if (err.code === 'auth/user-disabled') {
          msg = 'Tài khoản quản trị này đã bị vô hiệu hóa.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.';
        } else if (err.code === 'auth/network-request-failed') {
          msg = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.';
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          msg = 'Truy cập bị từ chối: email hoặc mật khẩu không đúng.';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Chưa bật đăng nhập bằng email và mật khẩu. Vui lòng liên hệ quản trị viên.';
        }
        console.error('[Admin Login Error]', err.code, err.message);
        showLoginError(msg);
      } finally {
        if (btnText) btnText.textContent = 'Đăng nhập';
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('admin-email');
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      if (email !== ADMIN_EMAIL) {
        showLoginError(`Nhập đúng email quản trị ${ADMIN_EMAIL} để nhận liên kết đặt lại mật khẩu.`);
        return;
      }
      try {
        await authInstance.sendPasswordResetEmail(email);
        showLoginError('Đã gửi liên kết đặt lại mật khẩu đến email quản trị. Hãy kiểm tra cả thư mục Spam.');
      } catch (err) {
        console.error('[Admin Password Reset Error]', err.code, err.message);
        showLoginError('Không thể gửi email đặt lại mật khẩu. Hãy kiểm tra user này đã tồn tại trong Firebase.');
      }
    });
  }

  // ── Logout ─────────────────────────────────────────────────
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await authInstance.signOut();
        // onAuthStateChanged above will flip back to login view
        if (loginForm) loginForm.reset();
      } catch (err) {
        console.warn('Lỗi đăng xuất:', err.message);
      }
    });
  }
}

function showLoginError(msg) {
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;
  const existingErr = loginForm.querySelector('.form-error');
  if (existingErr) existingErr.remove();

  const errEl = document.createElement('div');
  errEl.className = 'form-error';
  errEl.setAttribute('role', 'alert');
  errEl.textContent = msg;
  loginForm.appendChild(errEl);
}

/* ──────────────────────────────────────────────────────────
   2. RESERVATION MANAGEMENT & DASHBOARD
   ────────────────────────────────────────────────────────── */
let allReservations = [];
let activeFilter    = 'all';
let searchQuery     = '';
let allOrders       = [];

function initAdminDashboard() {
  // Filter tabs
  const tabs = document.querySelectorAll('.admin-filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter') || 'all';
      renderTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  // Modal close handlers
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const modal     = document.getElementById('reply-modal');
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => { modal.hidden = true; });
  }

  // Send Email trigger
  const sendBtn = document.getElementById('modal-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const guestEmail = document.getElementById('modal-guest-email').value;
      const subject    = document.getElementById('modal-subject').value;
      const body       = document.getElementById('modal-message').value;

      const mailtoUrl = `mailto:${encodeURIComponent(guestEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;

      if (modal) modal.hidden = true;
    });
  }
}

function loadReservations() {
  const tbody = document.getElementById('bookings-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">Đang tải danh sách đặt bàn…</td></tr>';

  // Read local backup array
  let localData = [];
  try {
    localData = JSON.parse(localStorage.getItem('mocha_reservations') || '[]');
    localData = localData.map((item, idx) => ({
      id: 'local_' + (item.createdAt || idx),
      isLocal: true,
      ...item
    }));
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }

  // Try Firestore live listener
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);

  if (dbInstance && typeof dbInstance.collection === 'function') {
    dbInstance.collection('reservations').onSnapshot((snapshot) => {
      const remoteData = [];
      snapshot.forEach(doc => {
        remoteData.push({ id: doc.id, ...doc.data() });
      });

      // Firestore is authoritative when connected; local drafts are not global bookings.
      allReservations = remoteData;
      // Sort newest first
      allReservations.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      updateStats();
      renderTable();
    }, (error) => {
      console.warn('Firestore snapshot notice, rendering local backup:', error);
      allReservations = localData;
      updateStats();
      renderTable();
      showToast('Không tải được đặt bàn từ Firestore. Số liệu hiện chỉ gồm dữ liệu lưu trên thiết bị này.', 'error');
    });
  } else {
    allReservations = localData;
    updateStats();
    renderTable();
  }
}

function updateStats() {
  const totalEl     = document.getElementById('stat-total');
  const pendingEl   = document.getElementById('stat-pending');
  const confirmedEl = document.getElementById('stat-confirmed');
  const guestsEl    = document.getElementById('stat-guests');

  const total     = allReservations.length;
  const pending   = allReservations.filter(r => (r.status || 'Pending').toLowerCase() === 'pending').length;
  const confirmed = allReservations.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;
  const guests    = allReservations.reduce((sum, r) => sum + (parseInt(r.guests, 10) || 2), 0);

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (confirmedEl) confirmedEl.textContent = confirmed;
  if (guestsEl) guestsEl.textContent = guests;
}

function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (!dbInstance || typeof dbInstance.collection !== 'function') {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">Chưa kết nối được hệ thống đơn gọi món.</td></tr>';
    return;
  }

  dbInstance.collection('orders').onSnapshot((snapshot) => {
    allOrders = [];
    snapshot.forEach(doc => allOrders.push({ id: doc.id, ...doc.data() }));
    allOrders.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    renderOrders();
  }, (error) => {
    console.warn('Orders snapshot notice:', error);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">Không thể tải đơn gọi món.</td></tr>';
  });
}

function formatOrderMoney(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value || 0) * 1000);
}

function getOrderStatusLabel(status) {
  return { new: 'Mới', preparing: 'Đang làm', served: 'Đã phục vụ', completed: 'Hoàn tất', cancelled: 'Đã hủy' }[status] || status;
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  if (allOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--warm-gray);">Chưa có đơn gọi món.</td></tr>';
    return;
  }

  tbody.innerHTML = allOrders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const status = order.status || 'new';
    const paymentStatus = order.paymentStatus || 'unpaid';
    return `
      <tr>
        <td><strong>${escapeHtml(order.orderId || order.id)}</strong><br><span class="order-table-number">Bàn ${escapeHtml(order.tableNumber || '--')}</span></td>
        <td>${items.map(item => `<div>${escapeHtml(item.name)} <strong>×${Number(item.quantity) || 0}</strong></div>`).join('')}${order.note ? `<small class="order-note">${escapeHtml(order.note)}</small>` : ''}</td>
        <td><strong>${formatOrderMoney(order.total)}</strong></td>
        <td><span class="order-status order-status--${escapeHtml(status)}">${getOrderStatusLabel(status)}</span></td>
        <td><span class="payment-status payment-status--${escapeHtml(paymentStatus)}">${paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></td>
        <td><div class="order-actions">
          ${status === 'new' ? `<button class="btn-action btn-action--approve" type="button" onclick="updateOrderStatus('${order.id}', 'preparing')">Bắt đầu làm</button>` : ''}
          ${status === 'preparing' ? `<button class="btn-action btn-action--approve" type="button" onclick="updateOrderStatus('${order.id}', 'served')">Đã mang ra</button>` : ''}
          ${status === 'served' && paymentStatus !== 'paid' ? `<button class="btn-action btn-action--approve" type="button" onclick="markOrderPaid('${order.id}')">Đã thanh toán</button>` : ''}
          ${status !== 'completed' && status !== 'cancelled' ? `<button class="btn-action btn-action--cancel" type="button" onclick="updateOrderStatus('${order.id}', 'cancelled')">Hủy</button>` : ''}
        </div></td>
      </tr>`;
  }).join('');
}

window.updateOrderStatus = function(id, status) {
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (!dbInstance || !id) return;
  dbInstance.collection('orders').doc(id).update({ status, updatedAt: new Date().toISOString() })
    .catch(error => console.warn('Order status update notice:', error));
};

window.markOrderPaid = function(id) {
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (!dbInstance || !id) return;
  dbInstance.collection('orders').doc(id).update({ paymentStatus: 'paid', status: 'completed', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .catch(error => console.warn('Order payment update notice:', error));
};

function renderTable() {
  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  let filtered = allReservations.filter(res => {
    // Filter status
    const resStatus = (res.status || 'Pending').toLowerCase();
    if (activeFilter !== 'all' && resStatus !== activeFilter.toLowerCase()) return false;

    // Filter search
    if (searchQuery) {
      const name  = (res.customerName || res.name || '').toLowerCase();
      const email = (res.email || '').toLowerCase();
      const phone = (res.phone || '').toLowerCase();
      if (!name.includes(searchQuery) && !email.includes(searchQuery) && !phone.includes(searchQuery)) {
        return false;
      }
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 48px; color: var(--warm-gray);">
          Không tìm thấy lượt đặt bàn phù hợp.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(res => {
    const rawStatus = res.status || 'Pending';
    const statusLower = rawStatus.toLowerCase();
    const statusClass = `status--${statusLower}`;
    const timeFormatted = formatTime(res.time);

    // Email status badge
    const emailStatus = res.emailStatus || 'Sent';
    const emailStatusLower = emailStatus.toLowerCase();
    const emailBadgeClass = `email-badge--${emailStatusLower === 'failed' ? 'failed' : (emailStatusLower === 'pending' ? 'pending' : 'sent')}`;

    const guestName = res.customerName || res.name || 'Khách';
    const notesText = res.specialRequest || res.notes || '';

    return `
      <tr data-id="${res.id}">
        <td>
          <div style="font-weight: 600; color: var(--bark);">${escapeHtml(guestName)}</div>
          <div style="font-size: 12px; color: var(--warm-gray);">${escapeHtml(res.email || '')}</div>
          ${res.phone ? `<div style="font-size: 12px; color: var(--coffee-mid);">${escapeHtml(res.phone)}</div>` : ''}
          ${res.reservationId ? `<div style="font-size: 11px; color: var(--coffee); font-family: monospace;">Mã: ${escapeHtml(res.reservationId)}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(res.date || 'TBD')}</div>
          <div style="font-size: 12px; color: var(--coffee-mid);">${timeFormatted}</div>
        </td>
        <td style="font-weight: 600; text-align: center;">
          ${res.guests || 2}
        </td>
        <td style="max-width: 180px; font-size: 13px; color: var(--coffee-mid);">
          ${notesText ? escapeHtml(notesText) : '<span style="color:#A08070; font-style:italic;">Không có</span>'}
        </td>
        <td>
          <span class="status-badge ${statusClass}">
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor;"></span>
            ${escapeHtml(getStatusLabel(rawStatus))}
          </span>
        </td>
        <td>
          <span class="email-badge ${emailBadgeClass}">
            ${escapeHtml(getEmailStatusLabel(emailStatus))}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            ${statusLower !== 'confirmed' ? `<button type="button" class="btn-action btn-action--approve" onclick="updateBookingStatus('${res.id}', 'Confirmed')">Xác nhận</button>` : ''}
            ${statusLower !== 'cancelled' ? `<button type="button" class="btn-action btn-action--cancel" onclick="updateBookingStatus('${res.id}', 'Cancelled')">Hủy</button>` : ''}
            <button type="button" class="btn-action btn-action--reply" onclick="openReplyModal('${res.id}')">Trả lời</button>
            <button type="button" class="btn-action btn-action--delete" onclick="deleteBooking('${res.id}')">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusLabel(status) {
  const labels = { pending: 'Đang chờ', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy' };
  return labels[String(status).toLowerCase()] || status;
}

function getEmailStatusLabel(status) {
  const labels = { pending: 'Đang chờ', sent: 'Đã gửi', failed: 'Gửi thất bại' };
  return labels[String(status).toLowerCase()] || status;
}

// Toast helper for Admin Portal
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global action functions bound to window for onclick inline handlers
window.updateBookingStatus = function(id, newStatus) {
  const item = allReservations.find(r => r.id === id);
  const previousStatus = item ? item.status : null;
  const previousUpdatedAt = item ? item.updatedAt : null;
  const nowIso = new Date().toISOString();
  if (item) {
    item.status = newStatus;
    item.updatedAt = nowIso;
  }

  // Update localStorage
  try {
    const local = JSON.parse(localStorage.getItem('mocha_reservations') || '[]');
    local.forEach(r => {
      if (item && (r.email === item.email || r.reservationId === item.reservationId) && r.date === item.date && r.time === item.time) {
        r.status = newStatus;
        r.updatedAt = nowIso;
      }
    });
    localStorage.setItem('mocha_reservations', JSON.stringify(local));
  } catch (err) {}

  // Update Firestore if available
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (dbInstance && typeof dbInstance.collection === 'function' && !id.startsWith('local_')) {
    dbInstance.collection('reservations').doc(id).update({
      status: newStatus.toLowerCase(),
      updatedAt: nowIso
    }).then(() => {
      // Fire status-change email via EmailJS
      const emailType = newStatus.toLowerCase() === 'confirmed' ? 'confirmed' : 'cancelled';
      if (item && item.email && (newStatus === 'Confirmed' || newStatus === 'Cancelled')) {
        if (typeof window.sendEmailJS === 'function') {
          window.sendEmailJS(item, emailType, id);
        }
      }
      showToast(`Đặt bàn ${getStatusLabel(newStatus).toLowerCase()}. Email đã được gửi cho khách.`, 'success');
    }).catch(err => {
      console.warn('Firestore status update notice:', err);
      if (item) {
        item.status = previousStatus;
        item.updatedAt = previousUpdatedAt;
      }
      try {
        const local = JSON.parse(localStorage.getItem('mocha_reservations') || '[]');
        local.forEach(r => {
          if ((r.email === item?.email || r.reservationId === item?.reservationId) && r.date === item?.date && r.time === item?.time) {
            r.status = previousStatus;
            r.updatedAt = previousUpdatedAt;
          }
        });
        localStorage.setItem('mocha_reservations', JSON.stringify(local));
      } catch (storageError) {}
      updateStats();
      renderTable();
      showToast('Không thể lưu trạng thái lên Firestore; số liệu đã được hoàn tác. Vui lòng thử lại.', 'error');
    });
  } else {
    // Local-only: still send email if available
    if (item && item.email && (newStatus === 'Confirmed' || newStatus === 'Cancelled')) {
      const emailType = newStatus.toLowerCase() === 'confirmed' ? 'confirmed' : 'cancelled';
      if (typeof window.sendEmailJS === 'function') {
        window.sendEmailJS(item, emailType, id);
      }
    }
    showToast(`Đã cập nhật trạng thái đặt bàn thành "${getStatusLabel(newStatus)}".`, 'info');
  }

  updateStats();
  renderTable();
};

window.deleteBooking = function(id) {
  if (!confirm('Bạn có chắc muốn xóa lượt đặt bàn này không?')) return;

  const item = allReservations.find(r => r.id === id);
  allReservations = allReservations.filter(r => r.id !== id);

  // Remove from localStorage
  try {
    let local = JSON.parse(localStorage.getItem('mocha_reservations') || '[]');
    if (item) {
      local = local.filter(r => !(r.email === item.email && r.date === item.date && r.time === item.time));
    }
    localStorage.setItem('mocha_reservations', JSON.stringify(local));
  } catch (err) {}

  // Remove from Firestore
  const dbInstance = window.db || window.firebaseDb || (typeof db !== 'undefined' ? db : null);
  if (dbInstance && typeof dbInstance.collection === 'function' && !id.startsWith('local_')) {
    dbInstance.collection('reservations').doc(id).delete().catch(err => {
      console.warn('Firestore delete notice:', err);
    });
  }

  updateStats();
  renderTable();
};

// Reply Modal Controls
let currentReplyResId = null; // Track which reservation the reply modal is for

window.openReplyModal = function(id) {
  const res = allReservations.find(r => r.id === id);
  if (!res) return;

  currentReplyResId = id; // Store for the send handler

  const modal      = document.getElementById('reply-modal');
  const emailInput = document.getElementById('modal-guest-email');
  const msgInput   = document.getElementById('modal-message');

  if (emailInput) emailInput.value = res.email || '';
  if (msgInput) {
    const isCancelled = (res.status || '').toLowerCase() === 'cancelled';
    const statusText = isCancelled ? 'cập nhật về yêu cầu đặt bàn' : 'xác nhận đặt bàn';
    msgInput.value = `Kính gửi ${res.customerName || res.name || 'Quý khách'},\n\nCảm ơn bạn đã chọn Mocha & Miso!\n\nĐây là thông tin ${statusText} của bạn vào ngày ${res.date || 'ngày bạn yêu cầu'} lúc ${formatTime(res.time)} dành cho ${res.guests || 2} khách.\n\nNếu cần hỗ trợ hoặc thay đổi thông tin, vui lòng liên hệ chúng tôi qua số (555) 234-5678.\n\nThân mến,\nĐội ngũ Mocha & Miso\n124 Artisan Alley, Craft District`;
  }

  if (modal) modal.hidden = false;
};

// Reply Modal Send & Close Buttons
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('reply-modal');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const sendBtn = document.getElementById('modal-send-btn');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (modal) modal.hidden = true;
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const email = document.getElementById('modal-guest-email')?.value?.trim() || '';
      const body  = document.getElementById('modal-message')?.value?.trim() || '';

      if (!email) {
        showToast('Chưa có địa chỉ email người nhận.', 'error');
        return;
      }

      const cfg = window.EMAILJS_CONFIG;
      if (!cfg || cfg.publicKey === 'YOUR_PUBLIC_KEY' || typeof emailjs === 'undefined') {
        showToast('EmailJS chưa được cấu hình. Vui lòng thiết lập thông tin xác thực trước.', 'error');
        return;
      }

      const res = currentReplyResId ? allReservations.find(r => r.id === currentReplyResId) : null;

      sendBtn.textContent = 'Đang gửi…';
      sendBtn.disabled = true;

      // Use sendEmailJS with 'custom' type and the typed body
      if (typeof window.sendEmailJS === 'function' && res) {
        const cfg2 = window.EMAILJS_CONFIG;
        const templateParams = {
          to_email:        email,
          customer_name:   res.customerName || res.name || 'Quý khách',
          reservation_id:  res.reservationId || res.id || 'N/A',
          date:            res.date || 'TBD',
          time:            (typeof formatTime === 'function' ? formatTime(res.time) : res.time) || 'TBD',
          guests:          String(res.guests || 2),
          special_request: res.specialRequest || res.notes || 'Không có',
          subject:         'Tin nhắn từ Mocha & Miso Café',
          message_body:    body,
          cafe_address:    '124 Artisan Alley, Craft District',
          cafe_phone:      '(555) 234-5678',
          maps_link:       'https://maps.google.com/?q=124+Artisan+Alley+Craft+District'
        };
        emailjs.send(cfg2.serviceId, cfg2.templateId, templateParams)
          .then(() => {
            showToast(`Đã gửi email đến ${email} ✓`, 'success');
            if (modal) modal.hidden = true;
          })
          .catch(err => {
            console.warn('[EmailJS Reply Error]', err);
            showToast('Không gửi được email. Vui lòng kiểm tra cấu hình EmailJS.', 'error');
          })
          .finally(() => {
            sendBtn.textContent = 'Gửi email';
            sendBtn.disabled = false;
          });
      } else {
        showToast('EmailJS chưa sẵn sàng. Vui lòng cấu hình thông tin xác thực.', 'error');
        sendBtn.textContent = 'Gửi email';
        sendBtn.disabled = false;
      }
    });
  }
});

// Utilities
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hourText, minuteText] = timeStr.includes(':')
    ? timeStr.split(':')
    : [timeStr.slice(0, 2), timeStr.slice(2)];
  const hours = Number.parseInt(hourText, 10);
  if (!Number.isFinite(hours) || !/^\d{2}$/.test(minuteText)) return timeStr;

  const period = hours < 11 ? 'sáng' : hours < 13 ? 'trưa' : hours < 18 ? 'chiều' : 'tối';
  return `${hours % 12 || 12}:${minuteText} ${period}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
