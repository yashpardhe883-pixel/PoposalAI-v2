# ProposalAI — Setup Guide

ProposalAI is an AI-powered proposal generator for freelancers, agencies, and companies. The stack is **React 18 + Vite + TypeScript** on the frontend and **Supabase** (Postgres, Auth, Storage, Realtime, Edge Functions) on the backend. **Google Gemini** runs only inside Edge Functions — never in the browser.

## What You Need (all free accounts)

- Node.js 18+ — [nodejs.org](https://nodejs.org)
- Supabase account — [supabase.com](https://supabase.com)
- Google AI Studio account — [aistudio.google.com](https://aistudio.google.com) (for Gemini API key)
- Stripe account — [stripe.com](https://stripe.com)
- Resend account — [resend.com](https://resend.com)
- Google Cloud account — [console.cloud.google.com](https://console.cloud.google.com) (for OAuth)

## Step 1: Clone & Install

```bash
git clone [your-repo-url]
cd proposalai
npm install
```

## Step 2: Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_storage_logos.sql` (creates public `logos` bucket + RLS)
3. **Authentication → Providers → Google**: enable Google and add Client ID + Secret.
4. Copy **Project URL** and **anon key** into `.env` (see `.env.example`).

### Google OAuth (Supabase)

In **Authentication → URL Configuration**, set **Site URL** to your app origin (e.g. `http://localhost:5173` or your Vercel URL).

**Google Cloud Console**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create **OAuth 2.0 Client ID** → Application type: **Web application**.
3. **Authorized redirect URIs** must include:

   `https://<your-project-ref>.supabase.co/auth/v1/callback`

4. Paste **Client ID** and **Client Secret** into Supabase → Auth → Providers → Google.

The app uses:

```ts
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/auth/callback' },
})
```

The `/auth/callback` route ensures a `profiles` row exists, then sends the user to `/dashboard`.

### Realtime (proposal view toasts)

In Supabase **Database → Replication**, enable **Realtime** for the `proposals` table so owners get live updates when `view_count` changes.

## Step 3: Gemini API Key (FREE)

1. Go to [aistudio.google.com](https://aistudio.google.com).
2. Click **Get API Key** → create a key (no credit card on free tier).
3. Add it to Edge Function secrets as `GEMINI_API_KEY` (Step 8).

## Step 4: Google OAuth Setup

See **Step 2** above — redirect URI must be the Supabase callback URL.

## Step 5: Stripe Setup

1. Create products/prices in Stripe Dashboard:
   - Pro Monthly ($19/mo)
   - Pro Annual ($171/yr)
   - Agency Monthly ($69/mo)
   - Agency Annual ($621/yr)
2. Copy each **Price ID** (`price_...`) for Step 7–8.
3. Add **Price IDs** to frontend `.env` as `VITE_STRIPE_*` variables (see `.env.example`) so Checkout buttons work.

## Step 6: Resend Setup

1. Sign up at [resend.com](https://resend.com).
2. Verify your domain (or use a Resend test domain during development).
3. Create an API key → store as `RESEND_API_KEY` in Edge secrets.
4. Update `from` address in `supabase/functions/send-email/index.ts` to your verified domain.

## Step 7: Environment Variables

```bash
cp .env.example .env
```

Fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- Optional: `VITE_STRIPE_PRO_MONTHLY_PRICE_ID`, etc.

## Step 8: Deploy Edge Functions & Set Secrets

Install Supabase CLI: `npm install -g supabase`

```bash
supabase login
supabase link --project-ref your-project-ref
```

Deploy functions:

```bash
supabase functions deploy generate-proposal
supabase functions deploy generate-followup
supabase functions deploy improve-proposal
supabase functions deploy handle-stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy create-billing-portal
supabase functions deploy send-email
```

Set secrets (server-only — never commit these):

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
supabase secrets set STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
supabase secrets set STRIPE_AGENCY_MONTHLY_PRICE_ID=price_xxx
supabase secrets set STRIPE_AGENCY_ANNUAL_PRICE_ID=price_xxx
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set APP_URL=https://your-domain.vercel.app
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`create-billing-portal` also needs `SUPABASE_ANON_KEY` in secrets (or rely on auto-provided vars in hosted Supabase — if deploy fails, add it explicitly).

## Step 9: Stripe Webhook

Stripe Dashboard → **Webhooks** → Add endpoint:

`https://<project-ref>.supabase.co/functions/v1/handle-stripe-webhook`

Events:

- `checkout.session.completed`
- `customer.subscription.deleted`
- `customer.subscription.updated`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Step 10: Build & Deploy to Vercel

```bash
npm run build
```

Deploy on [vercel.com](https://vercel.com) or:

```bash
npx vercel --prod
```

`vercel.json` includes SPA rewrites to `index.html`.

## Step 11: Test Everything

- Google sign-in redirects to `/auth/callback` then `/dashboard`
- Email signup creates a profile (DB trigger)
- Smart Mode generates a proposal (Gemini via Edge Function)
- Editor auto-saves (30s debounce) and manual Save
- PDF export downloads
- Share link `/p/:token` works without login
- Client can sign on the public page
- Owner sees Realtime toast when `view_count` increases (with Realtime enabled)
- Free plan blocks after 5 proposals (upgrade modal)
- Stripe checkout + webhook updates `profiles.plan`
- **Settings → Billing** opens Stripe Customer Portal (`create-billing-portal`)

## Cost Summary

- Supabase: free tier limits
- Gemini: free tier (rate limits apply)
- Vercel: hobby tier
- Resend: free tier
- Stripe: no monthly fee; per-transaction fees when charging customers

---

Built with **Fraunces**, **Outfit**, and **JetBrains Mono**; UI uses **Tailwind** + **shadcn-style** primitives.
