import { cn } from '@/lib/utils'

export function TrackingStatus({
  status,
  viewCount,
  lastViewedAt,
}: {
  status: string
  viewCount?: number | null
  lastViewedAt?: string | null
}) {
  const recentlyViewed = lastViewedAt
    ? Date.now() - new Date(lastViewedAt).getTime() < 5 * 60 * 1000
    : false

  return (
    <div className="flex items-center gap-2">
      {recentlyViewed && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2dd4b0] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2dd4b0]" />
        </span>
      )}
      <span
        className={cn(
          'text-xs font-mono capitalize',
          status === 'viewed' && 'text-[#2dd4b0]',
          status === 'sent' && 'text-[#d4a843]',
          status === 'draft' && 'text-muted-foreground'
        )}
      >
        {status}
        {viewCount != null && viewCount > 0 ? ` · ${viewCount} views` : ''}
      </span>
    </div>
  )
}
