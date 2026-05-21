import { z } from 'zod';

export const MealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']);
export type MealType = z.infer<typeof MealTypeSchema>;

export const MealEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  mealType: MealTypeSchema,
  name: z.string(),
  calories: z.number().int(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().nullable(),
  imageUrl: z.string().nullable(),
  note: z.string().nullable(),
  date: z.string(),
  time: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MealEntry = z.infer<typeof MealEntrySchema>;

export const MealEntryCreateSchema = z.object({
  mealType: MealTypeSchema,
  name: z.string().min(1),
  calories: z.number().int().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  note: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
});
export type MealEntryCreate = z.infer<typeof MealEntryCreateSchema>;
