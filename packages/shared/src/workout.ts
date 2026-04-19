import { z } from 'zod'

export const WorkoutTypeSchema = z.enum([
  'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'YOGA', 'OTHER',
])
export type WorkoutType = z.infer<typeof WorkoutTypeSchema>

export const ExerciseSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  name: z.string().min(1),
  sets: z.number().int().positive().nullable().optional(),
  reps: z.number().int().positive().nullable().optional(),
  weight: z.number().positive().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  distance: z.number().positive().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
})
export type Exercise = z.infer<typeof ExerciseSchema>

export const ExerciseCreateSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
})
export type ExerciseCreate = z.infer<typeof ExerciseCreateSchema>

export const WorkoutSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  type: WorkoutTypeSchema,
  duration: z.number().int().positive().nullable().optional(),
  calories: z.number().int().nonnegative().nullable().optional(),
  note: z.string().nullable().optional(),
  date: z.string(),
  exercises: z.array(ExerciseSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Workout = z.infer<typeof WorkoutSchema>

export const WorkoutCreateSchema = z.object({
  name: z.string().min(1),
  type: WorkoutTypeSchema.optional(),
  duration: z.number().int().positive().optional(),
  calories: z.number().int().nonnegative().optional(),
  note: z.string().optional(),
  date: z.string(),
  exercises: z.array(ExerciseCreateSchema).optional(),
})
export type WorkoutCreate = z.infer<typeof WorkoutCreateSchema>
