import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Jupiter } from '@jup-ag/api'
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry'
import { NextResponse } from 'next/server'

export async function getMarketPrices(connection: Connection) {
  try {
    const tokenList = await new TokenListProvider().resolve()
    const tokenMap = tokenList.filterByClusterSlug('mainnet-beta').getList().reduce((map, item) => {
      map.set(item.symbol, item)
      return map
    }, new Map<string, TokenInfo>())

    const jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      user: null
    })

    const prices: Record<string, number> = {}
    for (const [symbol, tokenInfo] of tokenMap) {
      if (['SOL', 'USDC', 'MILTON'].includes(symbol)) {
        const route = await jupiter.computeRoutes({
          inputMint: new PublicKey(tokenInfo.address),
          outputMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mint
          amount: LAMPORTS_PER_SOL,
          slippageBps: 50,
        })
        if (route.routesInfos.length > 0) {
          prices[symbol] = parseFloat(route.routesInfos[0].outAmount) / LAMPORTS_PER_SOL
        }
      }
    }

    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching market prices:', error)
    return NextResponse.json({ error: 'Failed to fetch market prices' }, { status: 500 })
  }
}