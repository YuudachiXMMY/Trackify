import { z } from 'zod'

export const FrequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY'])
export type Frequency = z.infer<typeof FrequencySchema>

export const HabitSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().default('#6366f1'),
  frequency: FrequencySchema,
  targetCount: z.number().int().positive(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Habit = z.infer<typeof HabitSchema>

export const HabitCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  frequency: FrequencySchema.optional(),
  targetCount: z.number().int().positive().optional(),
})
export type HabitCreate = z.infer<typeof HabitCreateSchema>

export const HabitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  userId: z.string(),
  date: z.string(),
  count: z.number().int().nonnegative(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
})
export type HabitLog = z.infer<typeof HabitLogSchema>

export const HabitLogCreateSchema = z.object({
  date: z.string(),
  count: z.number().int().positive().optional(),
  note: z.string().optional(),
})
export type HabitLogCreate = z.infer<typeof HabitLogCreateSchema>
