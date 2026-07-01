import type { Metadata } from 'next'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params

  try {
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)

    if (!user) {
      return {
        title: `@${username} — LinkNest`,
        description: 'This profile does not exist on LinkNest.',
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linknest.app'
    const profileUrl = `${siteUrl}/${user.username}`
    const title = `${user.name} (@${user.username}) — LinkNest`
    const description = user.bio
      ? `${user.bio} — Check out all my links on LinkNest.`
      : `Check out ${user.name}'s links on LinkNest — all in one place.`
    const image = user.profileImage || `${siteUrl}/og-default.png`

    return {
      title,
      description,
      openGraph: {
        type: 'profile',
        url: profileUrl,
        title,
        description,
        images: [{ url: image, width: 400, height: 400, alt: user.name }],
        siteName: 'LinkNest',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [image],
      },
      alternates: { canonical: profileUrl },
    }
  } catch {
    return { title: `@${username} — LinkNest` }
  }
}

export default function UsernameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
