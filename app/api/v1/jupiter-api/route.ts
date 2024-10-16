import { NextResponse } from 'next/server'
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/api'
import { Connection, PublicKey } from '@solana/web3.js'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'

const connection = new Connection(SOLANA_RPC_ENDPOINT)

let jupiter: Jupiter | null = null
let tokenList: any[] = []

async function initJupiter() {
  if (!jupiter) {
    jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      userPublicKey: null, // We'll set this later when executing a swap
    })
  }
  if (tokenList.length === 0) {
    tokenList = await (await fetch(TOKEN_LIST_URL)).json()
  }
}

const QuoteSchema = z.object({
  inputMint: z.string(),
  outputMint: z.string(),
  amount: z.string(),
  slippage: z.number().min(0).max(100).optional().default(0.5),
})

const SwapSchema = z.object({
  route: z.any(), // We'll validate this more thoroughly in the handler
  userPublicKey: z.string(),
})

export async function GET(request: Request) {
  await initJupiter()
  if (!jupiter) {
    return NextResponse.json({ error: 'Jupiter not initialized' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const inputData = {
    inputMint: searchParams.get('inputMint'),
    outputMint: searchParams.get('outputMint'),
    amount: searchParams.get('amount'),
    slippage: searchParams.get('slippage'),
  }

  try {
    const { inputMint, outputMint, amount, slippage } = QuoteSchema.parse(inputData)

    const routes = await jupiter.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount: amount,
      slippageBps: Math.floor(slippage * 100),
      forceFetch: true,
    })

    if (routes.routesInfos.length === 0) {
      return NextResponse.json({ error: 'No routes found' }, { status: 404 })
    }

    const bestRoute = routes.routesInfos[0]
    return NextResponse.json({
      inputAmount: bestRoute.inAmount,
      outputAmount: bestRoute.outAmount,
      route: bestRoute,
    })
  } catch (error) {
    console.error('Error fetching quote:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  await initJupiter()
  if (!jupiter) {
    return NextResponse.json({ error: 'Jupiter not initialized' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { route, userPublicKey } = SwapSchema.parse(body)

    // Validate the route
    if (!route || !route.inAmount || !route.outAmount || !route.marketInfos) {
      return NextResponse.json({ error: 'Invalid route provided' }, { status: 400 })
    }

    const { execute } = await jupiter.exchange({
      route: route as RouteInfo,
      userPublicKey: new PublicKey(userPublicKey),
    })

    const swapResult = await execute()

    if ('error' in swapResult) {
      throw new Error(swapResult.error)
    }

    return NextResponse.json({
      txid: swapResult.txid,
      inputAmount: route.inAmount,
      outputAmount: route.outAmount,
    })
  } catch (error) {
    console.error('Error executing swap:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to execute swap' }, { status: 500 })
  }
}