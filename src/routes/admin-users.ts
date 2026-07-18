import { Hono } from 'hono'
import { adminAuth, requireRole } from '../middleware/auth'
import { hashPassword } from '../lib/crypto'
import type { AdminRole, Bindings } from '../lib/types'

const adminUsers = new Hono<{ Bindings: Bindings }>()

adminUsers.use('*', adminAuth)

// ---------- العملاء ----------
adminUsers.get('/customers', async (c) => {
  const q = c.req.query('q')
  let sql = `SELECT id, name, email, phone, status, created_at,
    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = customers.id) as orders_count
    FROM customers WHERE 1=1`
  const params: unknown[] = []
  if (q) {
    sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }
  sql += ` ORDER BY created_at DESC LIMIT 200`
  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ customers: results })
})

adminUsers.patch('/customers/:id/status', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body?.status || !['active', 'blocked'].includes(body.status)) {
    return c.json({ error: 'حالة غير صالحة' }, 400)
  }
  await c.env.DB.prepare(`UPDATE customers SET status = ? WHERE id = ?`).bind(body.status, id).run()
  return c.json({ success: true })
})

// ---------- المشرفون (super_admin فقط) ----------
adminUsers.get('/admins', requireRole('super_admin'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, email, role, status, created_at FROM admins ORDER BY created_at DESC`
  ).all()
  return c.json({ admins: results })
})

adminUsers.post('/admins', requireRole('super_admin'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body?.name || !body?.email || !body?.password) {
    return c.json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, 400)
  }
  const validRoles: AdminRole[] = ['super_admin', 'manager', 'support']
  const role: AdminRole = validRoles.includes(body.role) ? body.role : 'support'

  const existing = await c.env.DB.prepare(`SELECT id FROM admins WHERE email = ?`)
    .bind(body.email.toLowerCase().trim())
    .first()
  if (existing) return c.json({ error: 'البريد الإلكتروني مستخدم مسبقًا' }, 409)

  const passwordHash = await hashPassword(body.password)
  const result = await c.env.DB.prepare(
    `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
  )
    .bind(body.name, body.email.toLowerCase().trim(), passwordHash, role)
    .run()

  return c.json({ id: result.meta.last_row_id })
})

adminUsers.put('/admins/:id', requireRole('super_admin'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)

  const validRoles: AdminRole[] = ['super_admin', 'manager', 'support']
  const role: AdminRole = validRoles.includes(body.role) ? body.role : 'support'

  if (body.password) {
    const passwordHash = await hashPassword(body.password)
    await c.env.DB.prepare(`UPDATE admins SET name = ?, role = ?, password_hash = ? WHERE id = ?`)
      .bind(body.name, role, passwordHash, id)
      .run()
  } else {
    await c.env.DB.prepare(`UPDATE admins SET name = ?, role = ? WHERE id = ?`).bind(body.name, role, id).run()
  }

  return c.json({ success: true })
})

adminUsers.patch('/admins/:id/status', requireRole('super_admin'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body?.status || !['active', 'disabled'].includes(body.status)) {
    return c.json({ error: 'حالة غير صالحة' }, 400)
  }
  await c.env.DB.prepare(`UPDATE admins SET status = ? WHERE id = ?`).bind(body.status, id).run()
  return c.json({ success: true })
})

adminUsers.delete('/admins/:id', requireRole('super_admin'), async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM admins WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

export default adminUsers
