'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Link2, ExternalLink, Lock, Globe, Twitter, Github, Linkedin, Youtube, Instagram, Facebook, Mail } from 'lucide-react'

interface ProfileData {
  name: string
  username: string
  bio: string
  profileImage: string
  theme: string
  socialLinks: Record<string, string>
  newsletterEnabled: boolean
  links: { id: string; title: string; url: string; icon: string; category: string; hasPassword: boolean }[]
}

const THEME_COLORS: Record<string, string> = {
  default: 'from-indigo-500 to-violet-600',
  ocean:   'from-blue-500 to-cyan-500',
  forest:  'from-green-500 to-emerald-500',
  sunset:  'from-orange-500 to-rose-500',
  minimal: 'from-gray-500 to-slate-500',
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  twitter:   <Twitter   className="w-4 h-4" />,
  github:    <Github    className="w-4 h-4" />,
  linkedin:  <Linkedin  className="w-4 h-4" />,
  youtube:   <Youtube   className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  facebook:  <Facebook  className="w-4 h-4" />,
  email:     <Mail      className="w-4 h-4" />,
  website:   <Globe     className="w-4 h-4" />,
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [email, setEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [subLoading, setSubLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/public/${username}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setProfile(d) })
      .finally(() => setLoading(false))

    // Track profile view
    fetch('/api/public/profile-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).catch(() => {})
  }, [username])

  const handleLinkClick = (linkId: string, url: string) => {
    fetch('/api/public/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId }),
    }).catch(() => {})
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubLoading(true)
    const res = await fetch('/api/public/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email }),
    })
    const data = await res.json()
    setSubMsg(data.message || data.error || 'Done!')
    setSubLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound || !profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center p-4">
      <div>
        <div className="text-6xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">@{username} doesn&apos;t exist on LinkNest.</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all">
          Create your own →
        </Link>
      </div>
    </div>
  )

  const gradientClass = THEME_COLORS[profile.theme] ?? THEME_COLORS.default
  const socialEntries = Object.entries(profile.socialLinks).filter(([, v]) => v)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${gradientClass}`} />
      </div>

      <div className="w-full max-w-md">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center mb-6">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border mb-4 shadow-lg" />
          ) : (
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg`}>
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">{profile.bio}</p>}
        </div>

        {/* Social icons */}
        {socialEntries.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {socialEntries.map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-card/60 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all">
                {SOCIAL_ICONS[platform] ?? <ExternalLink className="w-4 h-4" />}
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="space-y-3 mb-8">
          {profile.links.map(link => (
            <button key={link.id}
              onClick={() => !link.hasPassword && handleLinkClick(link.id, link.url)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-card/70 backdrop-blur border border-border/60 hover:bg-card hover:border-primary/40 transition-all group shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} bg-opacity-20 flex items-center justify-center`}>
                  <Link2 className="w-4 h-4 text-foreground" />
                </div>
                <span className="font-medium text-sm">{link.title}</span>
              </div>
              {link.hasPassword
                ? <Lock className="w-4 h-4 text-muted-foreground" />
                : <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              }
            </button>
          ))}
        </div>

        {/* Newsletter */}
        {profile.newsletterEnabled && (
          <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-sm mb-1">Subscribe for updates</h3>
            <p className="text-xs text-muted-foreground mb-3">Get notified when {profile.name} shares something new.</p>
            {subMsg ? (
              <p className="text-sm text-green-400 text-center py-2">{subMsg}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary/60 border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                <button type="submit" disabled={subLoading}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${gradientClass} text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all`}>
                  {subLoading ? '...' : 'Join'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer branding */}
        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-2.5 h-2.5 text-white" />
            </div>
            Create your own LinkNest
          </Link>
        </div>
      </div>
    </div>
  )
}
