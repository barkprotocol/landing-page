import { db } from './drizzle'
import { users, transactions, wallets, settings } from './schema'
import { faker } from '@faker-js/faker'

async function seed() {
  console.log('Seeding database...')

  // Create users
  const userIds = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const [user] = await db.insert(users).values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
      }).returning({ id: users.id })
      return user.id
    })
  )

  // Create wallets for users
  await Promise.all(
    userIds.map(async (userId) => {
      await db.insert(wallets).values({
        userId,
        address: faker.finance.solanaAddress(),
        balance: faker.number.int({ min: 0, max: 1000000 }),
      })
    })
  )

  // Create transactions for users
  await Promise.all(
    userIds.flatMap((userId) =>
      Array.from({ length: 5 }).map(async () => {
        await db.insert(transactions).values({
          userId,
          amount: faker.number.int({ min: 1, max: 1000 }),
          type: faker.helpers.arrayElement(['deposit', 'withdrawal', 'transfer']),
          status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
        })
      })
    )
  )

  // Create settings for users
  await Promise.all(
    userIds.map(async (userId) => {
      await db.insert(settings).values({
        userId,
        preferences: JSON.stringify({
          theme: faker.helpers.arrayElement(['light', 'dark']),
          language: faker.helpers.arrayElement(['en', 'es', 'fr']),
        }),
        notifications: faker.datatype.boolean(),
      })
    })
  )

  console.log('Seeding complete!')
}

seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})