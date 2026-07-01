'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, authFetch } from '@/hooks/useAuth'
import { Link2, BarChart3, Settings, LogOut, Loader2, MousePointer, Users, TrendingUp, Globe, Eye, Smartphone, Monitor, Tablet, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────
interface LinkStat  { id: string; title: string; clicks: number; url: string }
interface DailyPoint { date: string; count: number }
interface BreakdownPoint { device?: string; country?: string; count: number }

interface AnalyticsData {
  totalClicks: number
  totalVisitors: number
  profileViews: number
  mostClickedLink: { title: string; clicks: number; url: string } | null
  dailyAnalytics: DailyPoint[]
  deviceBreakdown: BreakdownPoint[]
  countryBreakdown: BreakdownPoint[]
  links: LinkStat[]
}

// ── Colour palettes ────────────────────────────────────────────────────────────
const DEVICE_COLORS: Record<string, string> = {
  mobile:  '#6366f1',
  desktop: '#8b5cf6',
  tablet:  '#06b6d4',
  unknown: '#64748b',
}
const GEO_PALETTE = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#a78bfa','#34d399','#fbbf24']

// ── Small helpers ──────────────────────────────────────────────────────────────
function deviceIcon(d: string) {
  if (d === 'mobile')  return <Smartphone className="w-3.5 h-3.5" />
  if (d === 'tablet')  return <Tablet     className="w-3.5 h-3.5" />
  return <Monitor className="w-3.5 h-3.5" />
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5 flex items-start gap-4">
      <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ onLogout, userName }: { onLogout: () => void; userName: string }) {
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
          { href: '/dashboard',            icon: Link2,    label: 'My Links' },
          { href: '/dashboard/analytics',  icon: BarChart3,label: 'Analytics', active: true },
          { href: '/dashboard/settings',   icon: Settings, label: 'Settings' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              item.active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}>
            <item.icon className="w-4 h-4" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border/50 pt-4 mt-4 space-y-1">
        <p className="text-xs text-muted-foreground px-3 truncate">{userName}</p>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-3.5 h-3.5" />Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── Custom Pie label ───────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
}) {
  if (percent < 0.05) return null
  const R = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + R * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + R * Math.sin(-midAngle * Math.PI / 180)
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter()
  const { user, token, logout } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { router.replace('/login'); return }
    authFetch('/api/analytics')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [token, router])

  const handleLogout = () => { logout(); router.push('/login') }

  const exportCSV = () => {
    if (!data) return
    const rows: string[][] = [
      ['Report', 'LinkNest Analytics Export'],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['SUMMARY'],
      ['Total Clicks', String(data.totalClicks)],
      ['Total Visitors', String(data.totalVisitors)],
      ['Profile Views', String(data.profileViews)],
      [''],
      ['LINKS PERFORMANCE'],
      ['Title', 'URL', 'Clicks'],
      ...[...data.links].sort((a, b) => b.clicks - a.clicks)
        .map(l => [l.title, l.url, String(l.clicks)]),
      [''],
      ['DAILY CLICKS (Last 7 Days)'],
      ['Date', 'Clicks'],
      ...data.dailyAnalytics.map(d => [d.date, String(d.count)]),
      [''],
      ['DEVICE BREAKDOWN'],
      ['Device', 'Count'],
      ...data.deviceBreakdown.map(d => [d.device ?? 'unknown', String(d.count)]),
      [''],
      ['COUNTRY BREAKDOWN'],
      ['Country', 'Count'],
      ...data.countryBreakdown.map(d => [d.country ?? 'unknown', String(d.count)]),
    ]
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linknest-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!token) return null

  const devicePieData = (data?.deviceBreakdown ?? []).map(d => ({
    name: d.device ?? 'unknown',
    value: Number(d.count),
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.12)_0%,_transparent_50%)]" />
      </div>

      <Sidebar onLogout={handleLogout} userName={user?.email ?? ''} />

      <main className="md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your profile performance and link clicks</p>
          </div>
          {data && (
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary/50 transition-all flex-shrink-0">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground py-20 justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading analytics…
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}

        {data && <AnalyticsContent data={data} devicePieData={devicePieData} />}
      </main>
    </div>
  )
}

