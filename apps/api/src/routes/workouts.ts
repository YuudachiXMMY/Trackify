import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@trackify/db'
import { WorkoutCreateSchema } from '@trackify/shared'
import type { ApiResult, Workout } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const workouts = new Hono()

workouts.use('*', authGuard)

function toWorkoutResponse(w: any): Workout {
  return {
    id: w.id,
    userId: w.userId,
    name: w.name,
    type: w.type,
    duration: w.duration,
    calories: w.calories,
    note: w.note,
    date: w.date.toISOString(),
    exercises: (w.exercises ?? []).map((e: any) => ({
      id: e.id,
      workoutId: e.workoutId,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      duration: e.duration,
      distance: e.distance,
      sortOrder: e.sortOrder,
    })),
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }
}

// GET /api/workouts
workouts.get('/', async (c) => {
  const userId = c.get('userId')
  const from = c.req.query('from')
  const to = c.req.query('to')

  const where: Record<string, unknown> = { userId }
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, unknown>).gte = new Date(from)
    if (to) (where.date as Record<string, unknown>).lte = new Date(to)
  }

  const dbWorkouts = await prisma.workout.findMany({
    where,
    include: { exercises: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { date: 'desc' },
  })

  return c.json<ApiResult<Workout[]>>({ ok: true, data: dbWorkouts.map(toWorkoutResponse) })
})

// POST /api/workouts
workouts.post('/', zValidator('json', WorkoutCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const workout = await prisma.workout.create({
    data: {
      userId,
      name: body.name,
      type: body.type ?? 'STRENGTH',
      duration: body.duration,
      calories: body.calories,
      note: body.note,
      date: new Date(body.date),
      exercises: body.exercises
        ? { create: body.exercises.map((e, i) => ({ ...e, sortOrder: e.sortOrder ?? i })) }
        : undefined,
    },
    include: { exercises: { orderBy: { sortOrder: 'asc' } } },
  })

  return c.json<ApiResult<Workout>>({ ok: true, data: toWorkoutResponse(workout) }, 201)
})

// GET /api/workouts/:id
workouts.get('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const workout = await prisma.workout.findFirst({
    where: { id, userId },
    include: { exercises: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!workout) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Workout not found', code: 'NOT_FOUND' } },
      404
    )
  }

  return c.json<ApiResult<Workout>>({ ok: true, data: toWorkoutResponse(workout) })
})

// DELETE /api/workouts/:id
workouts.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const workout = await prisma.workout.findFirst({ where: { id, userId } })
  if (!workout) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Workout not found', code: 'NOT_FOUND' } },
      404
    )
  }

  await prisma.workout.delete({ where: { id } })
  return c.json<ApiResult<{ deleted: true }>>({ ok: true, data: { deleted: true } })
})
