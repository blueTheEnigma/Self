export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/heatmap — fetch effort data for the current month
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      date: {
        gte: firstDay.toISOString().split('T')[0],
        lte: lastDay.toISOString().split('T')[0]
      }
    },
    include: {
      goal: { select: { color: true } }
    }
  })

  // Group by date
  const data: Record<string, { color: string; effort: number }[]> = {}
  checkIns.forEach(ci => {
    if (!data[ci.date]) data[ci.date] = []
    data[ci.date].push({
      color: ci.goal.color,
      effort: ci.status === 'DONE' ? 100 : (ci.effort || 0)
    })
  })

  return NextResponse.json(data)
}
