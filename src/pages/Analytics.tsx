import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useProposals } from '@/hooks/useProposals'
import { usePlan } from '@/hooks/usePlan'
import type { DateRangeKey } from '@/hooks/useAnalytics'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const COLORS = ['#d4a843', '#2dd4b0', '#e8673a', '#8884d8', '#82ca9d']

export default function Analytics() {
  const { proposals, loading } = useProposals()
  const { isFree } = usePlan()
  const [range, setRange] = useState<DateRangeKey>('30d')
  const a = useAnalytics(proposals, range)

  const ranges: { key: DateRangeKey; label: string }[] = [
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
    { key: 'year', label: 'This year' },
    { key: 'all', label: 'All time' },
  ]

  const topByScore = [...a.filtered]
    .filter((p) => (p.score || 0) > 0)
    .sort((x, y) => (y.score || 0) - (x.score || 0))
    .slice(0, 8)

  const recentViewed = [...a.filtered]
    .filter((p) => p.last_viewed_at)
    .sort(
      (x, y) =>
        new Date(y.last_viewed_at!).getTime() -
        new Date(x.last_viewed_at!).getTime()
    )
    .slice(0, 8)

  return (
    <div className="relative space-y-8">
      {isFree && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-[#0a0908]/80 backdrop-blur-sm p-8 text-center">
          <h2 className="font-fraunces text-2xl text-[#d4a843]">
            Unlock Analytics
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Win rates, score trends, and pipeline insights are included on Pro
            and Agency.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      )}
      <div
        className={cn('space-y-8', isFree && 'blur-sm pointer-events-none')}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-fraunces text-3xl">Analytics</h1>
          <div className="flex flex-wrap gap-2">
            {ranges.map((r) => (
              <Button
                key={r.key}
                variant={range === r.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground font-mono text-sm">Loading…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Total Sent', value: a.totalSent },
                { label: 'Win Rate', value: `${a.winRate}%` },
                { label: 'Revenue Won (est.)', value: `$${a.revenueWon.toLocaleString()}` },
                { label: 'Avg Score', value: a.avgScore || '—' },
                {
                  label: 'MoM proposals',
                  value: `${a.momChange > 0 ? '+' : ''}${a.momChange}%`,
                },
                { label: 'Top Project Type', value: a.topProjectType },
              ].map((m) => (
                <Card key={m.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground uppercase">
                      {m.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-fraunces text-2xl">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces text-lg">
                    Proposals sent / month
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={a.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          background: '#161410',
                          border: '1px solid #ffffff20',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sent"
                        stroke="#d4a843"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces text-lg">
                    Won vs Lost
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={a.wonLostByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          background: '#161410',
                          border: '1px solid #ffffff20',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="won" fill="#2dd4b0" />
                      <Bar dataKey="lost" fill="#e8673a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces text-lg">
                    Status mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={a.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {a.statusData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#161410',
                          border: '1px solid #ffffff20',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces text-lg">
                    Score buckets
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={a.scoreBuckets}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          background: '#161410',
                          border: '1px solid #ffffff20',
                        }}
                      />
                      <Bar dataKey="count" fill="#d4a843" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces">Top Proposals</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topByScore.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.client_name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {p.project_type}
                          </TableCell>
                          <TableCell className="font-mono">{p.score}</TableCell>
                          <TableCell className="capitalize text-xs">
                            {p.status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-fraunces">
                    Recently Viewed
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proposal</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Last</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentViewed.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="max-w-[140px] truncate">
                            {p.title}
                          </TableCell>
                          <TableCell>{p.view_count}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {p.last_viewed_at
                              ? new Date(p.last_viewed_at).toLocaleString()
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/proposals/${p.id}`}
                              className="text-[#d4a843] text-xs"
                            >
                              Open
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
