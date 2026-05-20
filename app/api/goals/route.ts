export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_FREQUENCIES = ["DAILY", "WEEKDAYS", "WEEKENDS", "MON_WED_FRI", "TUE_THU_SAT", "WEEKLY", "BIWEEKLY", "MONTHLY"]

// GET /api/goals  — fetch current user's active goals with check-ins
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = (session.user as any).id

    const goals = await prisma.goal.findMany({
      where: { 
        OR: [
          { ownerId: userId },
          { participants: { some: { userId } } }
        ],
        isActive: true 
      },
      include: { 
        checkIns: { orderBy: { date: "desc" }, take: 30 },
        participants: { include: { user: true } },
        project: true
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(goals)
  } catch (error: any) {
    console.error("GET /api/goals error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch goals" }, { status: 500 })
  }
}

// POST /api/goals  — create a new goal
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const ownerId = (session.user as any).id

  const { category, title, color, frequency, reminderTime, isPrivate, projectId, targetValue, unit, targetDate } = await req.json()
  if (!title || !color) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  if (frequency && !VALID_FREQUENCIES.includes(frequency))
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
  if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime))
    return NextResponse.json({ error: "Invalid reminder time" }, { status: 400 })

  const goal = await prisma.goal.create({
    data: {
      ownerId,
      projectId: projectId || null,
      title: title.trim(),
      color,
      category: category ?? "HABIT",
      targetValue: targetValue ? parseInt(targetValue) : null,
      unit: unit || null,
      frequency: category === 'MILESTONE' ? "DAILY" : (frequency ?? "DAILY"),
      reminderTime: reminderTime || null,
      isPrivate: !!isPrivate,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
    include: { checkIns: true, participants: true, project: true },
  })
  return NextResponse.json(goal, { status: 201 })
}

// PATCH /api/goals  — archive a goal OR update its details
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const ownerId = (session.user as any).id

  const { id, archive, title, color, category, targetValue, unit, targetDate, projectId, frequency, reminderTime, isPrivate } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing goal id" }, { status: 400 })

  const goal = await prisma.goal.findFirst({ where: { id, ownerId } })
  if (!goal) return NextResponse.json({ error: "Goal not found or unauthorized" }, { status: 404 })

  if (archive) {
    await prisma.goal.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  }

  // Update details
  const data: any = {}
  if (title !== undefined) data.title = title.trim()
  if (color !== undefined) data.color = color
  if (category !== undefined) data.category = category
  if (targetValue !== undefined) data.targetValue = targetValue ? parseInt(targetValue) : null
  if (unit !== undefined) data.unit = unit || null
  if (targetDate !== undefined) data.targetDate = targetDate ? new Date(targetDate) : null
  if (projectId !== undefined) data.projectId = projectId || null

  if (frequency !== undefined) {
    if (frequency && !VALID_FREQUENCIES.includes(frequency))
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 })
    data.frequency = frequency || "DAILY"
  }
  if (reminderTime !== undefined) {
    if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime))
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 })
    data.reminderTime = reminderTime || null
  }
  if (isPrivate !== undefined) {
    data.isPrivate = !!isPrivate
  }

  const updated = await prisma.goal.update({ where: { id }, data })
  return NextResponse.json(updated)
}
