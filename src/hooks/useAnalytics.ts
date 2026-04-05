import { useMemo } from 'react'
import type { Database } from '@/types/database'

type ProposalRow = Database['public']['Tables']['proposals']['Row']

export type DateRangeKey = '30d' | '90d' | 'year' | 'all'

function inRange(created: string | null, key: DateRangeKey): boolean {
  if (!created || key === 'all') return true
  const d = new Date(created)
  const now = new Date()
  if (key === 'year') {
    return d.getFullYear() === now.getFullYear()
  }
  const days = key === '30d' ? 30 : 90
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return d >= cutoff
}

export function useAnalytics(
  proposals: ProposalRow[],
  range: DateRangeKey
) {
  return useMemo(() => {
    const filtered = proposals.filter((p) => inRange(p.created_at, range))
    const totalSent = filtered.filter((p) =>
      ['sent', 'viewed', 'signed', 'won', 'lost'].includes(p.status)
    ).length
    const won = filtered.filter((p) => p.status === 'won').length
    const lost = filtered.filter((p) => p.status === 'lost').length
    const decided = won + lost
    const winRate = decided ? Math.round((won / decided) * 100) : 0
    const scores = filtered
      .map((p) => p.score ?? 0)
      .filter((s) => s > 0)
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    const byMonth: Record<string, number> = {}
    const wonLostByMonth: Record<string, { won: number; lost: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const dt = new Date()
      dt.setMonth(dt.getMonth() - i)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      byMonth[key] = 0
      wonLostByMonth[key] = { won: 0, lost: 0 }
    }
    filtered.forEach((p) => {
      if (!p.created_at) return
      const d = new Date(p.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in byMonth && ['sent', 'viewed', 'signed', 'won', 'lost'].includes(p.status)) {
        byMonth[key] += 1
      }
      if (key in wonLostByMonth) {
        if (p.status === 'won') wonLostByMonth[key].won += 1
        if (p.status === 'lost') wonLostByMonth[key].lost += 1
      }
    })

    const statusCounts: Record<string, number> = {}
    filtered.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    })

    const scoreBuckets = [
      { name: '0-60', count: 0 },
      { name: '60-70', count: 0 },
      { name: '70-80', count: 0 },
      { name: '80-90', count: 0 },
      { name: '90-100', count: 0 },
    ]
    filtered.forEach((p) => {
      const s = p.score ?? 0
      if (s < 60) scoreBuckets[0].count += 1
      else if (s < 70) scoreBuckets[1].count += 1
      else if (s < 80) scoreBuckets[2].count += 1
      else if (s < 90) scoreBuckets[3].count += 1
      else scoreBuckets[4].count += 1
    })

    const projectTypes: Record<string, number> = {}
    filtered.forEach((p) => {
      const t = p.project_type || 'Other'
      projectTypes[t] = (projectTypes[t] || 0) + 1
    })
    const topProjectType = Object.entries(projectTypes).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0]

    const thisMonth = new Date()
    thisMonth.setDate(1)
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const countMonth = (start: Date, end: Date) =>
      filtered.filter((p) => {
        if (!p.created_at) return false
        const d = new Date(p.created_at)
        return d >= start && d < end
      }).length

    const endThis = new Date()
    const thisM = countMonth(thisMonth, endThis)
    const lastM = countMonth(lastMonth, thisMonth)
    const momChange =
      lastM === 0 ? (thisM > 0 ? 100 : 0) : Math.round(((thisM - lastM) / lastM) * 100)

    return {
      filtered,
      totalSent,
      winRate,
      avgScore,
      byMonth: Object.entries(byMonth).map(([name, sent]) => ({ name, sent })),
      wonLostByMonth: Object.entries(wonLostByMonth).map(([name, v]) => ({
        name,
        won: v.won,
        lost: v.lost,
      })),
      statusData: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
      scoreBuckets,
      topProjectType: topProjectType || '—',
      momChange,
      revenueWon: won * 2500,
    }
  }, [proposals, range])
}
