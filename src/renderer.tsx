import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'سوق الخدمات الإلكترونية'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link href="/static/styles.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `tailwind.config = { theme: { extend: { fontFamily: { sans: ['Tajawal','sans-serif'] }, colors: { brand: { 50:'#eef6ff',100:'#d9ecff',200:'#bcdcff',300:'#8ec6ff',400:'#59a5ff',500:'#2f7ffe',600:'#1c63e6',700:'#174fc0',800:'#17439c',900:'#173a7d' } } } } }`,
          }}
        />
      </head>
      <body class="bg-gray-50 font-sans text-gray-800">{children}</body>
    </html>
  )
})
