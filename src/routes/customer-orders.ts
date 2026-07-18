import { Hono } from 'hono'
import { customerAuth } from '../middleware/auth'
import { generateOrderNumber } from '../lib/crypto'
import type { Bindings, CustomerJwtPayload } from '../lib/types'

const customerOrders = new Hono<{ Bindings: Bindings }>()

customerOrders.use('*', customerAuth)

// إنشاء طلب جديد
customerOrders.post('/', async (c) => {
  const customer = c.get('customer') as CustomerJwtPayload
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)

  const { service_id, requirements } = body
  if (!service_id) return c.json({ error: 'يجب اختيار خدمة' }, 400)

  const service = await c.env.DB.prepare(
    `SELECT id, title, price FROM services WHERE id = ? AND status = 'active'`
  )
    .bind(service_id)
    .first<{ id: number; title: string; price: number }>()

  if (!service) return c.json({ error: 'الخدمة غير موجودة أو غير متاحة' }, 404)

  const orderNumber = generateOrderNumber()
  const result = await c.env.DB.prepare(
    `INSERT INTO orders (order_number, customer_id, service_id, service_title, price, requirements, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending_payment')`
  )
    .bind(orderNumber, customer.id, service.id, service.title, service.price, requirements || null)
    .run()

  const orderId = result.meta.last_row_id as number

  await c.env.DB.prepare(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES (?, 'pending_payment', 'تم إنشاء الطلب', ?)`
  )
    .bind(orderId, customer.name)
    .run()

  return c.json({ order: { id: orderId, order_number: orderNumber, service_title: service.title, price: service.price, status: 'pending_payment' } })
})

// قائمة طلباتي
customerOrders.get('/', async (c) => {
  const customer = c.get('customer') as CustomerJwtPayload
  const { results } = await c.env.DB.prepare(
    `SELECT o.*, 
      (SELECT p.status FROM payments p WHERE p.order_id = o.id ORDER BY p.id DESC LIMIT 1) as payment_status
     FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC`
  )
    .bind(customer.id)
    .all()
  return c.json({ orders: results })
})

// تفاصيل طلب واحد
customerOrders.get('/:id', async (c) => {
  const customer = c.get('customer') as CustomerJwtPayload
  const id = c.req.param('id')

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND customer_id = ?`)
    .bind(id, customer.id)
    .first()
  if (!order) return c.json({ error: 'الطلب غير موجود' }, 404)

  const { results: payments } = await c.env.DB.prepare(
    `SELECT id, payment_method_id, amount, receipt_url, transfer_reference, status, reject_reason, created_at
     FROM payments WHERE order_id = ? ORDER BY id DESC`
  )
    .bind(id)
    .all()

  const { results: history } = await c.env.DB.prepare(
    `SELECT status, note, created_at FROM order_status_history WHERE order_id = ? ORDER BY id ASC`
  )
    .bind(id)
    .all()

  return c.json({ order, payments, history })
})

// رفع إيصال دفع لطلب
customerOrders.post('/:id/payment', async (c) => {
  const customer = c.get('customer') as CustomerJwtPayload
  const id = c.req.param('id')

  const order = await c.env.DB.prepare(`SELECT * FROM orders WHERE id = ? AND customer_id = ?`)
    .bind(id, customer.id)
    .first<{ id: number; price: number; status: string }>()
  if (!order) return c.json({ error: 'الطلب غير موجود' }, 404)

  if (!['pending_payment', 'rejected'].includes(order.status)) {
    return c.json({ error: 'لا يمكن رفع إيصال دفع لهذا الطلب في حالته الحالية' }, 400)
  }

  const formData = await c.req.formData().catch(() => null)
  if (!formData) return c.json({ error: 'بيانات النموذج غير صالحة' }, 400)

  const file = formData.get('receipt') as File | null
  const paymentMethodId = formData.get('payment_method_id') as string | null
  const transferReference = formData.get('transfer_reference') as string | null

  if (!file) return c.json({ error: 'يجب رفع صورة الإيصال' }, 400)
  if (file.size > 5 * 1024 * 1024) return c.json({ error: 'حجم الملف كبير جدًا (الحد الأقصى 5MB)' }, 400)

  const ext = file.name.split('.').pop() || 'jpg'
  const key = `receipts/order-${id}-${Date.now()}.${ext}`

  await c.env.RECEIPTS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  })

  const receiptUrl = `/api/files/${key}`

  await c.env.DB.prepare(
    `INSERT INTO payments (order_id, payment_method_id, amount, receipt_url, transfer_reference, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`
  )
    .bind(id, paymentMethodId || null, order.price, receiptUrl, transferReference || null)
    .run()

  await c.env.DB.prepare(`UPDATE orders SET status = 'payment_review', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(id)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES (?, 'payment_review', 'تم رفع إيصال الدفع، بانتظار المراجعة', ?)`
  )
    .bind(id, customer.name)
    .run()

  return c.json({ success: true, receipt_url: receiptUrl })
})

export default customerOrders