// ── Analytics Content (split out to keep main clean) ──────────────────────────
function AnalyticsContent({ data, devicePieData }: {
  data: AnalyticsData
  devicePieData: { name: string; value: number }[]
}) {
  return (
    <>
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MousePointer className="w-5 h-5" />} label="Total Clicks"   value={data.totalClicks.toLocaleString()} />
        <StatCard icon={<Users        className="w-5 h-5" />} label="Total Visitors" value={data.totalVisitors.toLocaleString()} />
        <StatCard icon={<Eye          className="w-5 h-5" />} label="Profile Views"  value={(data.profileViews ?? 0).toLocaleString()} />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Top Link"
          value={data.mostClickedLink?.title ?? '—'}
          sub={data.mostClickedLink ? `${data.mostClickedLink.clicks} clicks` : undefined}
        />
      </div>

      {/* ── Daily clicks bar chart ── */}
      <DailyChart data={data.dailyAnalytics} />

      {/* ── Device pie + Country bar side by side ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DevicePieChart pieData={devicePieData} />
        <CountryChart data={data.countryBreakdown} />
      </div>

      {/* ── Links table ── */}
      <LinksTable links={data.links} />
    </>
  )
}

// ── Daily clicks chart ─────────────────────────────────────────────────────────
function DailyChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Daily Clicks — Last 7 Days</h2>
      {data.length === 0
        ? <p className="text-muted-foreground text-sm py-8 text-center">No click data yet.</p>
        : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                tickFormatter={v => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
              <Bar dataKey="count" fill="oklch(0.6 0.22 270)" radius={[6, 6, 0, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        )
      }
    </div>
  )
}

// ── Device pie chart ───────────────────────────────────────────────────────────
function DevicePieChart({ pieData }: { pieData: { name: string; value: number }[] }) {
  const total = pieData.reduce((s, d) => s + d.value, 0)
  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Device Breakdown</h2>
      {total === 0
        ? <p className="text-muted-foreground text-sm py-8 text-center">No data yet.</p>
        : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  labelLine={false} label={(p) => <PieLabel {...p} />}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{v}</span>} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Device legend rows */}
            <div className="mt-3 space-y-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEVICE_COLORS[d.name] ?? '#64748b' }} />
                    <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
                      {deviceIcon(d.name)} {d.name}
                    </span>
                  </div>
                  <span className="font-semibold">{d.value.toLocaleString()}
                    <span className="text-xs text-muted-foreground ml-1">({total > 0 ? Math.round(d.value / total * 100) : 0}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  )
}

// ── Country bar chart ──────────────────────────────────────────────────────────
function CountryChart({ data }: { data: BreakdownPoint[] }) {
  const top = [...data]
    .sort((a, b) => Number(b.count) - Number(a.count))
    .slice(0, 8)
    .map(d => ({ name: d.country ?? 'unknown', value: Number(d.count) }))
  const max = top[0]?.value || 1

  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Top Countries</h2>
      {top.length === 0
        ? <p className="text-muted-foreground text-sm py-8 text-center">No geo data yet.</p>
        : (
          <div className="space-y-3">
            {top.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: GEO_PALETTE[i % GEO_PALETTE.length] }} />
                <span className="text-sm text-muted-foreground w-24 truncate capitalize">{c.name === 'unknown' ? 'Unknown' : c.name}</span>
                <div className="flex-1 bg-secondary/60 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(c.value / max * 100)}%`, background: GEO_PALETTE[i % GEO_PALETTE.length] }} />
                </div>
                <span className="text-sm font-semibold w-8 text-right">{c.value}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ── Links table ────────────────────────────────────────────────────────────────
function LinksTable({ links }: { links: LinkStat[] }) {
  const sorted = [...links].sort((a, b) => b.clicks - a.clicks)
  const max = sorted[0]?.clicks || 1
  return (
    <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Links by Clicks</h2>
      {sorted.length === 0
        ? <p className="text-sm text-muted-foreground">No links yet.</p>
        : (
          <div className="space-y-3">
            {sorted.map((link, i) => (
              <div key={link.id} className="flex items-center gap-4 px-4 py-3 bg-secondary/30 rounded-xl">
                <span className="text-xs font-bold text-muted-foreground/50 w-5 text-right flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.title}</p>
                  <div className="mt-1.5 bg-secondary/60 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${Math.round(link.clicks / max * 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold text-sm flex-shrink-0">
                  <MousePointer className="w-3.5 h-3.5" />{link.clicks.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
