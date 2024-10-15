import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { CustomError, ErrorType } from '@/lib/custom-error';
import { Logger } from '@/lib/logger';

const logger = new Logger('api/v1/actions');

const signInSchema = z.object({
  action: z.literal('signIn'),
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  action: z.literal('signUp'),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const signOutSchema = z.object({
  action: z.literal('signOut'),
});

const actionSchema = z.discriminatedUnion('action', [
  signInSchema,
  signUpSchema,
  signOutSchema,
]);

export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(request);
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded');
    }

    const body = await request.json();
    const action = actionSchema.parse(body);

    switch (action.action) {
      case 'signIn':
        return await handleSignIn(action);
      case 'signUp':
        return await handleSignUp(action);
      case 'signOut':
        return await handleSignOut();
      default:
        throw new CustomError(ErrorType.InvalidAction, 'Invalid action');
    }
  } catch (error) {
    logger.error('Error processing action:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSignIn({ email, password }: z.infer<typeof signInSchema>) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new CustomError(ErrorType.InvalidCredentials, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError(ErrorType.InvalidCredentials, 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

  return NextResponse.json({ success: true, token }, { 
    headers: {
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    }
  });
}

async function handleSignUp({ email, password, name }: z.infer<typeof signUpSchema>) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new CustomError(ErrorType.UserAlreadyExists, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

  return NextResponse.json({ success: true, token }, {
    headers: {
      'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    }
  });
}

async function handleSignOut() {
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    }
  });
}

export default function Component() {
  return null; // This is a Next.js API route, so we don't need to return any JSX
}
