'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Link2, BarChart3, Settings, LogOut, ShieldCheck,
  Loader2, RefreshCw, Monitor, Smartphone, Tablet,
  CheckCircle2, XCircle, Globe, Clock,
} from 'lucide-react'
import { useAuth, authFetch } from '@/hooks/useAuth'

interface LoginLog {
  id: string
  ip: string
  country: string
  device: string
  browser: string
  os: string
  success: boolean
  failReason: string | null
  loggedAt: string
}

// ── helpers ───────────────────────────────────────────────────────────────────
function deviceIcon(d: string) {
  if (d === 'mobile') return <Smartphone className="w-4 h-4" />
  if (d === 'tablet') return <Tablet     className="w-4 h-4" />
  return <Monitor className="w-4 h-4" />
}

function failLabel(reason: string | null) {
  if (!reason) return null
  const map: Record<string, string> = {
    wrong_password:   'Wrong password',
    email_unverified: 'Email not verified',
    account_banned:   'Account banned',
  }
  return map[reason] ?? reason
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border/50 bg-sidebar/80 backdrop-blur p-4 fixed h-full">
      <Link href="/" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Link2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold">LinkNest</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {[
          { href: '/dashboard',           icon: Link2,       label: 'My Links' },
          { href: '/dashboard/analytics', icon: BarChart3,   label: 'Analytics' },
          { href: '/dashboard/settings',  icon: Settings,    label: 'Settings' },
          { href: '/dashboard/security',  icon: ShieldCheck, label: 'Security', active: true },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              item.active
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}>
            <item.icon className="w-4 h-4" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/50 pt-4 mt-4">
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-3.5 h-3.5" />Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function SecurityPage() {
  const router  = useRouter()
  const { token, logout } = useAuth()
  const [logs, setLogs]       = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'all' | 'success' | 'failed'>('all')

  const handleLogout = () => { logout(); router.push('/login') }

  useEffect(() => {
    if (!token) { router.replace('/login'); return }
    fetchLogs()
  }, [token, router])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await authFetch('/api/account')
      if (res.ok) setLogs(await res.json())
    } finally { setLoading(false) }
  }

  const filtered = logs.filter(l =>
    filter === 'all'     ? true :
    filter === 'success' ? l.success :
    !l.success
  )

  const successCount = logs.filter(l =>  l.success).length
  const failCount    = logs.filter(l => !l.success).length

  if (!token) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.12)_0%,_transparent_50%)]" />
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader onRefresh={fetchLogs} />
        <SummaryCards total={logs.length} success={successCount} failed={failCount} />
        <LogsSection
          logs={filtered}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          total={logs.length}
        />
      </main>
    </div>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────
function PageHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" /> Security
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor login activity and protect your account
        </p>
      </div>
      <button onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-all flex-shrink-0">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  )
}

function SummaryCards({ total, success, failed }: { total: number; success: number; failed: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5">
        <Clock className="w-5 h-5 text-muted-foreground mb-3" />
        <p className="text-2xl font-bold">{total}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Total Logins (last 50)</p>
      </div>
      <div className="bg-card/60 backdrop-blur border border-green-500/20 rounded-2xl p-5">
        <CheckCircle2 className="w-5 h-5 text-green-400 mb-3" />
        <p className="text-2xl font-bold text-green-400">{success}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Successful</p>
      </div>
      <div className="bg-card/60 backdrop-blur border border-red-500/20 rounded-2xl p-5">
        <XCircle className="w-5 h-5 text-red-400 mb-3" />
        <p className="text-2xl font-bold text-red-400">{failed}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Failed Attempts</p>
      </div>
    </div>
  )
}

function LogsSection({ logs, loading, filter, setFilter, total }: {
  logs: LoginLog[]
  loading: boolean
  filter: 'all' | 'success' | 'failed'
  setFilter: (f: 'all' | 'success' | 'failed') => void
  total: number
}) {
  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl overflow-hidden">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-4 border-b border-border/50">
        <div className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1">
          {(['all', 'success', 'failed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {f === 'all' ? `All (${total})` : f === 'success' ? '✅ Success' : '❌ Failed'}
            </button>
          ))}
        </div>
      </div>

      {/* Log rows */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No login activity yet.</div>
      ) : (
        <div className="divide-y divide-border/30">
          {logs.map(log => <LogRow key={log.id} log={log} />)}
        </div>
      )}
    </div>
  )
}

function LogRow({ log }: { log: LoginLog }) {
  const fail = failLabel(log.failReason)
  return (
    <div className={`flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors ${!log.success ? 'bg-red-500/3' : ''}`}>
      {/* Status icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
      }`}>
        {log.success
          ? <CheckCircle2 className="w-4.5 h-4.5" />
          : <XCircle      className="w-4.5 h-4.5" />
        }
      </div>

      {/* Device + browser */}
      <div className="flex items-center gap-2 w-36 flex-shrink-0">
        <span className="text-muted-foreground">{deviceIcon(log.device)}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{log.browser}</p>
          <p className="text-xs text-muted-foreground truncate">{log.os}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm truncate">{log.country === 'unknown' ? 'Unknown location' : log.country}</p>
          <p className="text-xs text-muted-foreground font-mono truncate">{log.ip}</p>
        </div>
      </div>

      {/* Fail reason badge */}
      {fail && (
        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex-shrink-0">
          {fail}
        </span>
      )}

      {/* Time */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground">{timeAgo(log.loggedAt)}</p>
        <p className="text-xs text-muted-foreground/50">
          {new Date(log.loggedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
