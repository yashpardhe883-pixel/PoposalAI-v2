import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-[#111009]/50 py-16 px-6 text-center">
      <div className="rounded-full bg-[#d4a843]/15 p-4 text-[#d4a843]">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="mt-4 font-fraunces text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {actionLabel && actionTo && (
        <Button className="mt-6" asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
