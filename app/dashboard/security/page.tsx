'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Link2, BarChart3, Settings, LogOut, ShieldCheck,
  Loader2, RefreshCw, Monitor, Smartphone, Tablet,
  CheckCircle2, XCircle, Globe, Clock, KeyRound, Eye, EyeOff,
} from 'lucide-react'
import { useAuth, authFetch } from '@/hooks/useAuth'
import { useToastNotify } from '@/components/Toast'
import { PasswordStrength } from '@/components/PasswordStrength'

interface LoginLog {
  id: string; ip: string; country: string; device: string; browser: string
  os: string; success: boolean; failReason: string | null; loggedAt: string
}

function deviceIcon(d: string) {
  if (d === 'mobile') return <Smartphone className="w-4 h-4" />
  if (d === 'tablet') return <Tablet className="w-4 h-4" />
  return <Monitor className="w-4 h-4" />
}

function failLabel(r: string | null) {
  const map: Record<string, string> = { wrong_password: 'Wrong password', email_unverified: 'Email not verified', account_banned: 'Account banned' }
  return r ? (map[r] ?? r) : null
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`
}

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
          { href: '/dashboard', icon: Link2, label: 'My Links' },
          { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          { href: '/dashboard/security', icon: ShieldCheck, label: 'Security', active: true },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${(item as {active?: boolean}).active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
            <item.icon className="w-4 h-4" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/50 pt-4 mt-4">
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-3.5 h-3.5" />Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function SecurityPage() {
  const router = useRouter()
  const { token, logout } = useAuth()
  const { success, error: toastError } = useToastNotify()
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [cpForm, setCpForm] = useState({ current: '', next: '', confirm: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [cpLoading, setCpLoading] = useState(false)

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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (cpForm.next !== cpForm.confirm) { toastError('Passwords do not match'); return }
    setCpLoading(true)
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: cpForm.current, newPassword: cpForm.next }),
      })
      const data = await res.json()
      if (!res.ok) { toastError(data.error || 'Failed'); return }
      success('Password changed successfully!')
      setCpForm({ current: '', next: '', confirm: '' })
    } catch { toastError('Network error') }
    finally { setCpLoading(false) }
  }

  const filtered = logs.filter(l => filter === 'all' ? true : filter === 'success' ? l.success : !l.success)

  if (!token) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.12)_0%,_transparent_50%)]" />
      </div>
      <Sidebar onLogout={handleLogout} />
      <main className="md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Security</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your password and monitor login activity</p>
          </div>
          <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-all flex-shrink-0">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Change Password */}
        <section className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4 text-sm"><KeyRound className="w-4 h-4 text-primary" /> Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={cpForm.current}
                  onChange={e => setCpForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password" required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNext ? 'text' : 'password'} value={cpForm.next}
                  onChange={e => setCpForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="Min. 6 characters" required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary/60 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                <button type="button" onClick={() => setShowNext(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={cpForm.next} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input type="password" value={cpForm.confirm}
                onChange={e => setCpForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter new password" required
                className={`w-full px-4 py-3 rounded-xl bg-secondary/60 border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${cpForm.confirm && cpForm.next !== cpForm.confirm ? 'border-destructive/60' : 'border-border/60'}`} />
              {cpForm.confirm && cpForm.next !== cpForm.confirm && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
            </div>
            <button type="submit" disabled={cpLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
              {cpLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Changing…</> : <><KeyRound className="w-4 h-4" />Change Password</>}
            </button>
          </form>
        </section>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Clock className="w-5 h-5 text-muted-foreground" />, val: logs.length, label: 'Total Logins (last 50)', cls: '' },
            { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, val: logs.filter(l => l.success).length, label: 'Successful', cls: 'text-green-400' },
            { icon: <XCircle className="w-5 h-5 text-red-400" />, val: logs.filter(l => !l.success).length, label: 'Failed Attempts', cls: 'text-red-400' },
          ].map((c, i) => (
            <div key={i} className={`bg-card/60 backdrop-blur border ${i === 1 ? 'border-green-500/20' : i === 2 ? 'border-red-500/20' : 'border-border/60'} rounded-2xl p-5`}>
              {c.icon}
              <p className={`text-2xl font-bold mt-3 ${c.cls}`}>{c.val}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 p-4 border-b border-border/50">
            <div className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1">
              {(['all', 'success', 'failed'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {f === 'all' ? `All (${logs.length})` : f === 'success' ? '✅ Success' : '❌ Failed'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No login activity yet.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map(log => {
                const fail = failLabel(log.failReason)
                return (
                  <div key={log.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${log.success ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                      {log.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex items-center gap-2 w-36 flex-shrink-0">
                      <span className="text-muted-foreground">{deviceIcon(log.device)}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{log.browser}</p>
                        <p className="text-xs text-muted-foreground truncate">{log.os}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{log.country === 'unknown' ? 'Unknown location' : log.country}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{log.ip}</p>
                      </div>
                    </div>
                    {fail && <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex-shrink-0">{fail}</span>}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{timeAgo(log.loggedAt)}</p>
                      <p className="text-xs text-muted-foreground/50">{new Date(log.loggedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
