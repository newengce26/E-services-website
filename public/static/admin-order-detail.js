(async function () {
  const admin = await Admin.requireAdmin()
  if (!admin) return
  const root = document.getElementById('app-root')
  const orderId = document.getElementById('page-admin-order-detail').dataset.orderId
  const canManage = ['super_admin', 'manager'].includes(admin.role)

  root.innerHTML = Admin.renderLayout(
    admin,
    '/admin/orders',
    `<div id="detail-container"><div class="skeleton h-96 rounded-2xl"></div></div>`
  )

  const container = document.getElementById('detail-container')

  async function load() {
    try {
      const { data } = await axios.get(`/api/admin/orders/${orderId}`)
      renderOrder(data.order, data.payments, data.history)
    } catch (e) {
      console.error(e)
      container.innerHTML = `<p class="text-red-400 text-center py-16">الطلب غير موجود</p>`
    }
  }

  function renderOrder(order, payments, history) {
    container.innerHTML = `
      <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <a href="/admin/orders" class="text-sm text-gray-400 hover:text-brand-600"><i class="fas fa-arrow-right ml-1"></i> رجوع للطلبات</a>
          <h1 class="text-xl font-black text-gray-800 mt-1">${Admin.escapeHtml(order.service_title)}</h1>
          <span class="text-xs text-gray-400 font-mono">${order.order_number}</span>
        </div>
        ${Admin.statusBadge(order.status)}
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
          <div class="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-user ml-2 text-brand-600"></i>بيانات العميل</h2>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><span class="text-gray-400">الاسم:</span> <span class="font-bold">${Admin.escapeHtml(order.customer_name)}</span></div>
              <div><span class="text-gray-400">البريد:</span> <span class="font-bold">${Admin.escapeHtml(order.customer_email)}</span></div>
              <div><span class="text-gray-400">الجوال:</span> <span class="font-bold">${Admin.escapeHtml(order.customer_phone || '-')}</span></div>
              <div><span class="text-gray-400">المبلغ:</span> <span class="font-bold">${Admin.formatPrice(order.price)}</span></div>
            </div>
          </div>

          ${
            order.requirements
              ? `<div class="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 class="font-bold text-gray-800 mb-2"><i class="fas fa-clipboard-list ml-2 text-brand-600"></i>تفاصيل الطلب</h2>
              <p class="text-sm text-gray-600 whitespace-pre-line">${Admin.escapeHtml(order.requirements)}</p>
            </div>`
              : ''
          }

          <div class="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-receipt ml-2 text-brand-600"></i>الدفعات</h2>
            ${
              payments.length === 0
                ? `<p class="text-gray-400 text-sm text-center py-6">لم يتم رفع أي إيصال دفع بعد</p>`
                : `<div class="space-y-3">
                ${payments
                  .map(
                    (p) => `
                  <div class="border border-gray-100 rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-bold">${Admin.formatPrice(p.amount)}</span>
                      <span class="status-badge ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">
                        ${p.status === 'approved' ? 'مقبول' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mb-2">${Admin.escapeHtml(p.payment_method_name || '')} - ${Admin.formatDate(p.created_at)}</p>
                    ${p.transfer_reference ? `<p class="text-xs text-gray-500 mb-2">مرجع التحويل: ${Admin.escapeHtml(p.transfer_reference)}</p>` : ''}
                    ${p.receipt_url ? `<a href="${p.receipt_url}" target="_blank" class="inline-block mb-3"><img src="${p.receipt_url}" class="max-h-48 rounded-lg border border-gray-100" onerror="this.replaceWith(Object.assign(document.createElement('a'),{href:'${p.receipt_url}',target:'_blank',textContent:'عرض ملف الإيصال',className:'text-brand-600 text-sm underline'}))" /></a>` : ''}
                    ${p.reject_reason ? `<p class="text-xs text-red-500 mb-2">سبب الرفض السابق: ${Admin.escapeHtml(p.reject_reason)}</p>` : ''}
                    ${
                      canManage && p.status === 'pending'
                        ? `<div class="flex gap-2 mt-2">
                        <button class="btn-approve-payment bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg" data-id="${p.id}"><i class="fas fa-check ml-1"></i> قبول الدفعة</button>
                        <button class="btn-reject-payment bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg" data-id="${p.id}"><i class="fas fa-times ml-1"></i> رفض الدفعة</button>
                      </div>`
                        : ''
                    }
                  </div>`
                  )
                  .join('')}
              </div>`
            }
          </div>

          <div class="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 class="font-bold text-gray-800 mb-4"><i class="fas fa-history ml-2 text-brand-600"></i>سجل الحالة</h2>
            <div class="space-y-3">
              ${history
                .map(
                  (h) => `
                <div class="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 pb-2">
                  <div>
                    ${Admin.statusBadge(h.status)}
                    ${h.note ? `<span class="text-gray-500 mr-2">${Admin.escapeHtml(h.note)}</span>` : ''}
                  </div>
                  <span class="text-xs text-gray-400">${Admin.formatDate(h.created_at)}</span>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="md:col-span-1">
          <div class="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h3 class="font-bold text-gray-800 mb-4">تحديث حالة الطلب</h3>
            <select id="status-select" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500">
              ${Admin.statusOptions(order.status)}
            </select>
            <textarea id="status-note" rows="3" placeholder="ملاحظة (اختياري)" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"></textarea>
            <button id="btn-update-status" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
              <i class="fas fa-save ml-2"></i> تحديث الحالة
            </button>
          </div>
        </div>
      </div>
    `

    document.getElementById('btn-update-status').addEventListener('click', async () => {
      const status = document.getElementById('status-select').value
      const note = document.getElementById('status-note').value
      try {
        await axios.patch(`/api/admin/orders/${orderId}/status`, { status, note })
        Admin.toast('تم تحديث حالة الطلب', 'success')
        load()
      } catch (err) {
        Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
      }
    })

    document.querySelectorAll('.btn-approve-payment').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('تأكيد قبول هذه الدفعة؟ سيتم بدء تنفيذ الطلب.')) return
        try {
          await axios.post(`/api/admin/orders/payments/${btn.dataset.id}/approve`)
          Admin.toast('تمت الموافقة على الدفعة', 'success')
          load()
        } catch (err) {
          Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
        }
      })
    })

    document.querySelectorAll('.btn-reject-payment').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const reason = prompt('سبب رفض الدفعة (سيتم إظهاره للعميل):')
        if (reason === null) return
        try {
          await axios.post(`/api/admin/orders/payments/${btn.dataset.id}/reject`, { reason })
          Admin.toast('تم رفض الدفعة', 'success')
          load()
        } catch (err) {
          Admin.toast(err.response?.data?.error || 'حدث خطأ', 'error')
        }
      })
    })
  }

  load()
})()
