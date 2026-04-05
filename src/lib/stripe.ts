import { supabase } from './supabase'

export async function createCheckoutSession(body: {
  priceId: string
  userId: string
  plan: string
  billingCycle: string
  customerEmail?: string
}) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body,
  })
  if (error) throw new Error(error.message)
  const res = data as { url?: string; error?: string }
  if (res.error) throw new Error(res.error)
  if (!res.url) throw new Error('No checkout URL returned')
  window.location.href = res.url
}

export async function createBillingPortalSession() {
  const { data, error } = await supabase.functions.invoke(
    'create-billing-portal',
    { body: {} }
  )
  if (error) throw new Error(error.message)
  const res = data as { url?: string; error?: string }
  if (res.error) throw new Error(res.error)
  if (!res.url) throw new Error('No portal URL')
  window.location.href = res.url
}
