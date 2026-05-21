import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '@trackify/db'
import type { ApiResult, NutritionSummary, NutritionStatistics, DailyNutrition } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const nutrition = new Hono<{ Variables: { userId: string; email: string } }>()

nutrition.use('*', authGuard)

// GET /api/nutrition/summary?date=YYYY-MM-DD
nutrition.get('/summary', zValidator('query', z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() })), async (c) => {
  const userId = c.get('userId')
  const { date: dateParam } = c.req.valid('query')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateStr = dateParam ?? today.toISOString().split('T')[0]
  const date = new Date(dateStr)

  const [meals, waterLog] = await Promise.all([
    prisma.mealEntry.aggregate({
      where: { userId, date },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        fiber: true,
      },
    }),
    prisma.waterLog.findFirst({ where: { userId, date } }),
  ])

  const summary: NutritionSummary = {
    calories: meals._sum.calories ?? 0,
    protein: meals._sum.protein ?? 0,
    carbs: meals._sum.carbs ?? 0,
    fat: meals._sum.fat ?? 0,
    fiber: meals._sum.fiber ?? 0,
    water: waterLog?.glasses ?? 0,
  }

  return c.json<ApiResult<NutritionSummary>>({ ok: true, data: summary })
})

// GET /api/nutrition/statistics?period=week|month
nutrition.get('/statistics', zValidator('query', z.object({ period: z.enum(['week', 'month']).optional() })), async (c) => {
  const userId = c.get('userId')
  const { period: periodParam } = c.req.valid('query')
  const period: 'week' | 'month' =
    periodParam === 'month' ? 'month' : 'week'

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  if (period === 'month') {
    startDate.setDate(startDate.getDate() - 29)
  } else {
    startDate.setDate(startDate.getDate() - 6)
  }

  const stats = await prisma.mealEntry.groupBy({
    by: ['date'],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    _sum: {
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
    },
    orderBy: { date: 'asc' },
  })

  const data: DailyNutrition[] = stats.map((s) => ({
    date: s.date.toISOString().split('T')[0],
    calories: s._sum.calories ?? 0,
    protein: s._sum.protein ?? 0,
    carbs: s._sum.carbs ?? 0,
    fat: s._sum.fat ?? 0,
  }))

  const result: NutritionStatistics = { data, period }

  return c.json<ApiResult<NutritionStatistics>>({ ok: true, data: result })
})
