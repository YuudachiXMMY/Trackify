# packages/shared — Zod Schemas

Shared validation schemas and TypeScript types used by both `apps/api` and `apps/web-overrides`.

## Modules

| Module | Schemas |
|--------|---------|
| `user.ts` | UserSchema, UserCreateSchema, LoginSchema, AuthResponseSchema |
| `habit.ts` | HabitSchema, HabitCreateSchema, HabitLogSchema, HabitLogCreateSchema, FrequencySchema |
| `workout.ts` | WorkoutSchema, WorkoutCreateSchema, ExerciseSchema, ExerciseCreateSchema, WorkoutTypeSchema |
| `time-entry.ts` | TimeEntrySchema, TimeEntryCreateSchema, CategorySchema, CategoryCreateSchema |
| `index.ts` | Re-exports all + ApiErrorSchema, ApiResult<T> |

## API Envelope

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
```

Every HTTP response uses this envelope.
