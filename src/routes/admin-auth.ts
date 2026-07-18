import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { verifyPassword, signJwt } from '../lib/crypto'
import { adminAuth, getSecret } from '../middleware/auth'
import type { AdminJwtPayload, AdminRole, Bindings } from '../lib/types'

const adminAuthRoutes = new Hono<{ Bindings: Bindings }>()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24,
}

adminAuthRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'بيانات غير صالحة' }, 400)
  const { email, password } = body
  if (!email || !password) return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, 400)

  const admin = await c.env.DB.prepare(
    `SELECT id, name, email, password_hash, role, status FROM admins WHERE email = ?`
  )
    .bind(email.toLowerCase().trim())
    .first<{ id: number; name: string; email: string; password_hash: string; role: AdminRole; status: string }>()

  if (!admin) return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401)
  if (admin.status === 'disabled') return c.json({ error: 'تم تعطيل هذا الحساب' }, 403)

  const valid = await verifyPassword(password, admin.password_hash)
  if (!valid) return c.json({ error: 'بيانات الدخول غير صحيحة' }, 401)

  const payload: AdminJwtPayload = {
    type: 'admin',
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  }
  const token = await signJwt(payload, getSecret(c))
  setCookie(c, 'admin_token', token, COOKIE_OPTS)

  return c.json({ admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } })
})

adminAuthRoutes.post('/logout', async (c) => {
  deleteCookie(c, 'admin_token', { path: '/' })
  return c.json({ success: true })
})

adminAuthRoutes.get('/me', adminAuth, async (c) => {
  const admin = c.get('admin') as AdminJwtPayload
  return c.json({ admin })
})

export default adminAuthRoutes
