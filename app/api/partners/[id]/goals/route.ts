export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/partners/[id]/goals  — partner's goals for the viewer
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id: partnerId } = await params

  // Verify they are partners
  const connection = await prisma.partnerConnection.findFirst({
    where: {
      status: "APPROVED",
      OR: [
        { requesterId: userId, responderId: partnerId },
        { requesterId: partnerId, responderId: userId },
      ],
    },
  })
  if (!connection) return NextResponse.json({ error: "Not partners" }, { status: 403 })

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, xp: true, level: true },
  })
  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const goals = await prisma.goal.findMany({
    where: { 
      ownerId: partnerId, 
      isActive: true,
      isPrivate: false 
    },
    include: { 
      checkIns: { 
        where: { userId: partnerId }, // Only show the partner's check-ins to the viewer
        orderBy: { date: "desc" }, 
        take: 30 
      } 
    },
    orderBy: { createdAt: "asc" },
  })

  // Strip title from UNNAMED goals for extra privacy if needed
  const sanitized = goals.map((g: any) => ({
    ...g,
    title: g.title || "Daily Habit",
  }))

  return NextResponse.json({ partner, goals: sanitized })
}
