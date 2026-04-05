import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/lib/stripe'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/hooks/use-toast'

const proMonthly = import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID as
  | string
  | undefined

export function UpgradeModal({
  open,
  onOpenChange,
  featureName,
  description,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  featureName: string
  description?: string
}) {
  const user = useAuthStore((s) => s.user)

  const upgrade = async () => {
    if (!user?.id) return
    if (!proMonthly) {
      toast({
        title: 'Stripe not configured',
        description:
          'Add VITE_STRIPE_PRO_MONTHLY_PRICE_ID to your .env and deploy create-checkout.',
        variant: 'destructive',
      })
      return
    }
    try {
      await createCheckoutSession({
        priceId: proMonthly,
        userId: user.id,
        plan: 'pro',
        billingCycle: 'monthly',
        customerEmail: user.email ?? undefined,
      })
    } catch (e) {
      toast({
        title: 'Checkout failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-fraunces">
            Unlock {featureName}
          </DialogTitle>
          <DialogDescription>
            {description ||
              'Upgrade to Pro for unlimited proposals, analytics, branding, and more.'}
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full" onClick={() => void upgrade()}>
          Upgrade to Pro — $19/mo
        </Button>
      </DialogContent>
    </Dialog>
  )
}
