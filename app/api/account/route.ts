import { NextRequest, NextResponse } from 'next/server'
import { db, users, loginLogs } from '@/db'
import { verifyJWT, getTokenFromHeader, verifyPassword } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const logs = await db.select().from(loginLogs)
      .where(eq(loginLogs.userId, payload.userId))
      .orderBy(desc(loginLogs.loggedAt))
      .limit(50)

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Login logs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: 'Password required to confirm deletion' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Verify password before deletion (extra security)
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Incorrect password. Account not deleted.' }, { status: 403 })

    // Cascade deletes links + analytics via FK
    await db.delete(users).where(eq(users.id, payload.userId))

    return NextResponse.json({ message: 'Account deleted successfully.' })
  } catch (error) {
    console.error('Account DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
