import { Hono } from 'hono'
import type { Bindings } from '../lib/types'

// مسار عام لعرض الملفات المخزنة في R2 (إيصالات الدفع)
// ملاحظة: للتبسيط الملفات قابلة للعرض عبر الرابط المباشر بعد المصادقة على الطلب من الواجهات
const filesRoutes = new Hono<{ Bindings: Bindings }>()

filesRoutes.get('/*', async (c) => {
  const key = c.req.path.replace('/api/files/', '')
  const object = await c.env.RECEIPTS.get(key)
  if (!object) return c.notFound()

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  })
})

export default filesRoutes
