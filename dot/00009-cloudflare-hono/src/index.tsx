import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <html>
      <body>hello</body>
    </html>
  )
})

export default app
