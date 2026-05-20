export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  try {
    // 1. Fetch incomplete tasks for projects where the user is an owner or participant
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId },
          { participants: { some: { userId } } }
        ]
      },
      include: {
        phases: {
          include: {
            tasks: {
              where: {
                isCompleted: false,
                deadline: { not: null }
              }
            }
          }
        }
      }
    })

    const tasks = projects.flatMap(proj => 
      proj.phases.flatMap(phase => 
        phase.tasks.map(task => ({
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          projectTitle: proj.title,
          projectColor: proj.color,
          projectId: proj.id
        }))
      )
    ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())

    // 2. Fetch incomplete, unarchived goals with targetDate
    const goals = await prisma.goal.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { participants: { some: { userId } } }
        ],
        category: 'MILESTONE',
        targetDate: { not: null },
        isActive: true,
      },
      orderBy: { targetDate: 'asc' }
    })

    return NextResponse.json({ tasks, goals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
