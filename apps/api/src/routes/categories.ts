import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@trackify/db'
import { CategoryCreateSchema } from '@trackify/shared'
import type { ApiResult, Category } from '@trackify/shared'
import { authGuard } from '../middleware/auth.js'

export const categories = new Hono()

categories.use('*', authGuard)

// GET /api/categories
categories.get('/', async (c) => {
  const userId = c.get('userId')

  const cats = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })

  const data: Category[] = cats.map((cat) => ({
    id: cat.id,
    userId: cat.userId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    createdAt: cat.createdAt.toISOString(),
  }))

  return c.json<ApiResult<Category[]>>({ ok: true, data })
})

// POST /api/categories
categories.post('/', zValidator('json', CategoryCreateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId, name: body.name } },
  })
  if (existing) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Category already exists', code: 'CONFLICT' } },
      409
    )
  }

  const cat = await prisma.category.create({
    data: { ...body, userId },
  })

  return c.json<ApiResult<Category>>({
    ok: true,
    data: {
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      createdAt: cat.createdAt.toISOString(),
    },
  }, 201)
})

// DELETE /api/categories/:id
categories.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const cat = await prisma.category.findFirst({ where: { id, userId } })
  if (!cat) {
    return c.json<ApiResult<never>>(
      { ok: false, error: { error: 'Category not found', code: 'NOT_FOUND' } },
      404
    )
  }

  await prisma.category.delete({ where: { id } })
  return c.json<ApiResult<{ deleted: true }>>({ ok: true, data: { deleted: true } })
})
