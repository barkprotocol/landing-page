import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initJupiter, getQuote, executeSwap, getTokenInfo } from '@/api/v1/jupiter-api'
import { PublicKey } from '@solana/web3.js'

// Initialize Jupiter when the module is loaded
initJupiter().catch(console.error)

const SwapRequestSchema = z.object({
  inputMint: z.string(),
  outputMint: z.string(),
  amount: z.string(),
  slippage: z.number().min(0).max(100),
  userPublicKey: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inputMint, outputMint, amount, slippage, userPublicKey } = SwapRequestSchema.parse(body)

    // Validate public key
    try {
      new PublicKey(userPublicKey)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid user public key' }, { status: 400 })
    }

    // Get token info
    const inputToken = getTokenInfo(inputMint)
    const outputToken = getTokenInfo(outputMint)

    if (!inputToken || !outputToken) {
      return NextResponse.json({ error: 'Invalid input or output token' }, { status: 400 })
    }

    // Get quote
    const quote = await getQuote({ inputMint, outputMint, amount, slippage })

    if (!quote) {
      return NextResponse.json({ error: 'No route found for the swap' }, { status: 404 })
    }

    // Execute swap
    const swapResult = await executeSwap({ route: quote, userPublicKey })

    if ('error' in swapResult) {
      return NextResponse.json({ error: swapResult.error }, { status: 500 })
    }

    // Calculate amounts in human-readable format
    const inputAmount = (parseInt(swapResult.inputAmount) / 10 ** inputToken.decimals).toFixed(inputToken.decimals)
    const outputAmount = (parseInt(swapResult.outputAmount) / 10 ** outputToken.decimals).toFixed(outputToken.decimals)

    return NextResponse.json({
      txid: swapResult.txid,
      inputAmount,
      outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
    })
  } catch (error) {
    console.error('Swap error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const inputMint = request.nextUrl.searchParams.get('inputMint')
  const outputMint = request.nextUrl.searchParams.get('outputMint')
  const amount = request.nextUrl.searchParams.get('amount')
  const slippage = request.nextUrl.searchParams.get('slippage')

  if (!inputMint || !outputMint || !amount || !slippage) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const quote = await getQuote({
      inputMint,
      outputMint,
      amount,
      slippage: parseFloat(slippage),
    })

    if (!quote) {
      return NextResponse.json({ error: 'No route found for the swap' }, { status: 404 })
    }

    const inputToken = getTokenInfo(inputMint)
    const outputToken = getTokenInfo(outputMint)

    if (!inputToken || !outputToken) {
      return NextResponse.json({ error: 'Invalid input or output token' }, { status: 400 })
    }

    const inputAmount = (parseInt(quote.inAmount) / 10 ** inputToken.decimals).toFixed(inputToken.decimals)
    const outputAmount = (parseInt(quote.outAmount) / 10 ** outputToken.decimals).toFixed(outputToken.decimals)

    return NextResponse.json({
      inputAmount,
      outputAmount,
      inputToken: inputToken.symbol,
      outputToken: outputToken.symbol,
      priceImpact: quote.priceImpactPct,
    })
  } catch (error) {
    console.error('Quote error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}