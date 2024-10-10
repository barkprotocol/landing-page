import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

// Ensure the AUTH_SECRET environment variable is defined
const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error('AUTH_SECRET is not defined');
}

const key = new TextEncoder().encode(secretKey);
const SALT_ROUNDS = 10;

// Hash a password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

// Compare a plain text password with a hashed password
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainTextPassword, hashedPassword);
}

// Define the session data structure
type SessionData = {
  user: { id: number };
  expires: string; // ISO string for expiration
};

// Sign a JWT with the provided payload
export async function signToken(payload: SessionData): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // Specify the signing algorithm
    .setIssuedAt() // Set the issued date
    .setExpirationTime('1 day') // Set expiration time
    .sign(key); // Sign the JWT with the key
}

// Verify a JWT and return the payload
export async function verifyToken(input: string): Promise<SessionData> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData; // Cast payload to SessionData
}

// Retrieve the current session from cookies
export async function getSession(): Promise<SessionData | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null; // Return null if no session cookie
  return verifyToken(sessionCookie); // Verify and return the session data
}

// Set a session cookie for the user
export async function setSession(user: NewUser): Promise<void> {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! }, // User ID must be defined
    expires: expiresInOneDay.toISOString(), // Set expiration date
  };
  const encryptedSession = await signToken(session); // Sign the session
  cookies().set('session', encryptedSession, {
    expires: expiresInOneDay, // Set cookie expiration
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax', // Lax SameSite policy for CSRF protection
  });
}
