import { z } from 'zod';

export const GoalTypeSchema = z.enum(['BALANCED', 'LOSS', 'GAIN', 'RECOVERY']);
export type GoalType = z.infer<typeof GoalTypeSchema>;

export const UserGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalType: GoalTypeSchema,
  calorieTarget: z.number().int(),
  proteinTarget: z.number().int(),
  carbsTarget: z.number().int(),
  fatTarget: z.number().int(),
  waterTarget: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserGoal = z.infer<typeof UserGoalSchema>;

export const UserGoalCreateSchema = z.object({
  goalType: GoalTypeSchema.optional(),
  calorieTarget: z.number().int().min(0).optional(),
  proteinTarget: z.number().int().min(0).optional(),
  carbsTarget: z.number().int().min(0).optional(),
  fatTarget: z.number().int().min(0).optional(),
  waterTarget: z.number().int().min(0).optional(),
});
export type UserGoalCreate = z.infer<typeof UserGoalCreateSchema>;

export const UserGoalUpdateSchema = UserGoalCreateSchema;
export type UserGoalUpdate = z.infer<typeof UserGoalUpdateSchema>;
