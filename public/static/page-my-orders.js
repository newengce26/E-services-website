(async function () {
  const { customer, headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')

  if (!customer) {
    window.location.href = '/login?redirect=/my-orders'
    return
  }

  root.innerHTML = `
    ${headerHtml}
    <div class="max-w-5xl mx-auto px-4 py-10">
      <h1 class="text-2xl font-black text-gray-800 mb-6">طلباتي</h1>
      <div id="orders-list" class="space-y-4">
        ${Array(3).fill('<div class="skeleton h-24 rounded-2xl"></div>').join('')}
      </div>
    </div>
    ${footerHtml}
  `

  const list = document.getElementById('orders-list')

  try {
    const { data } = await axios.get('/api/customer/orders')
    if (data.orders.length === 0) {
      list.innerHTML = `
        <div class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 mb-4">لا توجد طلبات حتى الآن</p>
          <a href="/services" class="text-brand-600 font-bold">استعرض الخدمات</a>
        </div>`
      return
    }

    list.innerHTML = data.orders
      .map(
        (o) => `
      <a href="/my-orders/${o.id}" class="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span class="text-xs text-gray-400 font-mono">${o.order_number}</span>
            <h3 class="font-bold text-gray-800">${Site.escapeHtml(o.service_title)}</h3>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-black text-brand-700">${Site.formatPrice(o.price)}</span>
            ${Site.statusBadge(o.status)}
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2"><i class="fas fa-clock ml-1"></i> ${Site.formatDate(o.created_at)}</p>
      </a>`
      )
      .join('')
  } catch (e) {
    console.error(e)
    list.innerHTML = `<p class="text-red-400 text-center py-10">حدث خطأ في تحميل الطلبات</p>`
  }
})()
