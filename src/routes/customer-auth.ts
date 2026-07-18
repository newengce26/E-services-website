import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { hashPassword, signJwt, verifyPassword } from '../lib/crypto'
import { customerAuth, getSecret } from '../middleware/auth'
import type { Bindings, CustomerJwtPayload } from '../lib/types'

const customerAuthRoutes = new Hono<{ Bindings: Bindings }>()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

customerAuthRoutes.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)

  const { name, email, phone, password } = body
  if (!name || !email || !password) {
    return c.json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' }, 400)
  }
  if (password.length < 6) {
    return c.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, 400)
  }

  const existing = await c.env.DB.prepare(`SELECT id FROM customers WHERE email = ?`)
    .bind(email.toLowerCase().trim())
    .first()
  if (existing) return c.json({ error: 'هذا البريد الإلكتروني مسجل مسبقًا' }, 409)

  const passwordHash = await hashPassword(password)
  const result = await c.env.DB.prepare(
    `INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`
  )
    .bind(name.trim(), email.toLowerCase().trim(), phone || null, passwordHash)
    .run()

  const customerId = result.meta.last_row_id as number
  const payload: CustomerJwtPayload = { type: 'customer', id: customerId, email, name }
  const token = await signJwt(payload, getSecret(c))
  setCookie(c, 'customer_token', token, COOKIE_OPTS)

  return c.json({ customer: { id: customerId, name, email, phone } })
})

customerAuthRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)

  const { email, password } = body
  if (!email || !password) return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, 400)

  const customer = await c.env.DB.prepare(
    `SELECT id, name, email, phone, password_hash, status FROM customers WHERE email = ?`
  )
    .bind(email.toLowerCase().trim())
    .first<{ id: number; name: string; email: string; phone: string; password_hash: string; status: string }>()

  if (!customer) return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401)
  if (customer.status === 'blocked') return c.json({ error: 'تم حظر هذا الحساب، يرجى التواصل مع الدعم' }, 403)

  const valid = await verifyPassword(password, customer.password_hash)
  if (!valid) return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401)

  const payload: CustomerJwtPayload = {
    type: 'customer',
    id: customer.id,
    email: customer.email,
    name: customer.name,
  }
  const token = await signJwt(payload, getSecret(c))
  setCookie(c, 'customer_token', token, COOKIE_OPTS)

  return c.json({ customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone } })
})

customerAuthRoutes.post('/logout', async (c) => {
  deleteCookie(c, 'customer_token', { path: '/' })
  return c.json({ success: true })
})

customerAuthRoutes.get('/me', customerAuth, async (c) => {
  const customer = c.get('customer') as CustomerJwtPayload
  const row = await c.env.DB.prepare(`SELECT id, name, email, phone FROM customers WHERE id = ?`)
    .bind(customer.id)
    .first()
  if (!row) return c.json({ error: 'الحساب غير موجود' }, 404)
  return c.json({ customer: row })
})

export default customerAuthRoutes
