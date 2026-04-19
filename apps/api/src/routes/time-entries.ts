import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@trackify/db'
import { TimeEntryCreateSchema } from '@trackify/shared'
import type { ApiResult, TimeEntry } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const timeEntries = new Hono()

timeEntries.use('*', authGuard)

function toTimeEntryResponse(t: any): TimeEntry {
  return {
    id: t.id,
    userId: t.userId,
    categoryId: t.categoryId,
    description: t.description,
    startTime: t.startTime.toISOString(),
    endTime: t.endTime?.toISOString() ?? null,
    duration: t.duration,
    category: t.category
      ? {
          id: t.category.id,
          userId: t.category.userId,
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          createdAt: t.category.createdAt.toISOString(),
        }
      : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

// GET /api/time-entries
timeEntries.get('/', async (c) => {
  const userId = c.get('userId')
  const from = c.req.query('from')
  const to = c.req.query('to')

  const where: Record<string, unknown> = { userId }
  if (from || to) {
    where.startTime = {}
    if (from) (where.startTime as Record<string, unknown>).gte = new Date(from)
    if (to) (where.startTime as Record<string, unknown>).lte = new Date(to)
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: { category: true },
    orderBy: { startTime: 'desc' },
  })

  return c.json<ApiResult<TimeEntry[]>>({ ok: true, data: entries.map(toTimeEntryResponse) })
})

// POST /api/time-entries
timeEntries.post('/', zValidator('json', TimeEntryCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const startTime = new Date(body.startTime)
  const endTime = body.endTime ? new Date(body.endTime) : null
  const duration = endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : null

  const entry = await prisma.timeEntry.create({
    data: {
      userId,
      categoryId: body.categoryId,
      description: body.description,
      startTime,
      endTime,
      duration,
    },
    include: { category: true },
  })

  return c.json<ApiResult<TimeEntry>>({ ok: true, data: toTimeEntryResponse(entry) }, 201)
})

// PATCH /api/time-entries/:id/stop — stop a running timer
timeEntries.patch('/:id/stop', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const entry = await prisma.timeEntry.findFirst({ where: { id, userId } })
  if (!entry) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Time entry not found', code: 'NOT_FOUND' } },
      404
    )
  }
  if (entry.endTime) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Timer already stopped', code: 'BAD_REQUEST' } },
      400
    )
  }

  const endTime = new Date()
  const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 60000)

  const updated = await prisma.timeEntry.update({
    where: { id },
    data: { endTime, duration },
    include: { category: true },
  })

  return c.json<ApiResult<TimeEntry>>({ ok: true, data: toTimeEntryResponse(updated) })
})

// DELETE /api/time-entries/:id
timeEntries.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const entry = await prisma.timeEntry.findFirst({ where: { id, userId } })
  if (!entry) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Time entry not found', code: 'NOT_FOUND' } },
      404
    )
  }

  await prisma.timeEntry.delete({ where: { id } })
  return c.json<ApiResult<{ deleted: true }>>({ ok: true, data: { deleted: true } })
})
