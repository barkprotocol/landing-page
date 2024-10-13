import { NextResponse } from 'next/server'
import mailchimp from '@mailchimp/mailchimp_marketing'

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, // e.g., "us1"
})

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID!, {
      email_address: email,
      status: 'subscribed',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}