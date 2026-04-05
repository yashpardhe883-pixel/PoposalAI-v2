import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-pill border px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#d4a843]/20 text-[#f0c96a] border-[#d4a843]/30',
        secondary:
          'border-transparent bg-white/5 text-muted-foreground border-white/10',
        outline: 'text-foreground border-white/15',
        teal: 'border-transparent bg-[#2dd4b0]/15 text-[#2dd4b0]',
        rust: 'border-transparent bg-[#e8673a]/15 text-[#e8673a]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
