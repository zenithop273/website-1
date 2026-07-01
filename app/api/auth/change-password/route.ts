import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/db'
import { verifyJWT, getTokenFromHeader, verifyPassword, hashPassword } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const payload = await verifyJWT(getTokenFromHeader(req.headers.get('authorization')) || '')
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
    if (newPassword.length < 6)
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    if (currentPassword === newPassword)
      return NextResponse.json({ error: 'New password must be different' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })

    const passwordHash = await hashPassword(newPassword)
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, payload.userId))

    return NextResponse.json({ message: 'Password changed successfully.' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
