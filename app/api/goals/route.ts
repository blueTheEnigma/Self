export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_FREQUENCIES = ["DAILY", "WEEKDAYS", "WEEKENDS", "MON_WED_FRI", "TUE_THU_SAT", "WEEKLY", "BIWEEKLY", "MONTHLY"]

// GET /api/goals  — fetch current user's active goals with check-ins
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const goals = await prisma.goal.findMany({
    where: { userId, isActive: true },
    include: { checkIns: { orderBy: { date: "desc" }, take: 30 } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(goals)
}

// POST /api/goals  — create a new goal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { type, title, color, frequency, reminderTime } = await req.json()
  if (!type || !color) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  if (type === "NAMED" && !title?.trim())
    return NextResponse.json({ error: "Named goals require a title" }, { status: 400 })
  if (frequency && !VALID_FREQUENCIES.includes(frequency))
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
  if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime))
    return NextResponse.json({ error: "Invalid reminder time" }, { status: 400 })

  const count = await prisma.goal.count({ where: { userId, isActive: true } })
  if (count >= 10) return NextResponse.json({ error: "Maximum 10 goals reached" }, { status: 429 })

  const goal = await prisma.goal.create({
    data: {
      userId,
      type,
      title: type === "NAMED" ? title.trim() : null,
      color,
      frequency: frequency ?? "DAILY",
      reminderTime: reminderTime || null,
    },
    include: { checkIns: true },
  })
  return NextResponse.json(goal, { status: 201 })
}

// PATCH /api/goals  — archive a goal OR update its frequency/reminder
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { id, archive, frequency, reminderTime } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing goal id" }, { status: 400 })

  if (archive) {
    await prisma.goal.updateMany({ where: { id, userId }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  }

  // Update frequency / reminderTime
  const data: Record<string, string | null> = {}
  if (frequency !== undefined) {
    if (!VALID_FREQUENCIES.includes(frequency))
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    data.frequency = frequency
  }
  if (reminderTime !== undefined) {
    if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime))
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    data.reminderTime = reminderTime || null
  }

  const updated = await prisma.goal.update({ where: { id }, data })
  return NextResponse.json(updated)
}
