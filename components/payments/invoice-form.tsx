'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TokenSelector } from '@/components/token-selector'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Plus, Trash } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
})

const invoiceSchema = z.object({
  recipient: z.string().min(32, 'Invalid Solana address').max(44, 'Invalid Solana address'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  onInvoiceCreated: (invoiceData: InvoiceFormData) => void
}

export function InvoiceForm({ onInvoiceCreated }: InvoiceFormProps) {
  const [selectedToken, setSelectedToken] = useState('MILTON')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { connected } = useWallet()

  const { register, control, handleSubmit, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: '', amount: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const onSubmit = async (data: InvoiceFormData) => {
    if (!connected) {
      setError('Please connect your wallet to create an invoice')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Here you would typically send the invoice data to your backend
      // For demonstration purposes, we'll just simulate a successful creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      onInvoiceCreated({ ...data, items: data.items.map(item => ({ ...item, amount: parseFloat(item.amount) })) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>Generate an invoice for payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              {...register('recipient')}
              placeholder="Solana address"
            />
            {errors.recipient && (
              <p className="text-red-500 text-sm">{errors.recipient.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Invoice Items</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Item description"
                  className="flex-grow"
                />
                <Input
                  {...register(`items.${index}.amount`)}
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  className="w-24"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {errors.items && (
              <p className="text-red-500 text-sm">{errors.items.message}</p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', amount: '' })}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes for the invoice"
            />
          </div>
          <div className="space-y-2">
            <Label>Token</Label>
            <TokenSelector onSelect={setSelectedToken} />
          </div>
          {!connected ? (
            <WalletMultiButton className="w-full" />
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          )}
        </form>
      </CardContent>
      <CardFooter>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}