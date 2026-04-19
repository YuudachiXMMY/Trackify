import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  color: z.string().default('#6366f1'),
  icon: z.string().nullable().optional(),
  createdAt: z.string(),
})
export type Category = z.infer<typeof CategorySchema>

export const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  icon: z.string().optional(),
})
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>

export const TimeEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startTime: z.string(),
  endTime: z.string().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(),
  category: CategorySchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type TimeEntry = z.infer<typeof TimeEntrySchema>

export const TimeEntryCreateSchema = z.object({
  categoryId: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
})
export type TimeEntryCreate = z.infer<typeof TimeEntryCreateSchema>
