import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@trackify/db'
import { UserGoalCreateSchema, UserGoalUpdateSchema } from '@trackify/shared'
import type { ApiResult, UserGoal } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const userGoals = new Hono()

userGoals.use('*', authGuard)

// GET /api/user-goals — get the current user's goals
userGoals.get('/', async (c) => {
  const userId = c.get('userId')

  const goal = await prisma.userGoal.findUnique({ where: { userId } })

  if (!goal) {
    return c.json<ApiResult<{ calorieTarget: number; proteinTarget: number; carbsTarget: number; fatTarget: number; waterTarget: number }>>({
      ok: true,
      data: {
        calorieTarget: 0,
        proteinTarget: 0,
        carbsTarget: 0,
        fatTarget: 0,
        waterTarget: 0,
      },
    })
  }

  return c.json<ApiResult<UserGoal>>({
    ok: true,
    data: {
      id: goal.id,
      userId: goal.userId,
      goalType: goal.goalType,
      calorieTarget: goal.calorieTarget,
      proteinTarget: goal.proteinTarget,
      carbsTarget: goal.carbsTarget,
      fatTarget: goal.fatTarget,
      waterTarget: goal.waterTarget,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    },
  })
})

// POST /api/user-goals — create goals for the current user
userGoals.post('/', zValidator('json', UserGoalCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const existing = await prisma.userGoal.findUnique({ where: { userId } })
  if (existing) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Goals already exist for this user', code: 'CONFLICT' } },
      409
    )
  }

  const goal = await prisma.userGoal.create({
    data: { ...body, userId },
  })

  return c.json<ApiResult<UserGoal>>(
    {
      ok: true,
      data: {
        id: goal.id,
        userId: goal.userId,
        goalType: goal.goalType,
        calorieTarget: goal.calorieTarget,
        proteinTarget: goal.proteinTarget,
        carbsTarget: goal.carbsTarget,
        fatTarget: goal.fatTarget,
        waterTarget: goal.waterTarget,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      },
    },
    201
  )
})

// PATCH /api/user-goals — update goals for the current user
userGoals.patch('/', zValidator('json', UserGoalUpdateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const existing = await prisma.userGoal.findUnique({ where: { userId } })
  if (!existing) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Goals not found', code: 'NOT_FOUND' } },
      404
    )
  }

  const goal = await prisma.userGoal.update({
    where: { userId },
    data: body,
  })

  return c.json<ApiResult<UserGoal>>({
    ok: true,
    data: {
      id: goal.id,
      userId: goal.userId,
      goalType: goal.goalType,
      calorieTarget: goal.calorieTarget,
      proteinTarget: goal.proteinTarget,
      carbsTarget: goal.carbsTarget,
      fatTarget: goal.fatTarget,
      waterTarget: goal.waterTarget,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    },
  })
})
