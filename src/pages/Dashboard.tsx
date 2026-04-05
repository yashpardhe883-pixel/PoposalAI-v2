import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Link2, Trash2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProposals } from '@/hooks/useProposals'
import { usePlan } from '@/hooks/usePlan'
import { useProposalRealtime } from '@/hooks/useRealtime'
import { formatDate, greetingName } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowSkeleton } from '@/components/shared/LoadingSkeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TrackingStatus } from '@/components/features/TrackingStatus'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database'

type Row = Database['public']['Tables']['proposals']['Row']

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { proposals, loading, refresh } = useProposals()
  const { isFree, proposalsRemaining } = usePlan()
  useProposalRealtime()

  const used = profile?.proposals_used_this_month ?? 0
  const cap = 5
  const pct = Math.min(100, (used / cap) * 100)

  const sent = proposals.filter((p) =>
    ['sent', 'viewed', 'signed', 'won', 'lost'].includes(p.status)
  ).length
  const won = proposals.filter((p) => p.status === 'won').length
  const lost = proposals.filter((p) => p.status === 'lost').length
  const winRate = won + lost ? Math.round((won / (won + lost)) * 100) : 0
  const scores = proposals.map((p) => p.score || 0).filter((s) => s > 0)
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  useEffect(() => {
    if (window.location.hash === '#recent') {
      document.getElementById('recent-proposals')?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [])

  const copyShare = async (p: Row) => {
    const url = `${window.location.origin}/p/${p.share_token}`
    await navigator.clipboard.writeText(url)
    toast({ title: 'Share link copied' })
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('proposals').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Proposal deleted' })
    void refresh()
  }

  const statusVariant = (s: string) => {
    const m: Record<string, 'default' | 'secondary' | 'outline' | 'teal' | 'rust'> = {
      draft: 'secondary',
      sent: 'outline',
      viewed: 'teal',
      signed: 'default',
      won: 'teal',
      lost: 'rust',
    }
    return m[s] || 'secondary'
  }

  const scoreClass = (s: number) =>
    s < 60 ? 'text-[#e8673a]' : s < 80 ? 'text-[#d4a843]' : 'text-[#2dd4b0]'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fraunces text-3xl sm:text-4xl">
          {greetingName(profile?.full_name)} <span className="text-[#d4a843]">✦</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          {formatDate(new Date())}
        </p>
      </div>

      {isFree && (
        <Card className="border-[#d4a843]/30 bg-[#d4a843]/5">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold text-[#d4a843]">{used}</span> of{' '}
                {cap} proposals used this month ·{' '}
                <Link to="/pricing" className="text-[#d4a843] underline">
                  Upgrade for unlimited →
                </Link>
              </p>
              <Progress value={pct} className="mt-2 h-2" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {proposalsRemaining} remaining
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'This Month', value: String(proposals.length) },
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Total Sent', value: String(sent) },
          { label: 'Avg Score', value: avgScore ? `${avgScore}` : '—' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <p className="text-xs font-mono text-muted-foreground uppercase">
                {m.label}
              </p>
              <p className="mt-2 font-fraunces text-3xl">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#d4a843]/40 bg-gradient-to-br from-[#d4a843]/25 to-transparent overflow-hidden">
        <CardContent className="py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-fraunces text-2xl text-[#0a0908] flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Create New Proposal
            </h2>
            <p className="text-sm text-[#0a0908]/70 mt-1">
              Takes less than 3 minutes
            </p>
          </div>
          <Button
            className="bg-[#0a0908] text-[#d4a843] hover:bg-[#0a0908]/90 shrink-0"
            asChild
          >
            <Link to="/proposals/new">✦ Start</Link>
          </Button>
        </CardContent>
      </Card>

      <div id="recent-proposals">
        <h2 className="font-fraunces text-xl mb-4">Recent Proposals</h2>
        {loading ? (
          <div className="rounded-lg border border-white/10 p-4">
            <TableRowSkeleton cols={6} />
            <TableRowSkeleton cols={6} />
          </div>
        ) : proposals.length === 0 ? (
          <EmptyState
            title="✦ No proposals yet"
            description="Create your first AI-powered proposal in minutes."
            actionLabel="Create proposal"
            actionTo="/proposals/new"
          />
        ) : (
          <div className="rounded-lg border border-white/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      <Link
                        to={`/proposals/${p.id}`}
                        className="hover:text-[#d4a843]"
                      >
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{p.client_name}</span>
                        <TrackingStatus
                          status={p.status}
                          viewCount={p.view_count}
                          lastViewedAt={p.last_viewed_at}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(p.status)} className="capitalize">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-mono text-sm',
                          scoreClass(p.score || 0)
                        )}
                      >
                        {p.score ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/proposals/${p.id}`} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Share"
                          onClick={() => void copyShare(p)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Delete proposal?"
                          description="This cannot be undone."
                          confirmLabel="Delete"
                          destructive
                          onConfirm={() => remove(p.id)}
                        >
                          <Button variant="ghost" size="icon" aria-label="Delete">
                            <Trash2 className="h-4 w-4 text-[#e8673a]" />
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
