export * from './user'
export * from './habit'
export * from './workout'
export * from './time-entry'
export * from './meal'
export * from './water-log'
export * from './user-goal'
export * from './nutrition'
export * from './ai'

import { z } from 'zod'

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
