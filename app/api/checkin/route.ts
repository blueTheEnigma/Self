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

  const { goalId, status, date } = await req.json()
  if (!goalId || !["DONE", "MISSED"].includes(status))
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 })

  // Verify goal belongs to user
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId, isActive: true } })
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 })

  const checkInDate = date || today()
  const checkIn = await prisma.checkIn.upsert({
    where: { goalId_date: { goalId, date: checkInDate } },
    update: { status },
    create: { goalId, date: checkInDate, status },
  })

  return NextResponse.json(checkIn)
}
