import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  nickname: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  timezone: z.string().default('America/New_York'),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  nickname: z.string().min(1).optional(),
  timezone: z.string().optional(),
})
export type UserCreate = z.infer<typeof UserCreateSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type Login = z.infer<typeof LoginSchema>

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>
