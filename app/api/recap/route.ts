export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const now = new Date()
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      checkIns: {
        where: {
          date: {
            gte: firstOfLastMonth.toISOString().split('T')[0],
            lt: firstOfThisMonth.toISOString().split('T')[0],
          }
        }
      }
    }
  })

  let totalScheduled = 0
  let totalDone = 0
  const goalStats = goals.map(goal => {
    const doneCount = goal.checkIns.filter(c => c.status === 'DONE').length
    // Simplification: assume daily for recap score, or count total days in month
    // For a more accurate score, we'd need to check against the goal's frequency
    const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    
    totalDone += doneCount
    totalScheduled += daysInLastMonth // Rough estimate for now

    return {
      id: goal.id,
      title: goal.type === 'NAMED' ? goal.title : 'Unnamed Habit',
      color: goal.color,
      doneCount,
      percentage: Math.round((doneCount / daysInLastMonth) * 100)
    }
  })

  const integrityScore = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0
  const mostConsistent = [...goalStats].sort((a, b) => b.doneCount - a.doneCount)[0]

  return NextResponse.json({
    monthName: firstOfLastMonth.toLocaleString('default', { month: 'long' }),
    integrityScore,
    goalStats,
    mostConsistent
  })
}
