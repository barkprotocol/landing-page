import { db } from './drizzle';
import { users, transactions, wallets, settings, blinks } from './schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // Create users
  const userIds = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      const [user] = await db.insert(users).values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        hashedPassword: await faker.internet.password(), // In a real scenario, this should be properly hashed
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      }).returning({ id: users.id });
      return user.id;
    })
  );

  // Create wallets for users
  await Promise.all(
    userIds.map(async (userId) => {
      await db.insert(wallets).values({
        userId,
        address: faker.finance.ethereumAddress(), // Using Ethereum address as a placeholder
        balance: parseFloat(faker.finance.amount(0, 1000000, 2)),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      });
    })
  );

  // Create transactions for users
  await Promise.all(
    userIds.flatMap((userId) =>
      Array.from({ length: 5 }).map(async () => {
        await db.insert(transactions).values({
          userId,
          amount: parseFloat(faker.finance.amount(1, 1000, 2)),
          description: faker.finance.transactionDescription(),
          type: faker.helpers.arrayElement(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT']),
          status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        });
      })
    )
  );

  // Create blinks for users
  await Promise.all(
    userIds.flatMap((userId) =>
      Array.from({ length: 3 }).map(async () => {
        await db.insert(blinks).values({
          userId,
          label: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          mint: faker.finance.ethereumAddress(), // Using Ethereum address as a placeholder for mint
          symbolIcon: faker.finance.currencySymbol(),
          commission: faker.datatype.boolean(),
          percentage: faker.datatype.boolean() ? parseFloat(faker.finance.amount(0, 10, 2)) : null,
          status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'EXPIRED']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        });
      })
    )
  );

  // Create or update settings for users
  await Promise.all(
    userIds.map(async (userId) => {
      const existingSettings = await db.select().from(settings).where(eq(settings.userId, userId));
      
      if (existingSettings.length === 0) {
        await db.insert(settings).values({
          userId,
          preferences: JSON.stringify({
            theme: faker.helpers.arrayElement(['light', 'dark']),
            language: faker.helpers.arrayElement(['en', 'es', 'fr']),
          }),
          notifications: faker.datatype.boolean(),
        });
      } else {
        await db.update(settings)
          .set({
            preferences: JSON.stringify({
              theme: faker.helpers.arrayElement(['light', 'dark']),
              language: faker.helpers.arrayElement(['en', 'es', 'fr']),
            }),
            notifications: faker.datatype.boolean(),
          })
          .where(eq(settings.userId, userId));
      }
    })
  );

  console.log('Seeding complete!');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

export default function Component() {
  return null; // This is a script file, so we don't need to return any JSX
}