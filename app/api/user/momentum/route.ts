export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/momentum — fetch recent check-ins from partners
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  // 1. Get all partner IDs
  const partners = await prisma.partnerConnection.findMany({
    where: {
      status: "APPROVED",
      OR: [{ requesterId: userId }, { responderId: userId }]
    }
  })
  const partnerIds = partners
    .map(p => p.requesterId === userId ? p.responderId : p.requesterId)
    .filter((id): id is string => !!id)

  if (partnerIds.length === 0) return NextResponse.json([])

  // 2. Fetch recent non-private check-ins from these partners
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId: { in: partnerIds },
      goal: { isPrivate: false }
    },
    include: {
      user: { select: { name: true } },
      goal: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  // Format for frontend
  const history = checkIns.map(ci => ({
    userId: ci.userId,
    userName: ci.user.name || "A partner",
    goalTitle: ci.goal.title,
    status: ci.status,
    effort: ci.effort,
    createdAt: ci.createdAt
  }))

  return NextResponse.json(history)
}
