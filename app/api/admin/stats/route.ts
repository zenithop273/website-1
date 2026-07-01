import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { db, users, links, analytics } from '@/db'
import { sql, gte, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req)
  if ('error' in check) return check.error

  const [totalUsersRes] = await db.select({ count: sql<number>`count(*)` }).from(users)
  const [totalLinksRes] = await db.select({ count: sql<number>`count(*)` }).from(links)
  const [totalClicksRes] = await db.select({ total: sql<number>`coalesce(sum(clicks),0)` }).from(links)
  const [totalVisitsRes] = await db.select({ count: sql<number>`count(*)` }).from(analytics)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [newUsersRes] = await db.select({ count: sql<number>`count(*)` })
    .from(users).where(gte(users.createdAt, sevenDaysAgo))

  const dailySignups = await db.select({
    date: sql<string>`DATE(created_at)`,
    count: sql<number>`count(*)`,
  }).from(users)
    .where(gte(users.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`)

  // Daily clicks last 7 days
  const dailyClicks = await db.select({
    date: sql<string>`DATE(clicked_at)`,
    count: sql<number>`count(*)`,
  }).from(analytics)
    .where(gte(analytics.clickedAt, sevenDaysAgo))
    .groupBy(sql`DATE(clicked_at)`)
    .orderBy(sql`DATE(clicked_at)`)

  // Device breakdown (site-wide)
  const deviceBreakdown = await db.select({
    device: analytics.device,
    count: sql<number>`count(*)`,
  }).from(analytics).groupBy(analytics.device).orderBy(desc(sql`count(*)`))

  // Country breakdown top 10
  const countryBreakdown = await db.select({
    country: analytics.country,
    count: sql<number>`count(*)`,
  }).from(analytics).groupBy(analytics.country).orderBy(desc(sql`count(*)`)).limit(10)

  // Top 5 users by total link clicks
  const topUsers = await db.select({
    userId: links.userId,
    totalClicks: sql<number>`coalesce(sum(${links.clicks}),0)`,
    linkCount: sql<number>`count(*)`,
  }).from(links).groupBy(links.userId).orderBy(desc(sql`sum(${links.clicks})`)).limit(5)

  // Attach names
  const topUserIds = topUsers.map(r => r.userId)
  const topUserDetails = topUserIds.length > 0
    ? await db.select({ id: users.id, name: users.name, username: users.username })
        .from(users).where(sql`${users.id} = ANY(${topUserIds})`)
    : []
  const nameMap = Object.fromEntries(topUserDetails.map(u => [u.id, u]))
  const topUsersWithNames = topUsers.map(r => ({
    userId: r.userId,
    name: nameMap[r.userId]?.name ?? 'Unknown',
    username: nameMap[r.userId]?.username ?? '',
    totalClicks: Number(r.totalClicks),
    linkCount: Number(r.linkCount),
  }))

  return NextResponse.json({
    totalUsers: Number(totalUsersRes.count),
    totalLinks: Number(totalLinksRes.count),
    totalClicks: Number(totalClicksRes.total),
    totalVisits: Number(totalVisitsRes.count),
    newUsersThisWeek: Number(newUsersRes.count),
    dailySignups,
    dailyClicks,
    deviceBreakdown,
    countryBreakdown,
    topUsers: topUsersWithNames,
  })
}
