(async function () {
  const { headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')

  root.innerHTML = `
    ${headerHtml}
    <section class="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div class="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 class="text-3xl md:text-5xl font-black mb-4 leading-tight">اطلب خدمتك الإلكترونية بسهولة وأمان</h1>
        <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto">تصميم، برمجة، تسويق، كتابة وترجمة — كل ما تحتاجه لتنمية أعمالك في مكان واحد مع دفع يدوي موثوق ومتابعة مباشرة لطلبك.</p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a href="/services" class="bg-white text-brand-700 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl shadow-lg transition"><i class="fas fa-th-large ml-2"></i> استعرض الخدمات</a>
          <a href="/register" class="border-2 border-white/70 hover:bg-white/10 font-bold px-6 py-3 rounded-xl transition">أنشئ حسابك مجانًا</a>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-10">
      <div id="categories-row" class="flex flex-wrap gap-3 justify-center"></div>
    </section>

    <section class="max-w-6xl mx-auto px-4 pb-16">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-black text-gray-800">أحدث الخدمات</h2>
        <a href="/services" class="text-brand-600 font-bold text-sm hover:underline">عرض الكل <i class="fas fa-arrow-left mr-1"></i></a>
      </div>
      <div id="services-grid" class="grid md:grid-cols-3 gap-6">
        ${Array(6).fill('<div class="skeleton h-64 rounded-2xl"></div>').join('')}
      </div>
    </section>

    <section class="bg-white border-t border-gray-100 py-14">
      <div class="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
        <div>
          <div class="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fas fa-mouse-pointer"></i></div>
          <h3 class="font-bold text-lg mb-2">1. اختر خدمتك</h3>
          <p class="text-gray-500 text-sm">تصفح كتالوج الخدمات واختر ما يناسب احتياجك.</p>
        </div>
        <div>
          <div class="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fas fa-money-check-alt"></i></div>
          <h3 class="font-bold text-lg mb-2">2. ادفع وارفع الإيصال</h3>
          <p class="text-gray-500 text-sm">حوّل المبلغ عبر إحدى طرق الدفع وارفع صورة الإيصال.</p>
        </div>
        <div>
          <div class="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fas fa-check-double"></i></div>
          <h3 class="font-bold text-lg mb-2">3. تابع طلبك</h3>
          <p class="text-gray-500 text-sm">بعد مراجعة الدفع، يبدأ تنفيذ طلبك ويمكنك متابعته لحظيًا.</p>
        </div>
      </div>
    </section>
    ${footerHtml}
  `

  try {
    const [{ data: catData }, { data: svcData }] = await Promise.all([
      axios.get('/api/public/categories'),
      axios.get('/api/public/services'),
    ])

    const catRow = document.getElementById('categories-row')
    catRow.innerHTML = catData.categories
      .map(
        (cat) => `
      <a href="/services?category=${cat.slug}" class="bg-white border border-gray-200 hover:border-brand-400 hover:shadow-md px-5 py-3 rounded-xl flex items-center gap-2 transition">
        <i class="fas ${cat.icon} text-brand-600"></i>
        <span class="font-bold text-sm text-gray-700">${Site.escapeHtml(cat.name)}</span>
      </a>`
      )
      .join('')

    const grid = document.getElementById('services-grid')
    const services = svcData.services.slice(0, 6)
    if (services.length === 0) {
      grid.innerHTML = `<p class="text-gray-400 col-span-3 text-center py-10">لا توجد خدمات متاحة حاليًا</p>`
    } else {
      grid.innerHTML = services.map(renderServiceCard).join('')
    }
  } catch (e) {
    console.error(e)
    Site.toast('حدث خطأ في تحميل البيانات', 'error')
  }

  function renderServiceCard(s) {
    return `
    <a href="/services/${s.slug}" class="card-hover bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm block">
      <div class="h-40 bg-gray-100 overflow-hidden">
        <img src="${s.image_url || 'https://via.placeholder.com/400x200?text=Service'}" class="w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="p-5">
        <span class="text-xs text-brand-600 font-bold">${Site.escapeHtml(s.category_name || '')}</span>
        <h3 class="font-bold text-gray-800 mt-1 mb-2 line-clamp-1">${Site.escapeHtml(s.title)}</h3>
        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${Site.escapeHtml(s.short_desc || '')}</p>
        <div class="flex items-center justify-between">
          <span class="font-black text-brand-700">${Site.formatPrice(s.price)}</span>
          <span class="text-xs text-gray-400"><i class="fas fa-clock ml-1"></i> ${s.delivery_days} يوم</span>
        </div>
      </div>
    </a>`
  }
})()
