import { Hono } from 'hono'
import type { Bindings } from '../lib/types'

const publicRoutes = new Hono<{ Bindings: Bindings }>()

const NATIONAL_DAY_CAMPAIGN_ID = 'national-day-96'

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

// إحصائيات حملة اليوم الوطني
publicRoutes.get('/national-day-stats', async (c) => {
  const stats = await c.env.DB.prepare(
    `SELECT views, clicks, whatsapp_clicks, phone_clicks, email_clicks
     FROM campaign_stats
     WHERE id = ?`
  ).bind(NATIONAL_DAY_CAMPAIGN_ID).first()

  return c.json({
    stats: stats || {
      views: 0,
      clicks: 0,
      whatsapp_clicks: 0,
      phone_clicks: 0,
      email_clicks: 0,
    },
  })
})

// تسجيل مشاهدة أو نقرة في حملة اليوم الوطني
publicRoutes.post('/national-day-stats', async (c) => {
  const body = await c.req.json().catch(() => null) as
    | { event?: string; channel?: string }
    | null

  if (!body?.event) {
    return c.json({ error: 'event is required' }, 400)
  }

  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO campaign_stats
      (id, views, clicks, whatsapp_clicks, phone_clicks, email_clicks)
     VALUES (?, 0, 0, 0, 0, 0)`
  ).bind(NATIONAL_DAY_CAMPAIGN_ID).run()

  if (body.event === 'view') {
    await c.env.DB.prepare(
      `UPDATE campaign_stats
       SET views = views + 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(NATIONAL_DAY_CAMPAIGN_ID).run()
  } else if (body.event === 'click') {
    const fieldMap: Record<string, string> = {
      whatsapp: 'whatsapp_clicks',
      phone: 'phone_clicks',
      email: 'email_clicks',
    }

    const field = body.channel ? fieldMap[body.channel] : undefined

    if (field) {
      await c.env.DB.prepare(
        `UPDATE campaign_stats
         SET clicks = clicks + 1,
             ${field} = ${field} + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(NATIONAL_DAY_CAMPAIGN_ID).run()
    } else {
      await c.env.DB.prepare(
        `UPDATE campaign_stats
         SET clicks = clicks + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).bind(NATIONAL_DAY_CAMPAIGN_ID).run()
    }
  } else {
    return c.json({ error: 'unsupported event' }, 400)
  }

  const stats = await c.env.DB.prepare(
    `SELECT views, clicks, whatsapp_clicks, phone_clicks, email_clicks
     FROM campaign_stats
     WHERE id = ?`
  ).bind(NATIONAL_DAY_CAMPAIGN_ID).first()

  return c.json({ stats })
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
