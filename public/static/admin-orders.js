(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/orders',
    `
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h1 class="text-2xl font-black text-gray-800">الطلبات والمدفوعات</h1>
      <div class="flex items-center gap-3 flex-wrap">
        <input id="search-input" type="text" placeholder="بحث برقم الطلب / العميل / الخدمة..." class="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64" />
        <select id="status-filter" class="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">كل الحالات</option>
          ${Admin.statusOptions('')}
        </select>
      </div>
    </div>
    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-3 text-right">رقم الطلب</th>
              <th class="px-4 py-3 text-right">العميل</th>
              <th class="px-4 py-3 text-right">الخدمة</th>
              <th class="px-4 py-3 text-right">المبلغ</th>
              <th class="px-4 py-3 text-right">الحالة</th>
              <th class="px-4 py-3 text-right">التاريخ</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody id="orders-tbody">
            <tr><td colspan="7" class="text-center py-10 text-gray-400">جاري التحميل...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
  )

  const tbody = document.getElementById('orders-tbody')
  const searchInput = document.getElementById('search-input')
  const statusFilter = document.getElementById('status-filter')

  async function loadOrders() {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400"><i class="fas fa-spinner fa-spin"></i></td></tr>`
    try {
      const params = {}
      if (searchInput.value.trim()) params.q = searchInput.value.trim()
      if (statusFilter.value) params.status = statusFilter.value

      const { data } = await axios.get('/api/admin/orders', { params })
      if (data.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400">لا توجد طلبات مطابقة</td></tr>`
        return
      }
      tbody.innerHTML = data.orders
        .map(
          (o) => `
        <tr class="border-t border-gray-50 hover:bg-gray-50 cursor-pointer" onclick="window.location.href='/admin/orders/${o.id}'">
          <td class="px-4 py-3 font-mono text-xs">${o.order_number}</td>
          <td class="px-4 py-3">
            <div class="font-bold">${Admin.escapeHtml(o.customer_name)}</div>
            <div class="text-xs text-gray-400">${Admin.escapeHtml(o.customer_email)}</div>
          </td>
          <td class="px-4 py-3">${Admin.escapeHtml(o.service_title)}</td>
          <td class="px-4 py-3 font-bold">${Admin.formatPrice(o.price)}</td>
          <td class="px-4 py-3">${Admin.statusBadge(o.status)}</td>
          <td class="px-4 py-3 text-xs text-gray-400">${Admin.formatDate(o.created_at)}</td>
          <td class="px-4 py-3"><i class="fas fa-chevron-left text-gray-300"></i></td>
        </tr>`
        )
        .join('')
    } catch (e) {
      console.error(e)
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-red-400">حدث خطأ في تحميل الطلبات</td></tr>`
    }
  }

  let debounceTimer
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(loadOrders, 350)
  })
  statusFilter.addEventListener('change', loadOrders)

  loadOrders()
})()
