import { createMiddleware } from 'hono/factory'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

export interface JwtPayload {
  userId: string
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export const authGuard = createMiddleware<{
  Variables: { userId: string; email: string }
}>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }, 401)
  }

  try {
    const payload = verifyToken(header.slice(7))
    c.set('userId', payload.userId)
    c.set('email', payload.email)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' }, 401)
  }
})
