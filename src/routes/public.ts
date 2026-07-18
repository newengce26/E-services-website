import { Hono } from 'hono'
import type { Bindings } from '../lib/types'

const publicRoutes = new Hono<{ Bindings: Bindings }>()

// جميع التصنيفات
publicRoutes.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, slug, icon, sort_order FROM categories ORDER BY sort_order ASC, id ASC`
  ).all()
  return c.json({ categories: results })
})

// قائمة الخدمات (مع فلترة اختيارية بالتصنيف والبحث)
publicRoutes.get('/services', async (c) => {
  const categorySlug = c.req.query('category')
  const q = c.req.query('q')

  let sql = `
    SELECT s.id, s.title, s.slug, s.short_desc, s.price, s.delivery_days, s.image_url,
           c.name as category_name, c.slug as category_slug
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    WHERE s.status = 'active'
  `
  const params: unknown[] = []

  if (categorySlug) {
    sql += ` AND c.slug = ?`
    params.push(categorySlug)
  }
  if (q) {
    sql += ` AND (s.title LIKE ? OR s.short_desc LIKE ?)`
    params.push(`%${q}%`, `%${q}%`)
  }
  sql += ` ORDER BY s.created_at DESC`

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ services: results })
})

// تفاصيل خدمة واحدة
publicRoutes.get('/services/:slug', async (c) => {
  const slug = c.req.param('slug')
  const service = await c.env.DB.prepare(
    `SELECT s.*, c.name as category_name, c.slug as category_slug
     FROM services s LEFT JOIN categories c ON c.id = s.category_id
     WHERE s.slug = ? AND s.status = 'active'`
  ).bind(slug).first()

  if (!service) return c.json({ error: 'الخدمة غير موجودة' }, 404)
  return c.json({ service })
})

// طرق الدفع المتاحة
publicRoutes.get('/payment-methods', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, type, account_info, instructions FROM payment_methods WHERE is_active = 1 ORDER BY sort_order ASC`
  ).all()
  return c.json({ payment_methods: results })
})

export default publicRoutes
