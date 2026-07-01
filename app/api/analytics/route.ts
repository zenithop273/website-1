import { NextRequest, NextResponse } from 'next/server'
import { db, analytics, links, users } from '@/db'
import { verifyJWT, getTokenFromHeader } from '@/lib/auth'
import { eq, sql, gte, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userLinks = await db.select().from(links).where(eq(links.userId, payload.userId))
    const totalClicks = userLinks.reduce((sum, l) => sum + l.clicks, 0)

    const totalVisitorsResult = await db.select({ count: sql<number>`count(*)` })
      .from(analytics)
      .where(eq(analytics.userId, payload.userId))
    const totalVisitors = Number(totalVisitorsResult[0]?.count || 0)

    const mostClicked = [...userLinks].sort((a, b) => b.clicks - a.clicks)[0] || null

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const dailyData = await db.select({
      date: sql<string>`DATE(clicked_at)`,
      count: sql<number>`count(*)`,
    })
      .from(analytics)
      .where(and(eq(analytics.userId, payload.userId), gte(analytics.clickedAt, sevenDaysAgo)))
      .groupBy(sql`DATE(clicked_at)`)
      .orderBy(sql`DATE(clicked_at)`)

    // Device breakdown
    const deviceData = await db.select({
      device: analytics.device,
      count: sql<number>`count(*)`,
    }).from(analytics).where(eq(analytics.userId, payload.userId)).groupBy(analytics.device)

    // Country breakdown (top 10)
    const countryData = await db.select({
      country: analytics.country,
      count: sql<number>`count(*)`,
    }).from(analytics).where(eq(analytics.userId, payload.userId)).groupBy(analytics.country).orderBy(sql`count(*) desc`).limit(10)

    // Profile views
    const [userRow] = await db.select({ profileViews: users.profileViews }).from(users).where(eq(users.id, payload.userId)).limit(1)

    return NextResponse.json({
      totalClicks,
      totalVisitors,
      profileViews: userRow?.profileViews ?? 0,
      mostClickedLink: mostClicked ? { title: mostClicked.title, clicks: mostClicked.clicks, url: mostClicked.url } : null,
      dailyAnalytics: dailyData,
      deviceBreakdown: deviceData,
      countryBreakdown: countryData,
      links: userLinks.map(l => ({ id: l.id, title: l.title, clicks: l.clicks, url: l.url })),
    })
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
