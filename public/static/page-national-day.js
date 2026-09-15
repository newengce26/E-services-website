(async function () {
  const { headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')

  const PHONE = '966538862673'
  const PHONE_DISPLAY = '+966 53 886 2673'
  const EMAIL = 'newengce26@gmail.com'
  const WA_TEXT = encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن عرض اليوم الوطني 96 في سوق الخدمات الإلكترونية.')
  const WA_URL = `https://wa.me/${PHONE}?text=${WA_TEXT}`

  root.innerHTML = `
    ${headerHtml}

    <section class="relative overflow-hidden text-white" style="background:linear-gradient(135deg,#073a2b 0%,#0b4f39 52%,#0f6449 100%)">
      <div class="absolute inset-0 opacity-10 pointer-events-none"
           style="background-image:linear-gradient(45deg,transparent 46%,#fff 47%,#fff 53%,transparent 54%),linear-gradient(-45deg,transparent 46%,#fff 47%,#fff 53%,transparent 54%);background-size:46px 46px"></div>

      <div class="relative max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-[1.35fr_.65fr] gap-16 items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-white/20 bg-white/10 text-sm font-bold">
            <span class="w-2 h-2 rounded-full bg-amber-300"></span>
            اليوم الوطني السعودي 96
          </div>

          <h1 class="text-4xl md:text-6xl font-black leading-tight mt-6 mb-5">
            خدمات رقمية تساعد مشروعك
            <span class="block text-amber-200 mt-2">على الظهور بشكل أقوى</span>
          </h1>

          <p class="text-white/85 text-lg leading-8 max-w-3xl">
            بمناسبة اليوم الوطني، جمعنا لك أبرز خدمات سوق الخدمات الإلكترونية:
            التصميم، البرمجة، التسويق، الكتابة والترجمة — مع متابعة مباشرة للطلب.
          </p>

          <div class="flex flex-wrap gap-3 mt-8">
            <a href="${WA_URL}" target="_blank" rel="noopener"
               data-track="whatsapp"
               class="nd-track bg-amber-300 hover:bg-amber-200 text-emerald-950 font-black px-6 py-3 rounded-xl shadow-lg transition">
              <i class="fab fa-whatsapp ml-2"></i> اطلب عرضك عبر واتساب
            </a>
            <a href="#national-day-services"
               class="border border-white/40 hover:bg-white/10 font-bold px-6 py-3 rounded-xl transition">
              استعرض الخدمات
            </a>
          </div>

          <div class="flex flex-wrap gap-5 mt-6 text-sm text-white/75">
            <span><i class="fas fa-check ml-1"></i> طلب إلكتروني سهل</span>
            <span><i class="fas fa-check ml-1"></i> متابعة مباشرة</span>
            <span><i class="fas fa-check ml-1"></i> دعم عبر واتساب والبريد</span>
          </div>
        </div>

        <div class="bg-[#f8f3e6] text-[#0b4f39] rounded-[2rem] p-8 text-center shadow-2xl border-4 border-white/60">
          <div class="w-24 h-24 rounded-full bg-amber-300 border-[6px] border-white grid place-items-center mx-auto -mt-20 text-3xl font-black shadow">
            96
          </div>
          <h2 class="text-2xl font-black mt-5 mb-2">عرض اليوم الوطني</h2>
          <p class="text-emerald-900/70">خدمات رقمية مختارة لمشروعك أو نشاطك التجاري.</p>
          <div class="h-px bg-emerald-900/15 my-5"></div>
          <p class="font-bold text-sm">تواصل معنا لمعرفة العرض المناسب للخدمة التي تحتاجها.</p>
        </div>
      </div>
    </section>

    <section id="national-day-services" class="max-w-6xl mx-auto px-4 py-16">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <p class="text-amber-600 font-black mb-1">الخدمات المشمولة</p>
        <h2 class="text-3xl md:text-4xl font-black text-[#0b4f39]">اختر الخدمة المناسبة لك</h2>
        <p class="text-gray-500 mt-3">نفس خدمات السوق الأساسية في واجهة خاصة بحملة اليوم الوطني.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        ${serviceCard('fa-palette', 'التصميم', 'تصاميم تسويقية وواجهات ومواد بصرية تساعد علامتك على الظهور باحترافية.')}
        ${serviceCard('fa-code', 'البرمجة', 'حلول مواقع وتطوير رقمي تناسب احتياج المشروع وتحسن تجربة العميل.')}
        ${serviceCard('fa-bullhorn', 'التسويق', 'خدمات رقمية تساعدك على تقديم عروضك والوصول إلى عملائك بصورة أوضح.')}
        ${serviceCard('fa-language', 'الكتابة والترجمة', 'محتوى عربي وإنجليزي وخدمات كتابة وترجمة تدعم حضور مشروعك الرقمي.')}
      </div>

      <div class="text-center mt-10">
        <a href="/services" class="inline-flex items-center bg-[#0b4f39] hover:bg-[#073a2b] text-white font-black px-7 py-3 rounded-xl transition">
          <i class="fas fa-th-large ml-2"></i> استعرض جميع الخدمات
        </a>
      </div>
    </section>

    <section class="py-16 text-white" style="background:linear-gradient(135deg,#0a4634,#0d5b43)">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <p class="text-amber-300 font-black">كيف تطلب؟</p>
          <h2 class="text-3xl font-black mt-1">ثلاث خطوات فقط</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-5">
          ${stepCard('01','اختر خدمتك','استعرض الخدمات أو أخبرنا باحتياجك عبر واتساب.')}
          ${stepCard('02','استلم التفاصيل','نحدد نطاق الخدمة والعرض المناسب قبل بدء التنفيذ.')}
          ${stepCard('03','تابع طلبك','تابع حالة الطلب حتى اكتمال التنفيذ والتسليم.')}
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 py-16">
      <div class="bg-white border border-gray-100 rounded-3xl shadow-xl p-7 md:p-10">
        <p class="text-amber-600 font-black">عرض اليوم الوطني السعودي 96</p>
        <h2 class="text-3xl font-black text-[#0b4f39] mt-1">جاهز تبدأ؟</h2>
        <p class="text-gray-500 mt-2">أرسل لنا نوع الخدمة التي تحتاجها وسنوجّهك إلى الخيار المناسب.</p>

        <div class="grid md:grid-cols-3 gap-4 mt-7">
          <a href="tel:+${PHONE}" data-track="phone"
             class="nd-track bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-5 transition">
            <span class="block text-xs text-gray-400 mb-1">اتصال</span>
            <b dir="ltr" class="text-[#0b4f39]">${PHONE_DISPLAY}</b>
          </a>
          <a href="${WA_URL}" target="_blank" rel="noopener" data-track="whatsapp"
             class="nd-track bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-5 transition">
            <span class="block text-xs text-gray-400 mb-1">واتساب</span>
            <b dir="ltr" class="text-[#0b4f39]">${PHONE_DISPLAY}</b>
          </a>
          <a href="mailto:${EMAIL}?subject=${encodeURIComponent('عرض اليوم الوطني 96')}" data-track="email"
             class="nd-track bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-5 transition">
            <span class="block text-xs text-gray-400 mb-1">البريد الإلكتروني</span>
            <b dir="ltr" class="text-[#0b4f39] break-all">${EMAIL}</b>
          </a>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 pb-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <span class="text-sm text-gray-500 block">مشاهدات صفحة العرض</span>
          <strong id="nd-views" class="block text-3xl text-[#0b4f39] mt-1">—</strong>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <span class="text-sm text-gray-500 block">نقرات التواصل</span>
          <strong id="nd-clicks" class="block text-3xl text-[#0b4f39] mt-1">—</strong>
        </div>
      </div>
    </section>

    ${footerHtml}
  `

  function serviceCard(icon, title, desc) {
    return `
      <article class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition">
        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0b4f39] grid place-items-center text-xl mb-4">
          <i class="fas ${icon}"></i>
        </div>
        <h3 class="font-black text-lg text-[#0b4f39]">${title}</h3>
        <p class="text-gray-500 text-sm leading-7 mt-2">${desc}</p>
        <a href="/services" class="inline-block mt-4 text-[#0b4f39] font-bold text-sm hover:underline">استعرض الخدمات ←</a>
      </article>
    `
  }

  function stepCard(number, title, desc) {
    return `
      <article class="bg-white/10 border border-white/10 rounded-2xl p-6">
        <b class="text-amber-300 text-2xl">${number}</b>
        <h3 class="font-black text-xl mt-2">${title}</h3>
        <p class="text-white/75 text-sm leading-7 mt-2">${desc}</p>
      </article>
    `
  }

  const formatNumber = (value) => {
    try {
      return Number(value || 0).toLocaleString('ar-SA')
    } catch {
      return String(value || 0)
    }
  }

  async function refreshStats() {
    try {
      const { data } = await axios.get('/api/public/national-day-stats')
      document.getElementById('nd-views').textContent = formatNumber(data.stats?.views)
      document.getElementById('nd-clicks').textContent = formatNumber(data.stats?.clicks)
    } catch (e) {
      console.error('Unable to load campaign stats', e)
    }
  }

  if (!sessionStorage.getItem('national-day-96-view-counted')) {
    try {
      const { data } = await axios.post('/api/public/national-day-stats', { event: 'view' })
      sessionStorage.setItem('national-day-96-view-counted', '1')
      document.getElementById('nd-views').textContent = formatNumber(data.stats?.views)
      document.getElementById('nd-clicks').textContent = formatNumber(data.stats?.clicks)
    } catch (e) {
      console.error('Unable to register campaign view', e)
      await refreshStats()
    }
  } else {
    await refreshStats()
  }

  document.querySelectorAll('.nd-track').forEach((link) => {
    link.addEventListener('click', () => {
      fetch('/api/public/national-day-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'click',
          channel: link.dataset.track || 'other',
        }),
        keepalive: true,
      }).catch(() => {})
    })
  })
})()
