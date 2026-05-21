import { z } from 'zod';

export const NutritionSummarySchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
  water: z.number().int(),
});
export type NutritionSummary = z.infer<typeof NutritionSummarySchema>;

export const DailyNutritionSchema = z.object({
  date: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});
export type DailyNutrition = z.infer<typeof DailyNutritionSchema>;

export const NutritionStatisticsSchema = z.object({
  data: z.array(DailyNutritionSchema),
  period: z.enum(['week', 'month']),
});
export type NutritionStatistics = z.infer<typeof NutritionStatisticsSchema>;
