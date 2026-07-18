// أدوات مشتركة للموقع العام (العملاء)
window.Site = (function () {
  const STATUS_LABELS = {
    pending_payment: { label: 'بانتظار الدفع', color: 'bg-amber-100 text-amber-700' },
    payment_review: { label: 'قيد مراجعة الدفع', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'قيد التنفيذ', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'تم التسليم', color: 'bg-teal-100 text-teal-700' },
    completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'ملغي', color: 'bg-gray-200 text-gray-600' },
  }

  function statusBadge(status) {
    const s = STATUS_LABELS[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
    return `<span class="status-badge ${s.color}">${s.label}</span>`
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

  async function getCurrentCustomer() {
    try {
      const res = await axios.get('/api/customer/auth/me')
      return res.data.customer
    } catch {
      return null
    }
  }

  function toast(message, type = 'success') {
    const colors = {
      success: 'bg-emerald-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
    }
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

  function renderHeader(customer) {
    const authLinks = customer
      ? `
        <a href="/my-orders" class="text-gray-700 hover:text-brand-600 font-medium text-sm">
          <i class="fas fa-box ml-1"></i> طلباتي
        </a>
        <div class="flex items-center gap-2 border-r border-gray-200 pr-4 mr-1">
          <span class="text-sm text-gray-600"><i class="fas fa-user-circle ml-1"></i> ${escapeHtml(customer.name)}</span>
          <button id="btn-logout" class="text-sm text-red-600 hover:underline">خروج</button>
        </div>
      `
      : `
        <a href="/login" class="text-gray-700 hover:text-brand-600 font-medium text-sm">تسجيل الدخول</a>
        <a href="/register" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">إنشاء حساب</a>
      `

    return `
    <header class="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 text-xl font-black text-brand-700">
          <i class="fas fa-store text-brand-600"></i>
          <span>سوق الخدمات</span>
        </a>
        <nav class="hidden md:flex items-center gap-6">
          <a href="/" class="text-gray-700 hover:text-brand-600 font-medium text-sm">الرئيسية</a>
          <a href="/services" class="text-gray-700 hover:text-brand-600 font-medium text-sm">جميع الخدمات</a>
        </nav>
        <div class="flex items-center gap-3">
          ${authLinks}
        </div>
      </div>
    </header>`
  }

  function renderFooter() {
    return `
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div class="flex items-center gap-2 text-lg font-black text-white mb-3">
            <i class="fas fa-store text-brand-400"></i> سوق الخدمات
          </div>
          <p class="text-sm text-gray-400">منصة متكاملة لطلب أفضل الخدمات الإلكترونية بسهولة وأمان مع دفع يدوي موثوق.</p>
        </div>
        <div>
          <h4 class="font-bold text-white mb-3">روابط سريعة</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/services" class="hover:text-white">جميع الخدمات</a></li>
            <li><a href="/my-orders" class="hover:text-white">طلباتي</a></li>
            <li><a href="/admin/login" class="hover:text-white">دخول لوحة التحكم</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-white mb-3">تواصل معنا</h4>
          <p class="text-sm text-gray-400"><i class="fas fa-envelope ml-2"></i> support@example.com</p>
          <p class="text-sm text-gray-400 mt-1"><i class="fas fa-phone ml-2"></i> 966500000000+</p>
        </div>
      </div>
      <div class="border-t border-gray-800 py-4 text-center text-xs text-gray-500">© 2026 سوق الخدمات الإلكترونية. جميع الحقوق محفوظة.</div>
    </footer>`
  }

  async function initHeaderFooter() {
    const customer = await getCurrentCustomer()
    const root = document.getElementById('app-root')
    const headerHtml = renderHeader(customer)
    const footerHtml = renderFooter()
    return { customer, headerHtml, footerHtml }
  }

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-logout') {
      axios.post('/api/customer/auth/logout').then(() => (window.location.href = '/'))
    }
  })

  return {
    statusBadge,
    formatPrice,
    formatDate,
    escapeHtml,
    getCurrentCustomer,
    toast,
    renderHeader,
    renderFooter,
    initHeaderFooter,
  }
})()
