(async function () {
  const { customer, headerHtml, footerHtml } = await Site.initHeaderFooter()
  const root = document.getElementById('app-root')
  const orderId = document.getElementById('page-order-detail').dataset.orderId

  if (!customer) {
    window.location.href = `/login?redirect=/my-orders/${orderId}`
    return
  }

  root.innerHTML = `
    ${headerHtml}
    <div id="detail-container" class="max-w-4xl mx-auto px-4 py-10">
      <div class="skeleton h-96 rounded-2xl"></div>
    </div>
    ${footerHtml}
  `

  const container = document.getElementById('detail-container')

  async function load() {
    try {
      const { data } = await axios.get(`/api/customer/orders/${orderId}`)
      renderOrder(data.order, data.payments, data.history)
    } catch (e) {
      console.error(e)
      container.innerHTML = `<p class="text-red-400 text-center py-16">الطلب غير موجود</p>`
    }
  }

  function renderOrder(order, payments, history) {
    const latestPayment = payments[0]
    const canUpload = ['pending_payment', 'rejected'].includes(order.status)

    container.innerHTML = `
      <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <span class="text-xs text-gray-400 font-mono">${order.order_number}</span>
          <h1 class="text-xl font-black text-gray-800">${Site.escapeHtml(order.service_title)}</h1>
        </div>
        ${Site.statusBadge(order.status)}
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-history ml-2 text-brand-600"></i>سجل حالة الطلب</h2>
            <div class="space-y-4">
              ${history
                .map(
                  (h, idx) => `
                <div class="flex gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full ${idx === history.length - 1 ? 'bg-brand-600' : 'bg-gray-300'}"></div>
                    ${idx < history.length - 1 ? '<div class="w-px flex-1 bg-gray-200"></div>' : ''}
                  </div>
                  <div class="pb-4">
                    ${Site.statusBadge(h.status)}
                    ${h.note ? `<p class="text-sm text-gray-600 mt-1">${Site.escapeHtml(h.note)}</p>` : ''}
                    <p class="text-xs text-gray-400 mt-1">${Site.formatDate(h.created_at)}</p>
                  </div>
                </div>`
                )
                .join('')}
            </div>
          </div>

          ${
            order.requirements
              ? `<div class="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 class="font-bold text-gray-800 mb-2"><i class="fas fa-clipboard-list ml-2 text-brand-600"></i>تفاصيل الطلب</h2>
              <p class="text-sm text-gray-600 whitespace-pre-line">${Site.escapeHtml(order.requirements)}</p>
            </div>`
              : ''
          }

          ${
            payments.length > 0
              ? `<div class="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-receipt ml-2 text-brand-600"></i>سجل الدفعات</h2>
              <div class="space-y-3">
                ${payments
                  .map(
                    (p) => `
                  <div class="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                    <div>
                      <span class="font-bold">${Site.formatPrice(p.amount)}</span>
                      <p class="text-xs text-gray-400">${Site.formatDate(p.created_at)}</p>
                      ${p.reject_reason ? `<p class="text-xs text-red-500 mt-1">سبب الرفض: ${Site.escapeHtml(p.reject_reason)}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                      ${p.receipt_url ? `<a href="${p.receipt_url}" target="_blank" class="text-brand-600 text-sm hover:underline"><i class="fas fa-image ml-1"></i>عرض الإيصال</a>` : ''}
                      <span class="status-badge ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
                        ${p.status === 'approved' ? 'مقبول' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>`
              : ''
          }
        </div>

        <div class="md:col-span-1">
          <div class="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-500 text-sm">المبلغ</span>
              <span class="text-xl font-black text-brand-700">${Site.formatPrice(order.price)}</span>
            </div>
            <div id="payment-area">
              ${canUpload ? '<div class="skeleton h-40 rounded-xl"></div>' : ''}
            </div>
          </div>
        </div>
      </div>
    `

    if (canUpload) {
      loadPaymentForm(order)
    }
  }

  async function loadPaymentForm(order) {
    const area = document.getElementById('payment-area')
    try {
      const { data } = await axios.get('/api/public/payment-methods')
      area.innerHTML = `
        <h3 class="font-bold text-sm text-gray-700 mb-3">اختر طريقة الدفع</h3>
        <div class="space-y-2 mb-4">
          ${data.payment_methods
            .map(
              (pm, idx) => `
            <label class="block border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-brand-400 payment-method-option">
              <input type="radio" name="payment_method" value="${pm.id}" class="ml-2" ${idx === 0 ? 'checked' : ''} />
              <span class="font-bold text-sm">${Site.escapeHtml(pm.name)}</span>
              <p class="text-xs text-gray-500 mt-1 pr-5">${Site.escapeHtml(pm.account_info || '')}</p>
              <p class="text-xs text-gray-400 mt-1 pr-5">${Site.escapeHtml(pm.instructions || '')}</p>
            </label>`
            )
            .join('')}
        </div>
        <form id="payment-form">
          <label class="block text-sm font-bold text-gray-700 mb-2">رقم/مرجع التحويل (اختياري)</label>
          <input id="transfer-ref" type="text" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <label class="block text-sm font-bold text-gray-700 mb-2">صورة إيصال الدفع</label>
          <input id="receipt-file" type="file" accept="image/*,.pdf" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4" />
          <button type="submit" id="submit-payment-btn" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition">
            <i class="fas fa-upload ml-2"></i> رفع الإيصال
          </button>
        </form>
      `

      document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault()
        const btn = document.getElementById('submit-payment-btn')
        const file = document.getElementById('receipt-file').files[0]
        if (!file) return

        const fd = new FormData()
        fd.append('receipt', file)
        fd.append('payment_method_id', document.querySelector('input[name="payment_method"]:checked')?.value || '')
        fd.append('transfer_reference', document.getElementById('transfer-ref').value)

        btn.disabled = true
        btn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الرفع...'

        try {
          await axios.post(`/api/customer/orders/${order.id}/payment`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          Site.toast('تم رفع الإيصال بنجاح، بانتظار المراجعة', 'success')
          load()
        } catch (err) {
          Site.toast(err.response?.data?.error || 'حدث خطأ أثناء الرفع', 'error')
          btn.disabled = false
          btn.innerHTML = '<i class="fas fa-upload ml-2"></i> رفع الإيصال'
        }
      })
    } catch (e) {
      console.error(e)
      area.innerHTML = `<p class="text-red-400 text-sm text-center">حدث خطأ في تحميل طرق الدفع</p>`
    }
  }

  load()
})()
