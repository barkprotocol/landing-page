import { Jupiter, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/api'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenInfo } from '@solana/spl-token-registry'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'

const connection = new Connection(SOLANA_RPC_ENDPOINT)

let jupiter: Jupiter | null = null
let tokenList: TokenInfo[] = []

export async function initJupiter(): Promise<void> {
  if (!jupiter) {
    jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      userPublicKey: null, // We'll set this later when executing a swap
    })
  }
  if (tokenList.length === 0) {
    const response = await fetch(TOKEN_LIST_URL)
    const tokens = await response.json()
    tokenList = tokens as TokenInfo[]
  }
}

export interface QuoteParams {
  inputMint: string
  outputMint: string
  amount: string
  slippage: number
}

export interface SwapParams {
  route: RouteInfo
  userPublicKey: string
}

export async function getQuote(params: QuoteParams): Promise<RouteInfo | null> {
  if (!jupiter) {
    throw new Error('Jupiter not initialized')
  }

  const { inputMint, outputMint, amount, slippage } = params

  const routes = await jupiter.computeRoutes({
    inputMint: new PublicKey(inputMint),
    outputMint: new PublicKey(outputMint),
    amount: amount,
    slippageBps: Math.floor(slippage * 100),
    forceFetch: true,
  })

  if (routes.routesInfos.length === 0) {
    return null
  }

  return routes.routesInfos[0]
}

export async function executeSwap(params: SwapParams): Promise<{ txid: string; inputAmount: string; outputAmount: string } | { error: string }> {
  if (!jupiter) {
    throw new Error('Jupiter not initialized')
  }

  const { route, userPublicKey } = params

  try {
    const { execute } = await jupiter.exchange({
      route,
      userPublicKey: new PublicKey(userPublicKey),
    })

    const swapResult = await execute()

    if ('error' in swapResult) {
      return { error: swapResult.error }
    }

    return {
      txid: swapResult.txid,
      inputAmount: route.inAmount,
      outputAmount: route.outAmount,
    }
  } catch (error) {
    console.error('Error executing swap:', error)
    return { error: 'Failed to execute swap' }
  }
}

export function getTokenInfo(mintAddress: string): TokenInfo | undefined {
  return tokenList.find(token => token.address === mintAddress)
}

export { jupiter, tokenList }