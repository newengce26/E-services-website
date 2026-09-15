import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import type { Bindings } from './lib/types'

import publicRoutes from './routes/public'
import customerAuthRoutes from './routes/customer-auth'
import customerOrders from './routes/customer-orders'
import adminAuthRoutes from './routes/admin-auth'
import adminServices from './routes/admin-services'
import adminOrders from './routes/admin-orders'
import adminUsers from './routes/admin-users'
import adminDashboard from './routes/admin-dashboard'
import filesRoutes from './routes/files'

const app = new Hono<{ Bindings: Bindings }>()

// ---------- Static & Files ----------
app.use('/static/*', serveStatic({ root: './public' }))
app.route('/api/files', filesRoutes)

// ---------- API Routes ----------
app.route('/api/public', publicRoutes)
app.route('/api/customer/auth', customerAuthRoutes)
app.route('/api/customer/orders', customerOrders)
app.route('/api/admin/auth', adminAuthRoutes)
app.route('/api/admin/catalog', adminServices)
app.route('/api/admin/orders', adminOrders)
app.route('/api/admin/users', adminUsers)
app.route('/api/admin/dashboard', adminDashboard)

// ---------- Page Routes ----------
app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div id="page-home" data-page="home">
      <div id="app-root">
        <div class="flex items-center justify-center py-24 text-gray-400">
          <i class="fas fa-circle-notch fa-spin text-2xl ml-2"></i> جاري التحميل...
        </div>
      </div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-home.js"></script>
      <script src="/static/national-day-promo.js"></script>
    </div>,
    { title: 'سوق الخدمات الإلكترونية | الرئيسية' }
  )
})

app.get('/services', (c) => {
  return c.render(
    <div id="page-services" data-page="services">
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-services.js"></script>
      <script src="/static/national-day-promo.js"></script>
    </div>,
    { title: 'جميع الخدمات | سوق الخدمات الإلكترونية' }
  )
})

// عرض اليوم الوطني يجب أن يكون قبل /services/:slug حتى لا يُعامل national-day كخدمة عادية
app.get('/services/national-day', (c) => {
  return c.render(
    <div id="page-national-day" data-page="national-day">
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-national-day.js"></script>
    </div>,
    { title: 'عروض اليوم الوطني 96 | سوق الخدمات الإلكترونية' }
  )
})

app.get('/services/national-day/', (c) => c.redirect('/services/national-day', 302))
app.get('/national-day', (c) => c.redirect('/services/national-day', 302))
app.get('/national-day/', (c) => c.redirect('/services/national-day', 302))

app.get('/services/:slug', (c) => {
  return c.render(
    <div id="page-service-detail" data-page="service-detail" data-slug={c.req.param('slug')}>
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-service-detail.js"></script>
    </div>,
    { title: 'تفاصيل الخدمة | سوق الخدمات الإلكترونية' }
  )
})

app.get('/login', (c) => {
  return c.render(
    <div id="page-login" data-page="login">
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-auth.js"></script>
    </div>,
    { title: 'تسجيل الدخول | سوق الخدمات الإلكترونية' }
  )
})

app.get('/register', (c) => {
  return c.render(
    <div id="page-register" data-page="register">
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-auth.js"></script>
    </div>,
    { title: 'إنشاء حساب | سوق الخدمات الإلكترونية' }
  )
})

app.get('/my-orders', (c) => {
  return c.render(
    <div id="page-my-orders" data-page="my-orders">
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-my-orders.js"></script>
    </div>,
    { title: 'طلباتي | سوق الخدمات الإلكترونية' }
  )
})

app.get('/my-orders/:id', (c) => {
  return c.render(
    <div id="page-order-detail" data-page="order-detail" data-order-id={c.req.param('id')}>
      <div id="app-root"></div>
      <script src="/static/site-common.js"></script>
      <script src="/static/page-order-detail.js"></script>
    </div>,
    { title: 'تفاصيل الطلب | سوق الخدمات الإلكترونية' }
  )
})

// ---------- Admin Pages ----------
app.get('/admin/login', (c) => {
  return c.render(
    <div id="page-admin-login" data-page="admin-login">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-login.js"></script>
    </div>,
    { title: 'دخول لوحة التحكم' }
  )
})

app.get('/admin', (c) => {
  return c.render(
    <div id="page-admin-dashboard" data-page="admin-dashboard">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-dashboard.js"></script>
    </div>,
    { title: 'لوحة التحكم - الرئيسية' }
  )
})

app.get('/admin/orders', (c) => {
  return c.render(
    <div id="page-admin-orders" data-page="admin-orders">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-orders.js"></script>
    </div>,
    { title: 'لوحة التحكم - الطلبات' }
  )
})

app.get('/admin/orders/:id', (c) => {
  return c.render(
    <div id="page-admin-order-detail" data-page="admin-order-detail" data-order-id={c.req.param('id')}>
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-order-detail.js"></script>
    </div>,
    { title: 'لوحة التحكم - تفاصيل الطلب' }
  )
})

app.get('/admin/services', (c) => {
  return c.render(
    <div id="page-admin-services" data-page="admin-services">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-services.js"></script>
    </div>,
    { title: 'لوحة التحكم - الخدمات' }
  )
})

app.get('/admin/payment-methods', (c) => {
  return c.render(
    <div id="page-admin-payment-methods" data-page="admin-payment-methods">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-payment-methods.js"></script>
    </div>,
    { title: 'لوحة التحكم - طرق الدفع' }
  )
})

app.get('/admin/customers', (c) => {
  return c.render(
    <div id="page-admin-customers" data-page="admin-customers">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-customers.js"></script>
    </div>,
    { title: 'لوحة التحكم - العملاء' }
  )
})

app.get('/admin/admins', (c) => {
  return c.render(
    <div id="page-admin-admins" data-page="admin-admins">
      <div id="app-root"></div>
      <script src="/static/admin-common.js"></script>
      <script src="/static/admin-admins.js"></script>
    </div>,
    { title: 'لوحة التحكم - المشرفون' }
  )
})

export default app
