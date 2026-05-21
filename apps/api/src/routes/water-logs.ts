import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '@trackify/db'
import { WaterLogUpsertSchema } from '@trackify/shared'
import type { ApiResult, WaterLog } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const waterLogs = new Hono()

waterLogs.use('*', authGuard)

// GET /api/water-logs — get water log by date
waterLogs.get('/', zValidator('query', z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })), async (c) => {
  const userId = c.get('userId')
  const { date } = c.req.valid('query')

  const log = await prisma.waterLog.findFirst({
    where: { userId, date: new Date(date) },
  })

  if (!log) {
    return c.json<ApiResult<{ glasses: number; date: string }>>({
      ok: true,
      data: { glasses: 0, date },
    })
  }

  return c.json<ApiResult<WaterLog>>({
    ok: true,
    data: {
      id: log.id,
      userId: log.userId,
      glasses: log.glasses,
      date: log.date.toISOString(),
      createdAt: log.createdAt.toISOString(),
    },
  })
})

// POST /api/water-logs — upsert water log for a given date
waterLogs.post('/', zValidator('json', WaterLogUpsertSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const log = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date: new Date(body.date) } },
    create: { userId, glasses: body.glasses, date: new Date(body.date) },
    update: { glasses: body.glasses },
  })

  return c.json<ApiResult<WaterLog>>(
    {
      ok: true,
      data: {
        id: log.id,
        userId: log.userId,
        glasses: log.glasses,
        date: log.date.toISOString(),
        createdAt: log.createdAt.toISOString(),
      },
    },
    201
  )
})
