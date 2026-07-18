(async function () {
  const root = document.getElementById('app-root')

  // إن كان مسجّل دخول مسبقًا، حوّله للوحة التحكم
  try {
    await axios.get('/api/admin/auth/me')
    window.location.href = '/admin'
    return
  } catch {}

  root.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-brand-800 to-brand-900 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            <i class="fas fa-user-shield"></i>
          </div>
          <h1 class="text-xl font-black text-gray-800">دخول لوحة التحكم</h1>
          <p class="text-sm text-gray-400 mt-1">خاص بالمشرفين فقط</p>
        </div>
        <form id="admin-login-form">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
            <input name="email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
            <input name="password" type="password" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button type="submit" id="submit-btn" class="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-3 rounded-xl transition">دخول</button>
        </form>
      </div>
    </div>
  `

  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('submit-btn')
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      await axios.post('/api/admin/auth/login', payload)
      window.location.href = '/admin'
    } catch (err) {
      Admin.toast(err.response?.data?.error || 'بيانات الدخول غير صحيحة', 'error')
      btn.disabled = false
      btn.innerHTML = 'دخول'
    }
  })
})()
