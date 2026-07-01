import Link from 'next/link'
import { Link2 } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.4_0.22_270/0.15)_0%,_transparent_50%)]" />
      </div>
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">LinkNest</span>
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using LinkNest, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our service.' },
            { title: '2. Use of Service', body: 'LinkNest provides a personal link-sharing platform. You agree to use it only for lawful purposes. You may not use LinkNest to share illegal content, spam, or links that infringe on the rights of others.' },
            { title: '3. Account Responsibility', body: 'You are responsible for maintaining the security of your account and password. You are responsible for all activities that occur under your account.' },
            { title: '4. Content Policy', body: 'You retain ownership of content you post. By posting, you grant LinkNest a non-exclusive license to display that content. We reserve the right to remove content that violates these terms.' },
            { title: '5. Prohibited Activities', body: 'You may not: distribute malware, conduct phishing, impersonate others, or use automated systems to scrape or abuse the platform.' },
            { title: '6. Termination', body: 'We may suspend or terminate your account at any time for violations of these terms, with or without notice.' },
            { title: '7. Limitation of Liability', body: 'LinkNest is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.' },
            { title: '8. Changes to Terms', body: 'We may update these terms at any time. Continued use of LinkNest after changes constitutes acceptance of the new terms.' },
            { title: '9. Contact', body: 'For questions about these terms, contact us at support@linknest.app.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-foreground mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
