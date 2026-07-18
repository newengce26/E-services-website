import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyJwt } from '../lib/crypto'
import type { AdminJwtPayload, AdminRole, Bindings, CustomerJwtPayload } from '../lib/types'

const DEFAULT_SECRET = 'khadamat-market-dev-secret-change-me'

export function getSecret(c: Context<{ Bindings: Bindings }>): string {
  return c.env.JWT_SECRET || DEFAULT_SECRET
}

// ---------- Customer Auth ----------
export async function customerAuth(c: Context<{ Bindings: Bindings }>, next: Next) {
  const token = getCookie(c, 'customer_token')
  if (!token) return c.json({ error: 'يجب تسجيل الدخول' }, 401)

  const payload = await verifyJwt<CustomerJwtPayload>(token, getSecret(c))
  if (!payload || payload.type !== 'customer') {
    return c.json({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' }, 401)
  }
  c.set('customer', payload)
  await next()
}

// يحاول التحقق من العميل دون رفض الطلب إذا لم يوجد توكن (للصفحات العامة)
export async function customerAuthOptional(c: Context<{ Bindings: Bindings }>, next: Next) {
  const token = getCookie(c, 'customer_token')
  if (token) {
    const payload = await verifyJwt<CustomerJwtPayload>(token, getSecret(c))
    if (payload && payload.type === 'customer') {
      c.set('customer', payload)
    }
  }
  await next()
}

// ---------- Admin Auth ----------
export async function adminAuth(c: Context<{ Bindings: Bindings }>, next: Next) {
  const token = getCookie(c, 'admin_token')
  if (!token) return c.json({ error: 'يجب تسجيل الدخول كمشرف' }, 401)

  const payload = await verifyJwt<AdminJwtPayload>(token, getSecret(c))
  if (!payload || payload.type !== 'admin') {
    return c.json({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' }, 401)
  }
  c.set('admin', payload)
  await next()
}

export function requireRole(...roles: AdminRole[]) {
  return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
    const admin = c.get('admin') as AdminJwtPayload | undefined
    if (!admin) return c.json({ error: 'يجب تسجيل الدخول كمشرف' }, 401)
    if (!roles.includes(admin.role)) {
      return c.json({ error: 'لا تملك صلاحية الوصول لهذا الإجراء' }, 403)
    }
    await next()
  }
}
