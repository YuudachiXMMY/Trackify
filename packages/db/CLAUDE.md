# packages/db — Database Layer

## Stack
- **Prisma 5** ORM
- **PostgreSQL 16** database
- **cuid** for primary keys

## Models

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| User | User accounts | → Habit[], HabitLog[], Workout[], TimeEntry[], Category[] |
| Habit | Trackable habits | → HabitLog[] |
| HabitLog | Daily habit completions | ← Habit, User |
| Workout | Fitness sessions | → Exercise[] |
| Exercise | Individual exercises in a workout | ← Workout |
| Category | Time tracking categories | → TimeEntry[] |
| TimeEntry | Time tracking entries | ← User, Category? |

## Commands

```bash
pnpm db:generate    # Regenerate @prisma/client types
pnpm db:migrate     # Create + apply migration
pnpm db:studio      # Open Prisma Studio at localhost:5555
pnpm db:seed        # Seed demo user (idempotent)
```

## Seed

- Creates demo user: `demo@trackify.app`
- Idempotent: skips if user already exists
- Prints user `id` → copy into `.env.local` as `VITE_SEED_USER_ID`
