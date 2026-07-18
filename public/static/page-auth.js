(async function () {
  const { headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')
  const isLogin = document.getElementById('page-login') !== null
  const urlParams = new URLSearchParams(window.location.search)
  const redirect = urlParams.get('redirect') || '/'

  const loginForm = `
    <form id="auth-form" class="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mt-6">
      <h1 class="text-2xl font-black text-gray-800 mb-6 text-center">تسجيل الدخول</h1>
      <div class="mb-4">
        <label class="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
        <input name="email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
        <input name="password" type="password" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <button type="submit" id="submit-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">دخول</button>
      <p class="text-center text-sm text-gray-500 mt-5">ليس لديك حساب؟ <a href="/register" class="text-brand-600 font-bold">إنشاء حساب جديد</a></p>
    </form>
  `

  const registerForm = `
    <form id="auth-form" class="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mt-6">
      <h1 class="text-2xl font-black text-gray-800 mb-6 text-center">إنشاء حساب جديد</h1>
      <div class="mb-4">
        <label class="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
        <input name="name" type="text" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
        <input name="email" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-bold text-gray-700 mb-2">رقم الجوال (اختياري)</label>
        <input name="phone" type="tel" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
        <input name="password" type="password" required minlength="6" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <p class="text-xs text-gray-400 mt-1">6 أحرف على الأقل</p>
      </div>
      <button type="submit" id="submit-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">إنشاء الحساب</button>
      <p class="text-center text-sm text-gray-500 mt-5">لديك حساب مسبقًا؟ <a href="/login" class="text-brand-600 font-bold">تسجيل الدخول</a></p>
    </form>
  `

  root.innerHTML = `
    ${headerHtml}
    <div class="min-h-[60vh] bg-gray-50 py-10">
      ${isLogin ? loginForm : registerForm}
    </div>
    ${footerHtml}
  `

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = document.getElementById('submit-btn')
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

    const formData = new FormData(e.target)
    const payload = Object.fromEntries(formData.entries())

    try {
      const endpoint = isLogin ? '/api/customer/auth/login' : '/api/customer/auth/register'
      await axios.post(endpoint, payload)
      Site.toast(isLogin ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح', 'success')
      window.location.href = redirect
    } catch (err) {
      Site.toast(err.response?.data?.error || 'حدث خطأ، يرجى المحاولة مرة أخرى', 'error')
      btn.disabled = false
      btn.innerHTML = isLogin ? 'دخول' : 'إنشاء الحساب'
    }
  })
})()
