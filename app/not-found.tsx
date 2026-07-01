import Link from 'next/link'
import { Link2, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.4_0.22_270/0.2)_0%,_transparent_60%)]" />
      </div>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Link2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-8xl font-black text-primary/20 mb-4 leading-none">404</div>
        <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          If you were looking for someone&apos;s profile, double-check the username.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all font-medium">
            <ArrowLeft className="w-4 h-4" /> Login
          </Link>
        </div>
      </div>
    </div>
  )
}
