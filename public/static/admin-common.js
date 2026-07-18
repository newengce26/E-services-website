// أدوات مشتركة للوحة التحكم
window.Admin = (function () {
  const STATUS_LABELS = {
    pending_payment: { label: 'بانتظار الدفع', color: 'bg-amber-100 text-amber-700' },
    payment_review: { label: 'قيد مراجعة الدفع', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'قيد التنفيذ', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'تم التسليم', color: 'bg-teal-100 text-teal-700' },
    completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'ملغي', color: 'bg-gray-200 text-gray-600' },
  }

  const ROLE_LABELS = {
    super_admin: 'مدير عام',
    manager: 'مدير طلبات',
    support: 'دعم ومتابعة',
  }

  function statusBadge(status) {
    const s = STATUS_LABELS[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
    return `<span class="status-badge ${s.color}">${s.label}</span>`
  }

  function statusOptions(selected) {
    return Object.keys(STATUS_LABELS)
      .map((k) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${STATUS_LABELS[k].label}</option>`)
      .join('')
  }

  function roleLabel(role) {
    return ROLE_LABELS[role] || role
  }

  function formatPrice(price) {
    return Number(price).toLocaleString('ar-SA', { minimumFractionDigits: 0 }) + ' ر.س'
  }

  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr.replace(' ', 'T') + 'Z')
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) +
        ' - ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function toast(message, type = 'success') {
    const colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600' }
    const el = document.createElement('div')
    el.className = `fixed top-5 left-1/2 -translate-x-1/2 z-[9999] ${colors[type] || colors.info} text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-opacity duration-300`
    el.style.opacity = '0'
    el.textContent = message
    document.body.appendChild(el)
    requestAnimationFrame(() => (el.style.opacity = '1'))
    setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 3000)
  }

  async function requireAdmin() {
    try {
      const { data } = await axios.get('/api/admin/auth/me')
      return data.admin
    } catch {
      window.location.href = '/admin/login'
      return null
    }
  }

  const NAV_ITEMS = [
    { href: '/admin', icon: 'fa-gauge-high', label: 'الرئيسية', roles: ['super_admin', 'manager', 'support'] },
    { href: '/admin/orders', icon: 'fa-receipt', label: 'الطلبات والمدفوعات', roles: ['super_admin', 'manager', 'support'] },
    { href: '/admin/services', icon: 'fa-layer-group', label: 'الخدمات', roles: ['super_admin', 'manager'] },
    { href: '/admin/payment-methods', icon: 'fa-wallet', label: 'طرق الدفع', roles: ['super_admin', 'manager'] },
    { href: '/admin/customers', icon: 'fa-users', label: 'العملاء', roles: ['super_admin', 'manager', 'support'] },
    { href: '/admin/admins', icon: 'fa-user-shield', label: 'المشرفون', roles: ['super_admin'] },
  ]

  function renderLayout(admin, activePath, contentHtml) {
    const navHtml = NAV_ITEMS.filter((item) => item.roles.includes(admin.role))
      .map(
        (item) => `
      <a href="${item.href}" class="sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition ${activePath === item.href ? 'active' : ''}">
        <i class="fas ${item.icon} w-5 text-center"></i>
        <span class="font-medium text-sm">${item.label}</span>
      </a>`
      )
      .join('')

    return `
    <div class="flex min-h-screen">
      <aside class="w-64 bg-gradient-to-b from-brand-800 to-brand-900 flex-shrink-0 hidden md:flex flex-col">
        <div class="px-5 py-6 border-b border-white/10">
          <div class="flex items-center gap-2 text-white font-black text-lg">
            <i class="fas fa-store"></i> لوحة التحكم
          </div>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1">${navHtml}</nav>
        <div class="px-4 py-4 border-t border-white/10">
          <div class="text-white/80 text-xs mb-1">${escapeHtml(admin.name)}</div>
          <div class="text-white/50 text-xs mb-3">${roleLabel(admin.role)}</div>
          <button id="btn-admin-logout" class="w-full text-right text-red-300 hover:text-red-200 text-sm"><i class="fas fa-sign-out-alt ml-1"></i> تسجيل الخروج</button>
        </div>
      </aside>
      <div class="flex-1 flex flex-col min-w-0">
        <header class="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <button id="btn-mobile-menu" class="md:hidden text-gray-600"><i class="fas fa-bars text-xl"></i></button>
          <div class="flex-1"></div>
          <a href="/" target="_blank" class="text-sm text-gray-500 hover:text-brand-600"><i class="fas fa-arrow-up-right-from-square ml-1"></i> عرض الموقع</a>
        </header>
        <main class="flex-1 p-4 md:p-8 bg-gray-50">${contentHtml}</main>
      </div>
    </div>`
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('#btn-admin-logout')) {
      axios.post('/api/admin/auth/logout').then(() => (window.location.href = '/admin/login'))
    }
  })

  return {
    statusBadge,
    statusOptions,
    roleLabel,
    formatPrice,
    formatDate,
    escapeHtml,
    toast,
    requireAdmin,
    renderLayout,
    NAV_ITEMS,
  }
})()
