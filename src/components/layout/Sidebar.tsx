import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Layers,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlanBadge } from '@/components/shared/PlanBadge'
import { useAuthStore } from '@/store/authStore'
import { usePlan } from '@/hooks/usePlan'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/proposals/new', label: 'New Proposal', icon: Sparkles, highlight: true },
  { to: '/dashboard#recent', label: 'My Proposals', icon: FileText },
  { to: '/templates', label: 'Templates', icon: Layers },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, lockFree: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const { canUseAnalytics } = usePlan()

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const base =
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors'

  return (
    <aside
      className={cn(
        'flex flex-col border-white/10 bg-[#111009]',
        mobile
          ? 'fixed bottom-0 left-0 right-0 z-40 border-t md:hidden flex-row justify-around py-2 px-1'
          : 'hidden md:flex w-[240px] shrink-0 border-r min-h-screen sticky top-0'
      )}
    >
      {!mobile && (
        <>
          <div className="p-4 border-b border-white/10">
            <Link to="/" className="font-fraunces text-xl">
              Proposal<span className="text-[#d4a843]">AI</span>
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={profile?.logo_url || undefined} />
                <AvatarFallback className="bg-[#d4a843]/20 text-[#d4a843] text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {profile?.full_name || 'User'}
                </p>
                <PlanBadge plan={profile?.plan} />
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {nav.map((item) => {
              const Icon = item.icon
              const isHash = item.to.includes('#')
              const pathOnly = isHash ? item.to.split('#')[0] : item.to
              const active =
                pathOnly !== '/dashboard'
                  ? location.pathname.startsWith(pathOnly)
                  : location.pathname === '/dashboard'
              const locked = item.lockFree && !canUseAnalytics
              return (
                <Link
                  key={item.label}
                  to={locked ? '/pricing' : item.to}
                  className={cn(
                    base,
                    active && 'bg-[#d4a843]/15 text-[#f0c96a]',
                    !active && 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                    item.highlight && !active && 'text-[#d4a843]'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {locked && (
                    <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                      Pro
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </>
      )}
      {mobile && (
        <>
          <Link
            to="/dashboard"
            className={cn(
              'flex flex-col items-center gap-0.5 p-2 text-[10px]',
              location.pathname === '/dashboard'
                ? 'text-[#d4a843]'
                : 'text-muted-foreground'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Home
          </Link>
          <Link
            to="/proposals/new"
            className="flex flex-col items-center gap-0.5 p-2 text-[10px] text-[#d4a843]"
          >
            <Sparkles className="h-5 w-5" />
            New
          </Link>
          <Link
            to="/templates"
            className={cn(
              'flex flex-col items-center gap-0.5 p-2 text-[10px]',
              location.pathname.startsWith('/templates')
                ? 'text-[#d4a843]'
                : 'text-muted-foreground'
            )}
          >
            <Layers className="h-5 w-5" />
            Templates
          </Link>
          <Link
            to={canUseAnalytics ? '/analytics' : '/pricing'}
            className={cn(
              'flex flex-col items-center gap-0.5 p-2 text-[10px]',
              location.pathname.startsWith('/analytics')
                ? 'text-[#d4a843]'
                : 'text-muted-foreground'
            )}
          >
            <BarChart3 className="h-5 w-5" />
            Stats
          </Link>
          <Link
            to="/settings"
            className={cn(
              'flex flex-col items-center gap-0.5 p-2 text-[10px]',
              location.pathname.startsWith('/settings')
                ? 'text-[#d4a843]'
                : 'text-muted-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </>
      )}
    </aside>
  )
}
