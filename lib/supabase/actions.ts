'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateEmail, validatePassword } from '@/lib/utils'

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string

  if (!validateEmail(email)) {
    return { error: 'Invalid email address' }
  }

  if (!validatePassword(password)) {
    return { error: 'Invalid password' }
  }

  const supabase = createClient(cookies())

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect(redirectTo || '/')
}

export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirect') as string
  const priceId = formData.get('priceId') as string
  const inviteId = formData.get('inviteId') as string

  if (!validateEmail(email)) {
    return { error: 'Invalid email address' }
  }

  if (!validatePassword(password)) {
    return { error: 'Password must be at least 8 characters long' }
  }

  const supabase = createClient(cookies())

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Here you might want to create a user profile, handle invite, etc.
  // For example:
  // await createUserProfile(email, priceId, inviteId)

  return { success: 'Check your email to confirm your account' }
}

export async function signOut() {
  const supabase = createClient(cookies())
  await supabase.auth.signOut()
  redirect('/sign-in')
}

export async function createUserProfile(email: string, priceId: string, inviteId: string) {
  const supabase = createClient(cookies())

  // Implement user profile creation logic here
  // This is just a placeholder implementation
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { email, price_id: priceId, invite_id: inviteId }
    ])

  if (error) {
    console.error('Error creating user profile:', error)
    return { error: 'Failed to create user profile' }
  }

  return { success: 'User profile created successfully' }
}