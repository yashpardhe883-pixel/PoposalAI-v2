import { Badge } from '@/components/ui/badge'
import type { Plan } from '@/types/user'

export function PlanBadge({ plan }: { plan?: string | null }) {
  const p = (plan || 'free') as Plan
  const variant =
    p === 'agency' ? 'teal' : p === 'pro' ? 'default' : 'secondary'
  return (
    <Badge variant={variant} className="capitalize">
      {p}
    </Badge>
  )
}
