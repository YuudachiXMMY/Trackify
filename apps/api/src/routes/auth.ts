import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcrypt'
import { prisma } from '@trackify/db'
import { LoginSchema, UserCreateSchema } from '@trackify/shared'
import type { ApiResult, AuthResponse } from '@trackify/shared'
import { signToken, authGuard } from '../middleware/auth.js'

export const auth = new Hono()

// POST /api/auth/register
auth.post('/register', zValidator('json', UserCreateSchema), async (c) => {
  const body = c.req.valid('json')

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Email already registered', code: 'CONFLICT' } },
      409
    )
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: await bcrypt.hash(body.password, 12),
      name: body.name,
      nickname: body.nickname,
      timezone: body.timezone ?? 'America/New_York',
    },
  })

  const token = signToken({ userId: user.id, email: user.email })

  return c.json<ApiResult<AuthResponse>>({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    },
  }, 201)
})

// POST /api/auth/login
auth.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Invalid credentials', code: 'UNAUTHORIZED' } },
      401
    )
  }

  const token = signToken({ userId: user.id, email: user.email })

  return c.json<ApiResult<AuthResponse>>({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    },
  })
})

// GET /api/auth/me
auth.get('/me', authGuard, async (c) => {
  const userId = c.get('userId')
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'User not found', code: 'NOT_FOUND' } },
      404
    )
  }

  return c.json<ApiResult<AuthResponse['user']>>({
    ok: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  })
})
