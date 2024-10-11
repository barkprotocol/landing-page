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
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(request);
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded');
    }

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'signIn':
        return handleSignIn(body);
      case 'signUp':
        return handleSignUp(body);
      case 'signOut':
        return handleSignOut();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error processing action:', error);
    return handleErrorResponse(error);
  }
}

async function handleSignIn(body: any) {
  try {
    const { email, password } = signInSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CustomError(ErrorType.InvalidCredentials, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(ErrorType.InvalidCredentials, 'Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return handleErrorResponse(error);
  }
}

async function handleSignUp(body: any) {
  try {
    const { email, password, name } = signUpSchema.parse(body);

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

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return handleErrorResponse(error);
  }
}

function handleSignOut() {
  // In a stateless JWT setup, we don't need to do anything server-side for sign-out
  // The client should remove the token from storage
  return NextResponse.json({ success: true });
}

function handleErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
  }
  if (error instanceof CustomError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  logger.error('Unexpected error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
