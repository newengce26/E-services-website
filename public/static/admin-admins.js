(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  if (admin.role !== 'super_admin') {
    document.getElementById('app-root').innerHTML = Admin.renderLayout(
      admin,
      '/admin/admins',
      `<div class="text-center py-20 text-gray-400"><i class="fas fa-lock text-3xl mb-4 block"></i>هذه الصفحة متاحة للمدير العام فقط</div>`
    )
    return
  }
  const root = document.getElementById('app-root')

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/admins',
    `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-black text-gray-800">إدارة المشرفين</h1>
      <button id="btn-new-admin" class="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-sm"><i class="fas fa-plus ml-1"></i> مشرف جديد</button>
    </div>
    <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-3 text-right">الاسم</th>
              <th class="px-4 py-3 text-right">البريد الإلكتروني</th>
              <th class="px-4 py-3 text-right">الدور</th>
              <th class="px-4 py-3 text-right">الحالة</th>
              <th class="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody id="admins-tbody">
            <tr><td colspan="5" class="text-center py-10 text-gray-400">جاري التحميل...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="admin-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 id="admin-modal-title" class="text-lg font-black text-gray-800 mb-4">مشرف جديد</h2>
        <form id="admin-form" class="space-y-3">
          <input type="hidden" id="a-id" />
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">الاسم</label>
            <input id="a-name" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">البريد الإلكتروني</label>
            <input id="a-email" type="email" required class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">الدور</label>
            <select id="a-role" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="super_admin">مدير عام (كل الصلاحيات)</option>
              <option value="manager">مدير طلبات (خدمات + طلبات + مدفوعات)</option>
              <option value="support">دعم ومتابعة (عرض وتحديث الطلبات فقط)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1" id="a-password-label">كلمة المرور</label>
            <input id="a-password" type="password" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <p class="text-xs text-gray-400 mt-1" id="a-password-hint">6 أحرف على الأقل</p>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="submit" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm">حفظ</button>
            <button type="button" id="btn-close-admin-modal" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `
  )

  const tbody = document.getElementById('admins-tbody')
  const modal = document.getElementById('admin-modal')
  let adminsData = []

  function showModal() {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
  }
  function hideModal() {
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.getElementById('admin-form').reset()
    document.getElementById('a-id').value = ''
  }

  async function load() {
    try {
      const { data } = await axios.get('/api/admin/users/admins')
      adminsData = data.admins
      tbody.innerHTML = adminsData
        .map(
          (a) => `
        <tr class="border-t border-gray-50">
          <td class="px-4 py-3 font-bold">${Admin.escapeHtml(a.name)}</td>
          <td class="px-4 py-3 text-gray-500">${Admin.escapeHtml(a.email)}</td>
          <td class="px-4 py-3">${Admin.roleLabel(a.role)}</td>
          <td class="px-4 py-3">
            <span class="status-badge ${a.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">${a.status === 'active' ? 'نشط' : 'معطل'}</span>
          </td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button class="btn-edit-admin text-brand-600 hover:text-brand-800" data-id="${a.id}"><i class="fas fa-edit"></i></button>
              <button class="btn-toggle-admin text-xs font-bold ${a.status === 'active' ? 'text-amber-600' : 'text-emerald-600'}" data-id="${a.id}" data-status="${a.status}">
                ${a.status === 'active' ? 'تعطيل' : 'تفعيل'}
              </button>
              <button class="btn-del-admin text-red-500 hover:text-red-700" data-id="${a.id}"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`
        )
        .join('')

      document.querySelectorAll('.btn-edit-admin').forEach((btn) => btn.addEventListener('click', () => openModal(btn.dataset.id)))
      document.querySelectorAll('.btn-toggle-admin').forEach((btn) =>
        btn.addEventListener('click', async () => {
          const newStatus = btn.dataset.status === 'active' ? 'disabled' : 'active'
          try {
            await axios.patch(`/api/admin/users/admins/${btn.dataset.id}/status`, { status: newStatus })
            Admin.toast('تم التحديث', 'success')
            load()
          } catch (err) {
            Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
          }
        })
      )
      document.querySelectorAll('.btn-del-admin').forEach((btn) =>
        btn.addEventListener('click', async () => {
          if (!confirm('حذف هذا المشرف نهائيًا؟')) return
          try {
            await axios.delete(`/api/admin/users/admins/${btn.dataset.id}`)
            Admin.toast('تم الحذف', 'success')
            load()
          } catch (err) {
            Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
          }
        })
      )
    } catch (e) {
      console.error(e)
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-400">حدث خطأ في التحميل</td></tr>`
    }
  }

  function openModal(id) {
    document.getElementById('admin-modal-title').textContent = id ? 'تعديل المشرف' : 'مشرف جديد'
    document.getElementById('a-password-label').textContent = id ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'
    document.getElementById('a-password-hint').textContent = id ? 'اتركه فارغًا للاحتفاظ بكلمة المرور الحالية' : '6 أحرف على الأقل'
    document.getElementById('a-password').required = !id

    if (id) {
      const a = adminsData.find((x) => String(x.id) === String(id))
      if (a) {
        document.getElementById('a-id').value = a.id
        document.getElementById('a-name').value = a.name
        document.getElementById('a-email').value = a.email
        document.getElementById('a-email').disabled = true
        document.getElementById('a-role').value = a.role
      }
    } else {
      document.getElementById('a-email').disabled = false
    }
    showModal()
  }

  document.getElementById('btn-new-admin').addEventListener('click', () => openModal(null))
  document.getElementById('btn-close-admin-modal').addEventListener('click', hideModal)

  document.getElementById('admin-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('a-id').value
    const payload = {
      name: document.getElementById('a-name').value,
      email: document.getElementById('a-email').value,
      role: document.getElementById('a-role').value,
      password: document.getElementById('a-password').value || undefined,
    }
    try {
      if (id) {
        await axios.put(`/api/admin/users/admins/${id}`, payload)
      } else {
        await axios.post('/api/admin/users/admins', payload)
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
