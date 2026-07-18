(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin',
    `
    <h1 class="text-2xl font-black text-gray-800 mb-6">نظرة عامة</h1>
    <div id="stats-grid" class="grid md:grid-cols-4 gap-4 mb-8">
      ${Array(4).fill('<div class="skeleton h-28 rounded-2xl"></div>').join('')}
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-clock ml-2 text-brand-600"></i>آخر الطلبات</h2>
        <div id="recent-orders"><div class="skeleton h-64 rounded-xl"></div></div>
      </div>
      <div class="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-star ml-2 text-brand-600"></i>الخدمات الأكثر طلبًا</h2>
        <div id="top-services"><div class="skeleton h-64 rounded-xl"></div></div>
      </div>
    </div>
  `
  )

  try {
    const { data } = await axios.get('/api/admin/dashboard/stats')

    document.getElementById('stats-grid').innerHTML = `
      ${statCard('إجمالي الطلبات', data.orders_count, 'fa-receipt', 'text-brand-600 bg-brand-50')}
      ${statCard('بانتظار مراجعة الدفع', data.pending_review, 'fa-hourglass-half', 'text-amber-600 bg-amber-50')}
      ${statCard('قيد التنفيذ', data.in_progress, 'fa-spinner', 'text-indigo-600 bg-indigo-50')}
      ${statCard('الإيرادات المؤكدة', Admin.formatPrice(data.total_revenue), 'fa-sack-dollar', 'text-emerald-600 bg-emerald-50')}
    `

    const recentOrders = document.getElementById('recent-orders')
    if (data.recent_orders.length === 0) {
      recentOrders.innerHTML = `<p class="text-gray-400 text-center py-8 text-sm">لا توجد طلبات حتى الآن</p>`
    } else {
      recentOrders.innerHTML = data.recent_orders
        .map(
          (o) => `
        <a href="/admin/orders/${o.id}" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg">
          <div>
            <p class="font-bold text-sm text-gray-700">${Admin.escapeHtml(o.service_title)}</p>
            <p class="text-xs text-gray-400">${Admin.escapeHtml(o.customer_name)} - ${Admin.formatDate(o.created_at)}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm">${Admin.formatPrice(o.price)}</span>
            ${Admin.statusBadge(o.status)}
          </div>
        </a>`
        )
        .join('')
    }

    const topServices = document.getElementById('top-services')
    if (data.top_services.length === 0) {
      topServices.innerHTML = `<p class="text-gray-400 text-center py-8 text-sm">لا توجد بيانات كافية</p>`
    } else {
      topServices.innerHTML = data.top_services
        .map(
          (s, idx) => `
        <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div class="flex items-center gap-3">
            <span class="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">${idx + 1}</span>
            <p class="font-bold text-sm text-gray-700">${Admin.escapeHtml(s.service_title)}</p>
          </div>
          <span class="text-xs text-gray-500">${s.orders_count} طلب</span>
        </div>`
        )
        .join('')
    }
  } catch (e) {
    console.error(e)
    Admin.toast('حدث خطأ في تحميل الإحصائيات', 'error')
  }

  function statCard(label, value, icon, colorClass) {
    return `
    <div class="bg-white border border-gray-100 rounded-2xl p-5">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClass}"><i class="fas ${icon}"></i></div>
      <p class="text-2xl font-black text-gray-800">${value}</p>
      <p class="text-xs text-gray-400 mt-1">${label}</p>
    </div>`
  }
})()
