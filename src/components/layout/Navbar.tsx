import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled &&
          'bg-[#0a0908]/85 backdrop-blur-[20px] border-white/10'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-fraunces text-xl sm:text-2xl text-[#e8e0d0]">
          Proposal<span className="text-[#d4a843]">AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[rgba(232,224,208,0.7)]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-[#d4a843] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" className="rounded-pill px-4" asChild>
            <Link to="/signup">Start Free →</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
