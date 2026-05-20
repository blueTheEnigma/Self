import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/tasks/[id] - update task (title, deadline, isCompleted)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const isOwner = task.phase.project.userId === userId
    const participant = task.phase.project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    if (!canEdit) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { title, deadline, isCompleted } = await req.json()
    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null
    if (isCompleted !== undefined) data.isCompleted = !!isCompleted

    const updated = await prisma.projectTask.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - delete task
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const isOwner = task.phase.project.userId === userId
    const participant = task.phase.project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    if (!canEdit) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    await prisma.projectTask.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
