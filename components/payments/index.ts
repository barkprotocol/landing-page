'use client'

import { PaymentForm } from './payment-form'
import { MiltonPaymentComponent } from './milton-payment'
import { TokenSelector } from '@/components/token-selector'
import { InvoiceForm } from './invoice-form'
import { TransactionConfirmation } from './transaction-confirmation'
import { PaymentInfoCard } from './payment-info-card'

export {
  PaymentForm,
  MiltonPaymentComponent,
  TokenSelector,
  InvoiceForm,
  TransactionConfirmation,
  PaymentInfoCard
}

// Re-export types
export type { PaymentFormProps } from './payment-form'
export type { MiltonPaymentComponentProps } from './milton-payment'
export type { TokenSelectorProps } from '@/components/token-selector'
export type { InvoiceFormProps } from './invoice-form'
export type { TransactionConfirmationProps } from './transaction-confirmation'
export type { PaymentInfoCardProps } from './payment-info-card'

// Shared types and constants
export const SUPPORTED_TOKENS = ['MILTON', 'BARK', 'SOL', 'USDC'] as const
export type SupportedToken = typeof SUPPORTED_TOKENS[number]

export interface SplToken {
  symbol: string
  name: string
  mint: string
  decimals: number
  icon?: string
}

export interface PaymentDetails {
  amount: number
  token: SupportedToken | SplToken
  recipient: string
  memo?: string
}

export interface TransactionResult {
  signature: string
  status: 'success' | 'error'
  message: string
}

// Utility functions
export function formatAmount(amount: number, token: SupportedToken | SplToken): string {
  if (typeof token === 'string') {
    switch (token) {
      case 'SOL':
        return `${amount.toFixed(9)} SOL`
      case 'USDC':
        return `${amount.toFixed(2)} USDC`
      case 'MILTON':
      case 'BARK':
        return `${amount.toFixed(6)} ${token}`
      default:
        return `${amount.toFixed(6)} ${token}`
    }
  } else {
    return `${amount.toFixed(token.decimals)} ${token.symbol}`
  }
}

export function getTokenDecimalPlaces(token: SupportedToken | SplToken): number {
  if (typeof token === 'string') {
    switch (token) {
      case 'SOL':
        return 9
      case 'USDC':
        return 2
      case 'MILTON':
      case 'BARK':
        return 6
      default:
        return 6
    }
  } else {
    return token.decimals
  }
}

export function validateAmount(amount: string, token: SupportedToken | SplToken): boolean {
  const decimalPlaces = getTokenDecimalPlaces(token)
  const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`)
  return regex.test(amount) && parseFloat(amount) > 0
}

export function getTokenIcon(token: SupportedToken | SplToken): string {
  if (typeof token === 'string') {
    switch (token) {
      case 'MILTON':
        return 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
      case 'BARK':
        return 'https://ucarecdn.com/8aa0180d-1112-4aea-8210-55b266c3fb44/bark.png'
      case 'SOL':
        return 'https://cryptologos.cc/logos/solana-sol-logo.png?v=024'
      case 'USDC':
        return 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024'
      default:
        return 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
    }
  } else {
    return token.icon || 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
  }
}

export function isSplToken(token: SupportedToken | SplToken): token is SplToken {
  return typeof token !== 'string' && 'mint' in token
}