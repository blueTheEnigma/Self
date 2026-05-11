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
    where: { 
      OR: [
        { ownerId: userId },
        { participants: { some: { userId } } }
      ]
    },
    include: {
      checkIns: {
        where: {
          userId, // Only include the user's own check-ins for their recap
          date: {
            gte: firstOfLastMonth.toISOString().split('T')[0],
            lt: firstOfThisMonth.toISOString().split('T')[0],
          }
        }
      }
    }
  })

  let totalEffort = 0
  let totalScheduled = 0
  const goalStats = goals.map(goal => {
    const doneCount = goal.checkIns.filter(c => c.status === 'DONE').length
    const partialCount = goal.checkIns.filter(c => c.status === 'PARTIAL').length
    
    // Effort score: DONE = 100%, PARTIAL = effort/5 or 50% default
    const effortPoints = goal.checkIns.reduce((acc, c) => {
      if (c.status === 'DONE') return acc + 100
      if (c.status === 'PARTIAL') return acc + (c.effort ? (c.effort * 20) : 50)
      return acc
    }, 0)

    const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    
    totalEffort += effortPoints
    totalScheduled += (daysInLastMonth * 100) 

    return {
      id: goal.id,
      title: goal.title,
      color: goal.color,
      doneCount,
      partialCount,
      percentage: Math.round(effortPoints / (daysInLastMonth)) // This gives a score relative to 100
    }
  })

  const integrityScore = totalScheduled > 0 ? Math.round((totalEffort / totalScheduled) * 100) : 0
  const mostConsistent = [...goalStats].sort((a, b) => b.percentage - a.percentage)[0]

  return NextResponse.json({
    monthName: firstOfLastMonth.toLocaleString('default', { month: 'long' }),
    integrityScore,
    goalStats,
    mostConsistent
  })
}
