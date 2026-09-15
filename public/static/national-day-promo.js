(function () {
  if (sessionStorage.getItem('national-day-96-promo-seen')) return
  sessionStorage.setItem('national-day-96-promo-seen', '1')

  const style = document.createElement('style')
  style.textContent = `
    .nd96-overlay{position:fixed;inset:0;z-index:99999;background:rgba(3,24,17,.64);backdrop-filter:blur(7px);display:grid;place-items:center;padding:18px;font-family:Tajawal,Tahoma,Arial,sans-serif;direction:rtl}
    .nd96-modal{width:min(620px,100%);position:relative;overflow:hidden;border-radius:28px;padding:34px;background:linear-gradient(135deg,#0b4f39,#073a2b);color:#fff;box-shadow:0 28px 100px rgba(0,0,0,.35)}
    .nd96-modal:before{content:"96";position:absolute;left:-14px;top:-50px;font-size:12rem;font-weight:900;color:rgba(215,180,95,.08);line-height:1}
    .nd96-kicker{position:relative;display:inline-block;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.1);color:#efd287;font-size:.85rem;font-weight:800;border:1px solid rgba(255,255,255,.12)}
    .nd96-modal h2{position:relative;margin:15px 0 10px;font-size:clamp(1.9rem,5vw,3rem);line-height:1.25;font-weight:900}
    .nd96-modal p{position:relative;color:rgba(255,255,255,.8);line-height:1.8;margin:0 0 22px}
    .nd96-actions{position:relative;display:flex;gap:10px;flex-wrap:wrap}
    .nd96-actions a,.nd96-close-btn{border-radius:14px;padding:11px 18px;font-weight:800;text-decoration:none;border:0;cursor:pointer}
    .nd96-view{background:#d7b45f;color:#17372b}.nd96-later{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.15)!important}
    .nd96-x{position:absolute;z-index:2;top:14px;left:14px;width:38px;height:38px;border:0;border-radius:50%;cursor:pointer;background:rgba(255,255,255,.1);color:#fff;font-size:1.25rem}
    @media(max-width:520px){.nd96-modal{padding:30px 22px}.nd96-actions{display:grid}.nd96-actions>*{text-align:center}}
  `

  const overlay = document.createElement('div')
  overlay.className = 'nd96-overlay'
  overlay.innerHTML = `
    <section class="nd96-modal" role="dialog" aria-modal="true" aria-label="عرض اليوم الوطني">
      <button class="nd96-x" aria-label="إغلاق">×</button>
      <span class="nd96-kicker">اليوم الوطني السعودي 96</span>
      <h2>عروض خاصة على خدماتنا الرقمية</h2>
      <p>استعرض صفحة اليوم الوطني واختر من خدمات التصميم، البرمجة، التسويق، الكتابة والترجمة.</p>
      <div class="nd96-actions">
        <a class="nd96-view" href="/services/national-day">مشاهدة العرض</a>
        <button class="nd96-close-btn nd96-later" type="button">متابعة تصفح الموقع</button>
      </div>
    </section>
  `

  const close = () => overlay.remove()
  overlay.querySelector('.nd96-x').addEventListener('click', close)
  overlay.querySelector('.nd96-later').addEventListener('click', close)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close()
  })

  document.head.appendChild(style)
  document.body.appendChild(overlay)
})()
