(async function () {
  const { headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')
  const urlParams = new URLSearchParams(window.location.search)
  const initialCategory = urlParams.get('category') || ''

  root.innerHTML = `
    ${headerHtml}
    <section class="bg-white border-b border-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-4">
        <h1 class="text-2xl font-black text-gray-800 mb-4">جميع الخدمات</h1>
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px]">
            <input id="search-input" type="text" placeholder="ابحث عن خدمة..." class="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
          </div>
          <select id="category-filter" class="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">كل التصنيفات</option>
          </select>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-10">
      <div id="services-grid" class="grid md:grid-cols-3 gap-6">
        ${Array(6).fill('<div class="skeleton h-64 rounded-2xl"></div>').join('')}
      </div>
    </section>
    ${footerHtml}
  `

  const grid = document.getElementById('services-grid')
  const searchInput = document.getElementById('search-input')
  const categoryFilter = document.getElementById('category-filter')

  let categories = []
  try {
    const { data } = await axios.get('/api/public/categories')
    categories = data.categories
    categoryFilter.innerHTML =
      `<option value="">كل التصنيفات</option>` +
      categories.map((c) => `<option value="${c.slug}" ${c.slug === initialCategory ? 'selected' : ''}>${Site.escapeHtml(c.name)}</option>`).join('')
  } catch (e) {
    console.error(e)
  }

  async function loadServices() {
    grid.innerHTML = Array(6).fill('<div class="skeleton h-64 rounded-2xl"></div>').join('')
    try {
      const params = {}
      if (searchInput.value.trim()) params.q = searchInput.value.trim()
      if (categoryFilter.value) params.category = categoryFilter.value

      const { data } = await axios.get('/api/public/services', { params })
      if (data.services.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 col-span-3 text-center py-16"><i class="fas fa-search text-3xl mb-3 block"></i>لا توجد خدمات مطابقة</p>`
        return
      }
      grid.innerHTML = data.services.map(renderServiceCard).join('')
    } catch (e) {
      console.error(e)
      grid.innerHTML = `<p class="text-red-400 col-span-3 text-center py-16">حدث خطأ في تحميل الخدمات</p>`
    }
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

  let debounceTimer
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(loadServices, 350)
  })
  categoryFilter.addEventListener('change', loadServices)

  loadServices()
})()
