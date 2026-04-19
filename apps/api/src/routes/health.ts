import { Hono } from 'hono'
import { prisma } from '@trackify/db'

export const health = new Hono()

health.get('/', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return c.json({ status: 'ok', db: 'connected' })
  } catch (err) {
    return c.json({ status: 'error', db: 'disconnected' }, 503)
  }
})
