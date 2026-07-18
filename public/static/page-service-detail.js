(async function () {
  const { customer, headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')
  const slug = document.getElementById('page-service-detail').dataset.slug

  root.innerHTML = `
    ${headerHtml}
    <div id="detail-container" class="max-w-6xl mx-auto px-4 py-10">
      <div class="skeleton h-96 rounded-2xl"></div>
    </div>
    ${footerHtml}
  `

  const container = document.getElementById('detail-container')

  try {
    const { data } = await axios.get(`/api/public/services/${slug}`)
    const s = data.service
    document.title = s.title + ' | سوق الخدمات الإلكترونية'

    container.innerHTML = `
      <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2">
          <div class="rounded-2xl overflow-hidden h-72 bg-gray-100 mb-6">
            <img src="${s.image_url || 'https://via.placeholder.com/800x400?text=Service'}" class="w-full h-full object-cover" />
          </div>
          <span class="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-1 rounded-full">${Site.escapeHtml(s.category_name || '')}</span>
          <h1 class="text-2xl md:text-3xl font-black text-gray-800 mt-3 mb-4">${Site.escapeHtml(s.title)}</h1>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">${Site.escapeHtml(s.description || s.short_desc || '')}</p>
        </div>

        <div class="md:col-span-1">
          <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-500 text-sm">السعر</span>
              <span class="text-2xl font-black text-brand-700">${Site.formatPrice(s.price)}</span>
            </div>
            <div class="flex items-center justify-between mb-6 text-sm text-gray-500">
              <span><i class="fas fa-clock ml-1"></i> مدة التسليم</span>
              <span class="font-bold text-gray-700">${s.delivery_days} يوم</span>
            </div>

            <div id="order-form-area"></div>
          </div>
        </div>
      </div>
    `

    const orderArea = document.getElementById('order-form-area')

    if (!customer) {
      orderArea.innerHTML = `
        <a href="/login?redirect=/services/${slug}" class="w-full block text-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
          <i class="fas fa-sign-in-alt ml-2"></i> سجّل دخول لطلب الخدمة
        </a>
        <p class="text-xs text-gray-400 text-center mt-3">تحتاج لحساب لتتمكن من تتبع طلبك</p>
      `
    } else {
      orderArea.innerHTML = `
        <form id="order-form">
          <label class="block text-sm font-bold text-gray-700 mb-2">تفاصيل ومتطلبات الطلب (اختياري)</label>
          <textarea id="order-requirements" rows="4" class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4" placeholder="اكتب أي تفاصيل تساعدنا في تنفيذ طلبك..."></textarea>
          <button type="submit" id="btn-submit-order" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
            <i class="fas fa-shopping-cart ml-2"></i> اطلب الآن
          </button>
        </form>
      `

      document.getElementById('order-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const btn = document.getElementById('btn-submit-order')
        btn.disabled = true
        btn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري إنشاء الطلب...'
        try {
          const requirements = document.getElementById('order-requirements').value
          const { data: orderRes } = await axios.post('/api/customer/orders', {
            service_id: s.id,
            requirements,
          })
          Site.toast('تم إنشاء الطلب بنجاح! يرجى إتمام الدفع', 'success')
          window.location.href = `/my-orders/${orderRes.order.id}`
        } catch (err) {
          Site.toast(err.response?.data?.error || 'حدث خطأ أثناء إنشاء الطلب', 'error')
          btn.disabled = false
          btn.innerHTML = '<i class="fas fa-shopping-cart ml-2"></i> اطلب الآن'
        }
      })
    }
  } catch (e) {
    console.error(e)
    container.innerHTML = `<div class="text-center py-20"><p class="text-red-400 text-lg mb-4">الخدمة غير موجودة</p><a href="/services" class="text-brand-600 font-bold">عودة للخدمات</a></div>`
  }
})()
