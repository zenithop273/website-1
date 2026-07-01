import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { db, users } from '@/db'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin(req)
  if ('error' in check) return check.error

  const { id } = await params
  const body = await req.json() as { isBanned?: boolean; isAdmin?: boolean }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.isBanned !== undefined) updates.isBanned = body.isBanned
  if (body.isAdmin !== undefined) updates.isAdmin = body.isAdmin

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning()
  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ success: true, user: { id: updated.id, isBanned: updated.isBanned, isAdmin: updated.isAdmin } })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin(req)
  if ('error' in check) return check.error

  const { id } = await params
  // Prevent self-delete
  if (id === check.user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  await db.delete(users).where(eq(users.id, id))
  return NextResponse.json({ success: true })
}
