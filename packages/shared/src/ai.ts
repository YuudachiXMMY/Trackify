import { z } from 'zod';

export const AIChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const AIChatRequestSchema = z.object({
  messages: z.array(AIChatMessageSchema).min(1),
});
export type AIChatRequest = z.infer<typeof AIChatRequestSchema>;

export const AIChatResponseSchema = z.object({
  response: z.string(),
});
export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;

export const AIScanRequestSchema = z.object({
  image: z.string().max(10_485_760),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']).optional(),
});
export type AIScanRequest = z.infer<typeof AIScanRequestSchema>;

export const AIScanResponseSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  calories: z.number().int(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
});
export type AIScanResponse = z.infer<typeof AIScanResponseSchema>;
