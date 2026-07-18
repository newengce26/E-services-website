(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')
  const canManage = ['super_admin', 'manager'].includes(admin.role)

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/customers',
    `
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <h1 class="text-2xl font-black text-gray-800">العملاء</h1>
      <input id="search-input" type="text" placeholder="بحث بالاسم / البريد / الجوال..." class="border border-gray-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-3 text-right">الاسم</th>
              <th class="px-4 py-3 text-right">البريد الإلكتروني</th>
              <th class="px-4 py-3 text-right">الجوال</th>
              <th class="px-4 py-3 text-right">عدد الطلبات</th>
              <th class="px-4 py-3 text-right">تاريخ التسجيل</th>
              <th class="px-4 py-3 text-right">الحالة</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody id="customers-tbody">
            <tr><td colspan="7" class="text-center py-10 text-gray-400">جاري التحميل...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
  )

  const tbody = document.getElementById('customers-tbody')
  const searchInput = document.getElementById('search-input')

  async function load() {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400"><i class="fas fa-spinner fa-spin"></i></td></tr>`
    try {
      const params = {}
      if (searchInput.value.trim()) params.q = searchInput.value.trim()
      const { data } = await axios.get('/api/admin/users/customers', { params })
      if (data.customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400">لا يوجد عملاء</td></tr>`
        return
      }
      tbody.innerHTML = data.customers
        .map(
          (cu) => `
        <tr class="border-t border-gray-50">
          <td class="px-4 py-3 font-bold">${Admin.escapeHtml(cu.name)}</td>
          <td class="px-4 py-3 text-gray-500">${Admin.escapeHtml(cu.email)}</td>
          <td class="px-4 py-3">${Admin.escapeHtml(cu.phone || '-')}</td>
          <td class="px-4 py-3">${cu.orders_count}</td>
          <td class="px-4 py-3 text-xs text-gray-400">${Admin.formatDate(cu.created_at)}</td>
          <td class="px-4 py-3">
            <span class="status-badge ${cu.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${cu.status === 'active' ? 'نشط' : 'محظور'}</span>
          </td>
          <td class="px-4 py-3">
            ${
              canManage
                ? `<button class="btn-toggle-status text-xs font-bold ${cu.status === 'active' ? 'text-red-500' : 'text-emerald-600'}" data-id="${cu.id}" data-status="${cu.status}">
                ${cu.status === 'active' ? 'حظر' : 'إلغاء الحظر'}
              </button>`
                : ''
            }
          </td>
        </tr>`
        )
        .join('')

      document.querySelectorAll('.btn-toggle-status').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const newStatus = btn.dataset.status === 'active' ? 'blocked' : 'active'
          try {
            await axios.patch(`/api/admin/users/customers/${btn.dataset.id}/status`, { status: newStatus })
            Admin.toast('تم التحديث', 'success')
            load()
          } catch (err) {
            Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
          }
        })
      })
    } catch (e) {
      console.error(e)
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-red-400">حدث خطأ في التحميل</td></tr>`
    }
  }

  let debounceTimer
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(load, 350)
  })

  load()
})()
