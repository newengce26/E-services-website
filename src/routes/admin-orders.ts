import { Hono } from 'hono'
import { adminAuth, requireRole } from '../middleware/auth'
import type { AdminJwtPayload, Bindings } from '../lib/types'

const adminOrders = new Hono<{ Bindings: Bindings }>()

adminOrders.use('*', adminAuth)

const VALID_STATUSES = [
  'pending_payment',
  'payment_review',
  'in_progress',
  'delivered',
  'completed',
  'rejected',
  'cancelled',
]

// قائمة الطلبات مع فلترة
adminOrders.get('/', async (c) => {
  const status = c.req.query('status')
  const q = c.req.query('q')

  let sql = `
    SELECT o.*, cu.name as customer_name, cu.email as customer_email, cu.phone as customer_phone,
      (SELECT p.status FROM payments p WHERE p.order_id = o.id ORDER BY p.id DESC LIMIT 1) as payment_status,
      (SELECT p.receipt_url FROM payments p WHERE p.order_id = o.id ORDER BY p.id DESC LIMIT 1) as receipt_url
    FROM orders o
    JOIN customers cu ON cu.id = o.customer_id
    WHERE 1=1
  `
  const params: unknown[] = []

  if (status) {
    sql += ` AND o.status = ?`
    params.push(status)
  }
  if (q) {
    sql += ` AND (o.order_number LIKE ? OR cu.name LIKE ? OR cu.email LIKE ? OR o.service_title LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
  }
  sql += ` ORDER BY o.created_at DESC LIMIT 200`

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ orders: results })
})

// تفاصيل طلب
adminOrders.get('/:id', async (c) => {
  const id = c.req.param('id')
  const order = await c.env.DB.prepare(
    `SELECT o.*, cu.name as customer_name, cu.email as customer_email, cu.phone as customer_phone
     FROM orders o JOIN customers cu ON cu.id = o.customer_id WHERE o.id = ?`
  )
    .bind(id)
    .first()
  if (!order) return c.json({ error: 'الطلب غير موجود' }, 404)

  const { results: payments } = await c.env.DB.prepare(
    `SELECT p.*, pm.name as payment_method_name FROM payments p
     LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
     WHERE p.order_id = ? ORDER BY p.id DESC`
  )
    .bind(id)
    .all()

  const { results: history } = await c.env.DB.prepare(
    `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC`
  )
    .bind(id)
    .all()

  return c.json({ order, payments, history })
})

// تحديث حالة الطلب (كل الأدوار يمكنها هذا)
adminOrders.patch('/:id/status', async (c) => {
  const admin = c.get('admin') as AdminJwtPayload
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    return c.json({ error: 'حالة غير صالحة' }, 400)
  }

  const order = await c.env.DB.prepare(`SELECT id FROM orders WHERE id = ?`).bind(id).first()
  if (!order) return c.json({ error: 'الطلب غير موجود' }, 404)

  await c.env.DB.prepare(
    `UPDATE orders SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(body.status, body.note || null, id)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES (?, ?, ?, ?)`
  )
    .bind(id, body.status, body.note || null, `${admin.name} (${admin.role})`)
    .run()

  return c.json({ success: true })
})

// الموافقة على دفعة
adminOrders.post('/payments/:paymentId/approve', requireRole('super_admin', 'manager'), async (c) => {
  const admin = c.get('admin') as AdminJwtPayload
  const paymentId = c.req.param('paymentId')

  const payment = await c.env.DB.prepare(`SELECT * FROM payments WHERE id = ?`)
    .bind(paymentId)
    .first<{ id: number; order_id: number }>()
  if (!payment) return c.json({ error: 'سجل الدفع غير موجود' }, 404)

  await c.env.DB.prepare(
    `UPDATE payments SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(admin.id, paymentId)
    .run()

  await c.env.DB.prepare(
    `UPDATE orders SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(payment.order_id)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES (?, 'in_progress', 'تمت الموافقة على الدفع، بدء تنفيذ الطلب', ?)`
  )
    .bind(payment.order_id, `${admin.name} (${admin.role})`)
    .run()

  return c.json({ success: true })
})

// رفض دفعة
adminOrders.post('/payments/:paymentId/reject', requireRole('super_admin', 'manager'), async (c) => {
  const admin = c.get('admin') as AdminJwtPayload
  const paymentId = c.req.param('paymentId')
  const body = await c.req.json().catch(() => ({}))

  const payment = await c.env.DB.prepare(`SELECT * FROM payments WHERE id = ?`)
    .bind(paymentId)
    .first<{ id: number; order_id: number }>()
  if (!payment) return c.json({ error: 'سجل الدفع غير موجود' }, 404)

  await c.env.DB.prepare(
    `UPDATE payments SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, reject_reason = ? WHERE id = ?`
  )
    .bind(admin.id, body.reason || null, paymentId)
    .run()

  await c.env.DB.prepare(
    `UPDATE orders SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(payment.order_id)
    .run()

  await c.env.DB.prepare(
    `INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES (?, 'rejected', ?, ?)`
  )
    .bind(payment.order_id, body.reason || 'تم رفض إيصال الدفع', `${admin.name} (${admin.role})`)
    .run()

  return c.json({ success: true })
})

export default adminOrders
