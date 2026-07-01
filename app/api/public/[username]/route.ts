import { NextRequest, NextResponse } from 'next/server'
import { db, users, links } from '@/db'
import { eq, asc } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
    if (!user) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const userLinks = await db.select().from(links)
      .where(eq(links.userId, user.id))
      .orderBy(asc(links.position))

    const now = new Date()
    const activeLinks = userLinks.filter(l => {
      if (!l.isActive) return false
      if (l.scheduledStart && now < l.scheduledStart) return false
      if (l.scheduledEnd && now > l.scheduledEnd) return false
      return true
    })

    return NextResponse.json({
      name: user.name,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
      theme: user.theme,
      socialLinks: user.socialLinks ?? {},
      newsletterEnabled: user.newsletterEnabled,
      links: activeLinks.map(l => ({
        id: l.id,
        title: l.title,
        url: l.url,
        icon: l.icon,
        category: l.category,
        hasPassword: !!l.linkPassword,
      })),
    })
  } catch (error) {
    console.error('Public profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
