import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@trackify/db'
import { HabitCreateSchema, HabitLogCreateSchema } from '@trackify/shared'
import type { ApiResult, Habit, HabitLog } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const habits = new Hono()

habits.use('*', authGuard)

// GET /api/habits
habits.get('/', async (c) => {
  const userId = c.get('userId')
  const includeArchived = c.req.query('archived') === 'true'

  const where = includeArchived ? { userId } : { userId, isArchived: false }
  const dbHabits = await prisma.habit.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const data: Habit[] = dbHabits.map((h) => ({
    id: h.id,
    userId: h.userId,
    name: h.name,
    description: h.description,
    icon: h.icon,
    color: h.color,
    frequency: h.frequency,
    targetCount: h.targetCount,
    isArchived: h.isArchived,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  }))

  return c.json<ApiResult<Habit[]>>({ ok: true, data })
})

// POST /api/habits
habits.post('/', zValidator('json', HabitCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const habit = await prisma.habit.create({
    data: { ...body, userId },
  })

  return c.json<ApiResult<Habit>>({
    ok: true,
    data: {
      id: habit.id,
      userId: habit.userId,
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      targetCount: habit.targetCount,
      isArchived: habit.isArchived,
      createdAt: habit.createdAt.toISOString(),
      updatedAt: habit.updatedAt.toISOString(),
    },
  }, 201)
})

// POST /api/habits/:id/logs — log a habit completion
habits.post('/:id/logs', zValidator('json', HabitLogCreateSchema), async (c) => {
  const userId = c.get('userId')
  const habitId = c.req.param('id')
  const body = c.req.valid('json')

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } })
  if (!habit) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Habit not found', code: 'NOT_FOUND' } },
      404
    )
  }

  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: new Date(body.date) } },
    create: {
      habitId,
      userId,
      date: new Date(body.date),
      count: body.count ?? 1,
      note: body.note,
    },
    update: {
      count: body.count ?? 1,
      note: body.note,
    },
  })

  return c.json<ApiResult<HabitLog>>({
    ok: true,
    data: {
      id: log.id,
      habitId: log.habitId,
      userId: log.userId,
      date: log.date.toISOString(),
      count: log.count,
      note: log.note,
      createdAt: log.createdAt.toISOString(),
    },
  }, 201)
})

// GET /api/habits/:id/logs — get logs for a habit in date range
habits.get('/:id/logs', async (c) => {
  const userId = c.get('userId')
  const habitId = c.req.param('id')
  const from = c.req.query('from')
  const to = c.req.query('to')

  const where: Record<string, unknown> = { habitId, userId }
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, unknown>).gte = new Date(from)
    if (to) (where.date as Record<string, unknown>).lte = new Date(to)
  }

  const logs = await prisma.habitLog.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  const data: HabitLog[] = logs.map((l) => ({
    id: l.id,
    habitId: l.habitId,
    userId: l.userId,
    date: l.date.toISOString(),
    count: l.count,
    note: l.note,
    createdAt: l.createdAt.toISOString(),
  }))

  return c.json<ApiResult<HabitLog[]>>({ ok: true, data })
})

// DELETE /api/habits/:id
habits.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const habit = await prisma.habit.findFirst({ where: { id, userId } })
  if (!habit) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Habit not found', code: 'NOT_FOUND' } },
      404
    )
  }

  await prisma.habit.delete({ where: { id } })
  return c.json<ApiResult<{ deleted: true }>>({ ok: true, data: { deleted: true } })
})
