(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')
  const canManage = ['super_admin', 'manager'].includes(admin.role)

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/payment-methods',
    `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-gray-800">طرق الدفع اليدوية</h1>
      ${canManage ? `<button id="btn-new-pm" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-sm"><i class="fas fa-plus ml-1"></i> طريقة جديدة</button>` : ''}
    </div>
    <div id="pm-list" class="space-y-4">
      <div class="skeleton h-24 rounded-2xl"></div>
    </div>

    <div id="pm-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <h2 id="pm-modal-title" class="text-lg font-black text-gray-800 mb-4">طريقة دفع جديدة</h2>
        <form id="pm-form" class="space-y-3">
          <input type="hidden" id="pm-id" />
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">اسم طريقة الدفع</label>
            <input id="pm-name" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="مثال: تحويل بنكي - البنك الأهلي" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">النوع</label>
            <select id="pm-type" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="wallet">محفظة إلكترونية</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">معلومات الحساب</label>
            <textarea id="pm-account" rows="2" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="رقم الحساب / المحفظة، اسم المستفيد..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">تعليمات للعميل</label>
            <textarea id="pm-instructions" rows="2" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"></textarea>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" id="pm-active" checked /> فعالة (تظهر للعملاء)
          </label>
          <div class="flex gap-2 pt-2">
            <button type="submit" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm">حفظ</button>
            <button type="button" id="btn-close-pm-modal" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `
  )

  const list = document.getElementById('pm-list')
  const modal = document.getElementById('pm-modal')

  function showModal() {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }
  function hideModal() {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.getElementById('pm-form').reset()
    document.getElementById('pm-id').value = ''
  }

  let pmData = []

  async function load() {
    try {
      const { data } = await axios.get('/api/admin/catalog/payment-methods')
      pmData = data.payment_methods
      if (pmData.length === 0) {
        list.innerHTML = `<p class="text-gray-400 text-center py-10">لا توجد طرق دفع مضافة</p>`
        return
      }
      list.innerHTML = pmData
        .map(
          (pm) => `
        <div class="bg-white border border-gray-100 rounded-2xl p-5 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-800">${Admin.escapeHtml(pm.name)}</span>
              <span class="status-badge ${pm.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}">${pm.is_active ? 'فعالة' : 'معطلة'}</span>
            </div>
            <p class="text-sm text-gray-500 whitespace-pre-line">${Admin.escapeHtml(pm.account_info || '')}</p>
            <p class="text-xs text-gray-400 mt-1 whitespace-pre-line">${Admin.escapeHtml(pm.instructions || '')}</p>
          </div>
          ${
            canManage
              ? `<div class="flex gap-2 flex-shrink-0">
              <button class="btn-edit-pm text-brand-600 hover:text-brand-800" data-id="${pm.id}"><i class="fas fa-edit"></i></button>
              <button class="btn-del-pm text-red-500 hover:text-red-700" data-id="${pm.id}"><i class="fas fa-trash"></i></button>
            </div>`
              : ''
          }
        </div>`
        )
        .join('')

      document.querySelectorAll('.btn-edit-pm').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.id)))
      document.querySelectorAll('.btn-del-pm').forEach((btn) =>
        btn.addEventListener('click', async () => {
          if (!confirm('حذف طريقة الدفع هذه؟')) return
          try {
            await axios.delete(`/api/admin/catalog/payment-methods/${btn.dataset.id}`)
            Admin.toast('تم الحذف', 'success')
            load()
          } catch (err) {
            Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
          }
        })
      )
    } catch (e) {
      console.error(e)
      list.innerHTML = `<p class="text-red-400 text-center py-10">حدث خطأ في التحميل</p>`
    }
  }

  function openModal(id) {
    document.getElementById('pm-modal-title').textContent = id ? 'تعديل طريقة الدفع' : 'طريقة دفع جديدة'
    if (id) {
      const pm = pmData.find((p) => String(p.id) === String(id))
      if (pm) {
        document.getElementById('pm-id').value = pm.id
        document.getElementById('pm-name').value = pm.name
        document.getElementById('pm-type').value = pm.type
        document.getElementById('pm-account').value = pm.account_info || ''
        document.getElementById('pm-instructions').value = pm.instructions || ''
        document.getElementById('pm-active').checked = !!pm.is_active
      }
    }
    showModal()
  }

  document.getElementById('btn-new-pm')?.addEventListener('click', () => openModal(null))
  document.getElementById('btn-close-pm-modal').addEventListener('click', hideModal)

  document.getElementById('pm-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('pm-id').value
    const payload = {
      name: document.getElementById('pm-name').value,
      type: document.getElementById('pm-type').value,
      account_info: document.getElementById('pm-account').value,
      instructions: document.getElementById('pm-instructions').value,
      is_active: document.getElementById('pm-active').checked ? 1 : 0,
    }
    try {
      if (id) {
        await axios.put(`/api/admin/catalog/payment-methods/${id}`, payload)
      } else {
        await axios.post('/api/admin/catalog/payment-methods', payload)
      }
      Admin.toast('تم الحفظ بنجاح', 'success')
      hideModal()
      load()
    } catch (err) {
      Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
    }
  })

  load()
})()
