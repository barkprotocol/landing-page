import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'
import { CustomError, ErrorType } from './custom-error'

const redis = Redis.fromEnv()

interface RateLimitConfig {
  limit: number
  window: number // in milliseconds
}

const defaultConfig: RateLimitConfig = {
  limit: 10,
  window: 60 * 1000 // 1 minute
}

export async function rateLimit(request: NextRequest, config: RateLimitConfig = defaultConfig) {
  const ip = request.ip ?? '127.0.0.1'
  const key = `ratelimit:${ip}`

  const current = await redis.get(key)
  const count = current ? parseInt(current, 10) : 0

  if (count >= config.limit) {
    throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')
  }

  await redis.set(key, count + 1, { px: config.window })
  
  return {
    success: true,
    remaining: config.limit - (count + 1),
    reset: new Date(Date.now() + config.window)
  }
}

export function getRateLimitHeaders(rateLimitResult: Awaited<ReturnType<typeof rateLimit>>) {
  return {
    'X-RateLimit-Limit': String(defaultConfig.limit),
    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
    'X-RateLimit-Reset': rateLimitResult.reset.toUTCString()
  }
}