import { redirect } from 'next/navigation'
import { db, links } from '@/db'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import Link from 'next/link'
import { ExternalLink, Link2 } from 'lucide-react'

export default async function GoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [link] = await db.select().from(links).where(eq(links.id, id)).limit(1)

  if (!link || !link.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Link Not Found</h1>
          <p className="text-muted-foreground text-sm mb-6">This link may have been removed or deactivated.</p>
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
            Go to LinkNest
          </Link>
        </div>
      </div>
    )
  }

  // Increment clicks + record analytics (fire-and-forget)
  await db.update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, id))

  // Redirect to the actual URL
  redirect(link.url)
}
