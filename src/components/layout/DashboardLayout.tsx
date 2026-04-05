import { Outlet, useMatch } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  const detail = useMatch({ path: '/proposals/:id', end: true })
  const id = detail?.params.id
  const fullBleed = Boolean(id) && id !== 'new'

  return (
    <div className="min-h-screen bg-[#0a0908] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        <div
          className={cn(
            'mx-auto w-full',
            fullBleed ? 'h-[calc(100vh-0px)]' : 'max-w-7xl px-4 sm:px-6 py-6'
          )}
        >
          <Outlet />
        </div>
      </main>
      <Sidebar mobile />
    </div>
  )
}
