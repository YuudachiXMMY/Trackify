import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '@trackify/db'
import { MealEntryCreateSchema } from '@trackify/shared'
import type { ApiResult, MealEntry } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const meals = new Hono()

meals.use('*', authGuard)

// GET /api/meals — list meals by date
meals.get('/', zValidator('query', z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })), async (c) => {
  const userId = c.get('userId')
  const { date } = c.req.valid('query')

  const dbMeals = await prisma.mealEntry.findMany({
    where: { userId, date: new Date(date) },
    orderBy: { createdAt: 'desc' },
  })

  const data: MealEntry[] = dbMeals.map((m) => ({
    id: m.id,
    userId: m.userId,
    mealType: m.mealType,
    name: m.name,
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    fiber: m.fiber,
    imageUrl: m.imageUrl,
    note: m.note,
    date: m.date.toISOString(),
    time: m.time,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }))

  return c.json<ApiResult<MealEntry[]>>({ ok: true, data })
})

// POST /api/meals — create a meal entry
meals.post('/', zValidator('json', MealEntryCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const meal = await prisma.mealEntry.create({
    data: {
      ...body,
      userId,
      date: new Date(body.date),
    },
  })

  return c.json<ApiResult<MealEntry>>(
    {
      ok: true,
      data: {
        id: meal.id,
        userId: meal.userId,
        mealType: meal.mealType,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        imageUrl: meal.imageUrl,
        note: meal.note,
        date: meal.date.toISOString(),
        time: meal.time,
        createdAt: meal.createdAt.toISOString(),
        updatedAt: meal.updatedAt.toISOString(),
      },
    },
    201
  )
})

// DELETE /api/meals/:id — delete a meal entry
meals.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const meal = await prisma.mealEntry.findFirst({ where: { id, userId } })
  if (!meal) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Meal entry not found', code: 'NOT_FOUND' } },
      404
    )
  }

  await prisma.mealEntry.delete({ where: { id } })
  return c.json<ApiResult<{ deleted: true }>>({ ok: true, data: { deleted: true } })
})
