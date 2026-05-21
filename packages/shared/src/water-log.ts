import { z } from 'zod';

export const WaterLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  glasses: z.number().int(),
  date: z.string(),
  createdAt: z.string(),
});
export type WaterLog = z.infer<typeof WaterLogSchema>;

export const WaterLogUpsertSchema = z.object({
  glasses: z.number().int().min(0),
  date: z.string(),
});
export type WaterLogUpsert = z.infer<typeof WaterLogUpsertSchema>;
