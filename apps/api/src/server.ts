import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { ApiResult } from '@trackify/shared'
import { health } from './routes/health.js'
import { auth } from './routes/auth.js'
import { habits } from './routes/habits.js'
import { workouts } from './routes/workouts.js'
import { timeEntries } from './routes/time-entries.js'
import { categories } from './routes/categories.js'
import { meals } from './routes/meals.js'
import { waterLogs } from './routes/water-logs.js'
import { userGoals } from './routes/user-goals.js'
import { nutrition } from './routes/nutrition.js'
import { ai } from './routes/ai.js'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3500',
    credentials: true,
  })
)

app.route('/health', health)
app.route('/api/auth', auth)
app.route('/api/habits', habits)
app.route('/api/workouts', workouts)
app.route('/api/time-entries', timeEntries)
app.route('/api/categories', categories)
app.route('/api/meals', meals)
app.route('/api/water-logs', waterLogs)
app.route('/api/user-goals', userGoals)
app.route('/api/nutrition', nutrition)
app.route('/api/ai', ai)

app.onError((err, c) => {
  console.error('[api]', err)
  return c.json<ApiResult<never>>(
    { ok: false, error: { error: 'Internal server error', code: 'INTERNAL' } },
    500
  )
})

const port = Number(process.env.API_PORT ?? 3501)
const hostname = process.env.API_HOST ?? '0.0.0.0'

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`Trackify API listening on http://${info.address}:${info.port}`)
})
