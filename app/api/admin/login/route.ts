import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { verifyPassword, signJWT } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { email, password, adminSecret } = await req.json()

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Invalid admin secret' }, { status: 403 })
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // Grant admin if not already
    if (!user.isAdmin) {
      await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id))
    }

    const token = await signJWT({ userId: user.id, email: user.email, username: user.username })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, username: user.username, isAdmin: true } })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
