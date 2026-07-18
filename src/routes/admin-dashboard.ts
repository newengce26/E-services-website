import { Hono } from 'hono'
import { adminAuth } from '../middleware/auth'
import type { Bindings } from '../lib/types'

const adminDashboard = new Hono<{ Bindings: Bindings }>()

adminDashboard.use('*', adminAuth)

adminDashboard.get('/stats', async (c) => {
  const db = c.env.DB

  const [ordersCount, pendingReview, inProgress, completedCount, customersCount, servicesCount] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as n FROM orders`).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) as n FROM orders WHERE status = 'payment_review'`).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) as n FROM orders WHERE status = 'in_progress'`).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) as n FROM orders WHERE status = 'completed'`).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) as n FROM customers`).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) as n FROM services WHERE status = 'active'`).first<{ n: number }>(),
  ])

  const revenue = await db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status = 'approved'`
    )
    .first<{ total: number }>()

  const pendingRevenue = await db
    .prepare(
      `SELECT COALESCE(SUM(o.price),0) as total FROM orders o WHERE o.status = 'payment_review'`
    )
    .first<{ total: number }>()

  const { results: recentOrders } = await db
    .prepare(
      `SELECT o.id, o.order_number, o.service_title, o.price, o.status, o.created_at, cu.name as customer_name
       FROM orders o JOIN customers cu ON cu.id = o.customer_id
       ORDER BY o.created_at DESC LIMIT 8`
    )
    .all()

  const { results: topServices } = await db
    .prepare(
      `SELECT service_title, COUNT(*) as orders_count, SUM(price) as total_value
       FROM orders GROUP BY service_title ORDER BY orders_count DESC LIMIT 5`
    )
    .all()

  const { results: statusBreakdown } = await db
    .prepare(`SELECT status, COUNT(*) as n FROM orders GROUP BY status`)
    .all()

  return c.json({
    orders_count: ordersCount?.n || 0,
    pending_review: pendingReview?.n || 0,
    in_progress: inProgress?.n || 0,
    completed_count: completedCount?.n || 0,
    customers_count: customersCount?.n || 0,
    services_count: servicesCount?.n || 0,
    total_revenue: revenue?.total || 0,
    pending_revenue: pendingRevenue?.total || 0,
    recent_orders: recentOrders,
    top_services: topServices,
    status_breakdown: statusBreakdown,
  })
})

export default adminDashboard
