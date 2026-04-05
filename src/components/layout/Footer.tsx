import { Link } from 'react-router-dom'
import { Github, Linkedin, Twitter } from 'lucide-react'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Templates', href: '/templates' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/' },
      { label: 'Blog', href: '/' },
      { label: 'Careers', href: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/' },
      { label: 'Terms', href: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/' },
      { label: 'Contact', href: '/' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#111009] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link to="/" className="font-fraunces text-2xl">
              Proposal<span className="text-[#d4a843]">AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              AI-powered proposals that close faster — built for freelancers and
              teams.
            </p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <Twitter className="h-5 w-5 cursor-pointer hover:text-[#d4a843]" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-[#d4a843]" />
              <Github className="h-5 w-5 cursor-pointer hover:text-[#d4a843]" />
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#d4a843]/80">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ProposalAI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
