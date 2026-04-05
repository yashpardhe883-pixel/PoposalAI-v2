import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/types/database'
import { cn } from '@/lib/utils'

type Row = Database['public']['Tables']['proposals']['Row']

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'outline' | 'teal' | 'rust'
> = {
  draft: 'secondary',
  sent: 'outline',
  viewed: 'teal',
  signed: 'default',
  won: 'teal',
  lost: 'rust',
}

export function ProposalCard({ proposal }: { proposal: Row }) {
  const s = proposal.score ?? 0
  const scoreClass =
    s < 60 ? 'text-[#e8673a]' : s < 80 ? 'text-[#d4a843]' : 'text-[#2dd4b0]'

  return (
    <Link to={`/proposals/${proposal.id}`}>
      <Card className="hover:border-[#d4a843]/40 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-fraunces text-lg leading-tight line-clamp-2">
              {proposal.title}
            </h3>
            <Badge
              variant={statusVariant[proposal.status] || 'secondary'}
              className="shrink-0 capitalize"
            >
              {proposal.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{proposal.client_name}</p>
        </CardHeader>
        <CardContent>
          <p className={cn('font-mono text-sm', scoreClass)}>
            Score: {proposal.score ?? '—'}/100
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
