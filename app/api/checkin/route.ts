export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { today } from "@/lib/streak"

// POST /api/checkin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { goalId, status, date, reflection, value, effort } = await req.json()
  if (!goalId || !["DONE", "PARTIAL", "MISSED"].includes(status))
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 })

  // Verify goal belongs to user or user is a participant
  const goal = await prisma.goal.findFirst({ 
    where: { 
      id: goalId, 
      isActive: true,
      OR: [
        { ownerId: userId },
        { participants: { some: { userId } } }
      ]
    } 
  })
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

  const checkInDate = date || today()
  const checkIn = await prisma.checkIn.upsert({
    where: { goalId_userId_date: { goalId, userId, date: checkInDate } },
    update: { 
      status, 
      reflection,
      value: value ? parseInt(value) : undefined,
      effort: effort ? parseInt(effort) : undefined
    },
    create: { 
      goalId, 
      userId, 
      date: checkInDate, 
      status, 
      reflection,
      value: value ? parseInt(value) : undefined,
      effort: effort ? parseInt(effort) : undefined
    },
  })

  // Gamification: Add XP if status is DONE
  if (status === "DONE") {
    const { addXP } = await import("@/lib/xp")
    await addXP(userId, 10)
  }

  // Broadcast to partners for Momentum Feed (only if not private)
  if (!goal.isPrivate) {
    const { sendSSEEvent } = await import("@/lib/sse")
    const partners = await prisma.partnerConnection.findMany({
      where: {
        status: "APPROVED",
        OR: [{ requesterId: userId }, { responderId: userId }]
      }
    })

    const partnerIds = partners.map(p => p.requesterId === userId ? p.responderId : p.requesterId)
    const eventData = {
      userId,
      userName: (session.user as any).name || "A partner",
      goalTitle: goal.title,
      status,
      effort
    }

    partnerIds.forEach(id => {
      if (id) sendSSEEvent(id, "momentum", eventData)
    })
  }

  return NextResponse.json(checkIn)
}
