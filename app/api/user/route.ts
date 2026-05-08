export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/user  — update profile (name, theme)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { name, theme } = await req.json()
  const data: Record<string, string> = {}
  if (name?.trim()) data.name = name.trim()
  if (theme) data.theme = theme

  await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ ok: true })
}

// GET /api/user  — fetch current user profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, theme: true, pinHash: true, createdAt: true },
  })
  return NextResponse.json({ ...user, hasPin: !!user?.pinHash })
}
