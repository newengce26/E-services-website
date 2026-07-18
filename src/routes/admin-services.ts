import { Hono } from 'hono'
import { adminAuth, requireRole } from '../middleware/auth'
import type { Bindings } from '../lib/types'

const adminServices = new Hono<{ Bindings: Bindings }>()

adminServices.use('*', adminAuth)

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ---------- التصنيفات ----------
adminServices.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM categories ORDER BY sort_order ASC, id ASC`).all()
  return c.json({ categories: results })
})

adminServices.post('/categories', requireRole('super_admin', 'manager'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body?.name) return c.json({ error: 'اسم التصنيف مطلوب' }, 400)
  const slug = body.slug ? slugify(body.slug) : slugify(body.name) + '-' + Date.now().toString().slice(-4)
  const result = await c.env.DB.prepare(
    `INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)`
  )
    .bind(body.name, slug, body.icon || 'fa-layer-group', body.sort_order || 0)
    .run()
  return c.json({ id: result.meta.last_row_id })
})

adminServices.put('/categories/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)
  await c.env.DB.prepare(`UPDATE categories SET name = ?, icon = ?, sort_order = ? WHERE id = ?`)
    .bind(body.name, body.icon || 'fa-layer-group', body.sort_order || 0, id)
    .run()
  return c.json({ success: true })
})

adminServices.delete('/categories/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ---------- الخدمات ----------
adminServices.get('/services', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, c.name as category_name FROM services s LEFT JOIN categories c ON c.id = s.category_id ORDER BY s.created_at DESC`
  ).all()
  return c.json({ services: results })
})

adminServices.get('/services/:id', async (c) => {
  const id = c.req.param('id')
  const service = await c.env.DB.prepare(`SELECT * FROM services WHERE id = ?`).bind(id).first()
  if (!service) return c.json({ error: 'الخدمة غير موجودة' }, 404)
  return c.json({ service })
})

adminServices.post('/services', requireRole('super_admin', 'manager'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body?.title || !body?.price) return c.json({ error: 'العنوان والسعر مطلوبان' }, 400)

  const slug = body.slug ? slugify(body.slug) : slugify(body.title) + '-' + Date.now().toString().slice(-5)

  const result = await c.env.DB.prepare(
    `INSERT INTO services (category_id, title, slug, short_desc, description, price, delivery_days, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.category_id || null,
      body.title,
      slug,
      body.short_desc || null,
      body.description || null,
      body.price,
      body.delivery_days || 1,
      body.image_url || null,
      body.status || 'active'
    )
    .run()

  return c.json({ id: result.meta.last_row_id })
})

adminServices.put('/services/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)

  await c.env.DB.prepare(
    `UPDATE services SET category_id = ?, title = ?, short_desc = ?, description = ?, price = ?,
     delivery_days = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  )
    .bind(
      body.category_id || null,
      body.title,
      body.short_desc || null,
      body.description || null,
      body.price,
      body.delivery_days || 1,
      body.image_url || null,
      body.status || 'active',
      id
    )
    .run()

  return c.json({ success: true })
})

adminServices.delete('/services/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM services WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ---------- طرق الدفع ----------
adminServices.get('/payment-methods', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT * FROM payment_methods ORDER BY sort_order ASC`).all()
  return c.json({ payment_methods: results })
})

adminServices.post('/payment-methods', requireRole('super_admin', 'manager'), async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body?.name) return c.json({ error: 'الاسم مطلوب' }, 400)
  const result = await c.env.DB.prepare(
    `INSERT INTO payment_methods (name, type, account_info, instructions, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(body.name, body.type || 'bank_transfer', body.account_info || null, body.instructions || null, body.is_active ?? 1, body.sort_order || 0)
    .run()
  return c.json({ id: result.meta.last_row_id })
})

adminServices.put('/payment-methods/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)
  await c.env.DB.prepare(
    `UPDATE payment_methods SET name = ?, type = ?, account_info = ?, instructions = ?, is_active = ?, sort_order = ? WHERE id = ?`
  )
    .bind(body.name, body.type || 'bank_transfer', body.account_info || null, body.instructions || null, body.is_active ?? 1, body.sort_order || 0, id)
    .run()
  return c.json({ success: true })
})

adminServices.delete('/payment-methods/:id', requireRole('super_admin', 'manager'), async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM payment_methods WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

export default adminServices
