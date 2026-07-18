(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')
  const canManage = ['super_admin', 'manager'].includes(admin.role)

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/services',
    `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-gray-800">إدارة الخدمات</h1>
      ${canManage ? `<button id="btn-new-service" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-sm"><i class="fas fa-plus ml-1"></i> خدمة جديدة</button>` : ''}
    </div>

    <div class="mb-6">
      <h2 class="font-bold text-gray-700 text-sm mb-2">التصنيفات</h2>
      <div id="categories-row" class="flex flex-wrap gap-2 items-center">
        <div class="skeleton h-8 w-24 rounded-full"></div>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-3 text-right">الخدمة</th>
              <th class="px-4 py-3 text-right">التصنيف</th>
              <th class="px-4 py-3 text-right">السعر</th>
              <th class="px-4 py-3 text-right">مدة التسليم</th>
              <th class="px-4 py-3 text-right">الحالة</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody id="services-tbody">
            <tr><td colspan="6" class="text-center py-10 text-gray-400">جاري التحميل...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div id="service-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 id="modal-title" class="text-lg font-black text-gray-800 mb-4">خدمة جديدة</h2>
        <form id="service-form" class="space-y-3">
          <input type="hidden" id="service-id" />
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">العنوان</label>
            <input id="s-title" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">التصنيف</label>
            <select id="s-category" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"></select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">وصف مختصر</label>
            <input id="s-short-desc" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">الوصف الكامل</label>
            <textarea id="s-description" rows="4" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">السعر (ر.س)</label>
              <input id="s-price" type="number" step="0.01" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1">مدة التسليم (أيام)</label>
              <input id="s-delivery" type="number" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">رابط الصورة</label>
            <input id="s-image" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">الحالة</label>
            <select id="s-status" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="active">فعالة</option>
              <option value="inactive">غير فعالة</option>
            </select>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="submit" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm">حفظ</button>
            <button type="button" id="btn-close-modal" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `
  )

  let categories = []

  async function loadCategories() {
    const { data } = await axios.get('/api/admin/catalog/categories')
    categories = data.categories
    const row = document.getElementById('categories-row')
    row.innerHTML =
      categories
        .map(
          (c) => `<span class="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
        <i class="fas ${c.icon}"></i> ${Admin.escapeHtml(c.name)}
        ${canManage ? `<button class="btn-del-category text-red-400 hover:text-red-600" data-id="${c.id}"><i class="fas fa-times"></i></button>` : ''}
      </span>`
        )
        .join('') +
      (canManage
        ? `<button id="btn-add-category" class="text-brand-600 text-xs font-bold border border-dashed border-brand-300 px-3 py-1.5 rounded-full hover:bg-brand-50"><i class="fas fa-plus ml-1"></i>إضافة تصنيف</button>`
        : '')

    const select = document.getElementById('s-category')
    select.innerHTML =
      `<option value="">بدون تصنيف</option>` + categories.map((c) => `<option value="${c.id}">${Admin.escapeHtml(c.name)}</option>`).join('')

    document.getElementById('btn-add-category')?.addEventListener('click', async () => {
      const name = prompt('اسم التصنيف الجديد:')
      if (!name) return
      try {
        await axios.post('/api/admin/catalog/categories', { name })
        loadCategories()
      } catch (err) {
        Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
      }
    })
    document.querySelectorAll('.btn-del-category').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('حذف هذا التصنيف؟')) return
        try {
          await axios.delete(`/api/admin/catalog/categories/${btn.dataset.id}`)
          loadCategories()
        } catch (err) {
          Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
        }
      })
    })
  }

  const tbody = document.getElementById('services-tbody')

  async function loadServices() {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400"><i class="fas fa-spinner fa-spin"></i></td></tr>`
    try {
      const { data } = await axios.get('/api/admin/catalog/services')
      if (data.services.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400">لا توجد خدمات</td></tr>`
        return
      }
      tbody.innerHTML = data.services
        .map(
          (s) => `
        <tr class="border-t border-gray-50">
          <td class="px-4 py-3 font-bold">${Admin.escapeHtml(s.title)}</td>
          <td class="px-4 py-3 text-gray-500">${Admin.escapeHtml(s.category_name || '-')}</td>
          <td class="px-4 py-3 font-bold">${Admin.formatPrice(s.price)}</td>
          <td class="px-4 py-3">${s.delivery_days} يوم</td>
          <td class="px-4 py-3">
            <span class="status-badge ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}">${s.status === 'active' ? 'فعالة' : 'غير فعالة'}</span>
          </td>
          <td class="px-4 py-3">
            ${
              canManage
                ? `<div class="flex gap-2">
                <button class="btn-edit-service text-brand-600 hover:text-brand-800" data-id="${s.id}"><i class="fas fa-edit"></i></button>
                <button class="btn-del-service text-red-500 hover:text-red-700" data-id="${s.id}"><i class="fas fa-trash"></i></button>
              </div>`
                : ''
            }
          </td>
        </tr>`
        )
        .join('')

      document.querySelectorAll('.btn-edit-service').forEach((btn) => {
        btn.addEventListener('click', () => openModal(btn.dataset.id))
      })
      document.querySelectorAll('.btn-del-service').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('حذف هذه الخدمة؟')) return
          try {
            await axios.delete(`/api/admin/catalog/services/${btn.dataset.id}`)
            Admin.toast('تم حذف الخدمة', 'success')
            loadServices()
          } catch (err) {
            Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
          }
        })
      })
    } catch (e) {
      console.error(e)
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-red-400">حدث خطأ في تحميل الخدمات</td></tr>`
    }
  }

  const modal = document.getElementById('service-modal')

  function showModal() {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }
  function hideModal() {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.getElementById('service-form').reset()
    document.getElementById('service-id').value = ''
  }

  async function openModal(id) {
    document.getElementById('modal-title').textContent = id ? 'تعديل الخدمة' : 'خدمة جديدة'
    if (id) {
      const { data } = await axios.get(`/api/admin/catalog/services/${id}`)
      const s = data.service
      document.getElementById('service-id').value = s.id
      document.getElementById('s-title').value = s.title
      document.getElementById('s-category').value = s.category_id || ''
      document.getElementById('s-short-desc').value = s.short_desc || ''
      document.getElementById('s-description').value = s.description || ''
      document.getElementById('s-price').value = s.price
      document.getElementById('s-delivery').value = s.delivery_days
      document.getElementById('s-image').value = s.image_url || ''
      document.getElementById('s-status').value = s.status
    }
    showModal()
  }

  document.getElementById('btn-new-service')?.addEventListener('click', () => openModal(null))
  document.getElementById('btn-close-modal').addEventListener('click', hideModal)

  document.getElementById('service-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('service-id').value
    const payload = {
      title: document.getElementById('s-title').value,
      category_id: document.getElementById('s-category').value || null,
      short_desc: document.getElementById('s-short-desc').value,
      description: document.getElementById('s-description').value,
      price: parseFloat(document.getElementById('s-price').value),
      delivery_days: parseInt(document.getElementById('s-delivery').value),
      image_url: document.getElementById('s-image').value,
      status: document.getElementById('s-status').value,
    }
    try {
      if (id) {
        await axios.put(`/api/admin/catalog/services/${id}`, payload)
      } else {
        await axios.post('/api/admin/catalog/services', payload)
      }
      Admin.toast('تم الحفظ بنجاح', 'success')
      hideModal()
      loadServices()
    } catch (err) {
      Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
    }
  })

  await loadCategories()
  await loadServices()
})()
