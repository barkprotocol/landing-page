import { eq, lt } from 'drizzle-orm';
import { db } from './drizzle';
import { sessions } from './schema';

export async function createSession(userId: number, token: string, expiresAt: Date) {
  await db.insert(sessions).values({ userId, token, expiresAt });
}

export async function getSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  return session;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteExpiredSessions() {
  const now = new Date(); // Get the current date and time
  await db.delete(sessions).where(lt(sessions.expiresAt, now)); // Delete sessions where expiresAt is less than now
}
