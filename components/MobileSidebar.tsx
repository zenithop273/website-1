'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Link2, BarChart3, Settings, ShieldCheck, LogOut, Globe, BadgeCheck } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface User { name: string; username: string; emailVerified?: boolean }

interface MobileSidebarProps {
  user: User
  onLogout: () => void
}

const NAV = [
  { href: '/dashboard',            icon: Link2,       label: 'My Links' },
  { href: '/dashboard/analytics',  icon: BarChart3,   label: 'Analytics' },
  { href: '/dashboard/settings',   icon: Settings,    label: 'Settings' },
  { href: '/dashboard/security',   icon: ShieldCheck, label: 'Security' },
]

export function MobileSidebar({ user, onLogout }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger button — only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border/60 flex flex-col p-5 transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">LinkNest</span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-border/50 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                {user.emailVerified && <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>

          <Link href={`/${user.username}`} target="_blank" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
            <Globe className="w-3.5 h-3.5" /> View Public Profile
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">Toggle theme</span>
          </div>

          <button onClick={() => { onLogout(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
