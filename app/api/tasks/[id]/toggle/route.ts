export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/tasks/[id]/toggle
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const task = await prisma.projectTask.findUnique({
      where: { id },
      include: { phase: { include: { project: { include: { participants: true } } } } }
    })

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    // Check permissions
    const isOwner = task.phase.project.userId === userId
    const isEditor = task.phase.project.participants.some(p => p.userId === userId && p.role === 'EDITOR')

    if (!isOwner && !isEditor) return NextResponse.json({ error: "No edit permission" }, { status: 403 })

    const updatedTask = await prisma.projectTask.update({
      where: { id },
      data: { isCompleted: !task.isCompleted }
    })

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
