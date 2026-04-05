import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(`Webhook error: ${msg}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await supabase
      .from('profiles')
      .update({
        plan: (session.metadata?.plan as string) || 'pro',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      })
      .eq('id', session.metadata?.user_id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase
      .from('profiles')
      .update({
        plan: 'free',
        stripe_subscription_id: null,
      })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const priceId = sub.items.data[0]?.price.id
    const planMap: Record<string, string> = {
      [Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || '']: 'pro',
      [Deno.env.get('STRIPE_PRO_ANNUAL_PRICE_ID') || '']: 'pro',
      [Deno.env.get('STRIPE_AGENCY_MONTHLY_PRICE_ID') || '']: 'agency',
      [Deno.env.get('STRIPE_AGENCY_ANNUAL_PRICE_ID') || '']: 'agency',
    }
    const newPlan = planMap[priceId || ''] || 'free'
    await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('stripe_subscription_id', sub.id)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
