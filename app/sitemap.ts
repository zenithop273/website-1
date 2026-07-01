import type { MetadataRoute } from 'next'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://linknest.app'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const allUsers = await db.select({ username: users.username, updatedAt: users.updatedAt })
      .from(users).where(eq(users.emailVerified, true))

    const profileRoutes: MetadataRoute.Sitemap = allUsers.map(u => ({
      url: `${base}/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...profileRoutes]
  } catch {
    return staticRoutes
  }
}
