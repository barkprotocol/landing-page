import { db } from './drizzle'
import { users, transactions, wallets, settings } from './schema'
import { faker } from '@faker-js/faker'
import { Keypair } from '@solana/web3.js'

async function seed() {
  console.log('Seeding database...')

  // Create users
  const userIds = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const solanaKeypair = Keypair.generate()
      const [user] = await db.insert(users).values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        solanaAddress: solanaKeypair.publicKey.toBase58(),
      }).returning({ id: users.id })
      return user.id
    })
  )

  // Create wallets for users
  await Promise.all(
    userIds.map(async (userId) => {
      await db.insert(wallets).values({
        userId,
        solBalance: faker.number.float({ min: 0, max: 10, precision: 0.000000001 }).toString(),
        usdcBalance: faker.number.float({ min: 0, max: 1000, precision: 0.000001 }).toString(),
        miltonBalance: faker.number.float({ min: 0, max: 10000, precision: 0.000000001 }).toString(),
      })
    })
  )

  // Create transactions for users
  await Promise.all(
    userIds.flatMap((userId) =>
      Array.from({ length: 5 }).map(async () => {
        const fromKeypair = Keypair.generate()
        const toKeypair = Keypair.generate()
        await db.insert(transactions).values({
          userId,
          amount: faker.number.float({ min: 0.1, max: 100, precision: 0.000000001 }).toString(),
          currency: faker.helpers.arrayElement(['SOL', 'USDC', 'MILTON']),
          type: faker.helpers.arrayElement(['purchase', 'transfer', 'swap']),
          status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
          signature: faker.string.alphanumeric(88),
          fromAddress: fromKeypair.publicKey.toBase58(),
          toAddress: toKeypair.publicKey.toBase58(),
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