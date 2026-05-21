import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@trackify.app'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`seed: demo user already exists (${existing.id})`)
    return
  }

  const hashedPassword = await bcrypt.hash('demo123', 12)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'Demo User',
      nickname: 'demo',
      timezone: 'America/New_York',
      habits: {
        create: [
          { name: 'Morning Run', icon: 'running', color: '#ef4444', frequency: 'DAILY', targetCount: 1 },
          { name: 'Read 30 min', icon: 'book', color: '#3b82f6', frequency: 'DAILY', targetCount: 1 },
          { name: 'Meditate', icon: 'brain', color: '#8b5cf6', frequency: 'DAILY', targetCount: 1 },
        ],
      },
      categories: {
        create: [
          { name: 'Work', color: '#3b82f6', icon: 'briefcase' },
          { name: 'Study', color: '#8b5cf6', icon: 'book' },
          { name: 'Exercise', color: '#ef4444', icon: 'dumbbell' },
          { name: 'Personal', color: '#10b981', icon: 'user' },
        ],
      },
    },
  })

  console.log(`seed: created user (${user.id})`)

  await prisma.userGoal.create({
    data: {
      userId: user.id,
      goalType: 'BALANCED',
      calorieTarget: 1800,
      proteinTarget: 120,
      carbsTarget: 225,
      fatTarget: 60,
      waterTarget: 8,
    },
  })

  console.log(`seed: created default UserGoal for user (${user.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
