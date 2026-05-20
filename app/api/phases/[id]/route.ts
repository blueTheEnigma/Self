import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/phases/[id] - rename phase
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const phase = await prisma.projectPhase.findUnique({
      where: { id },
      include: { project: { include: { participants: true } } }
    })
    if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 })

    const isOwner = phase.project.userId === userId
    const participant = phase.project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    if (!canEdit) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { title } = await req.json()
    if (!title || !title.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const updated = await prisma.projectPhase.update({
      where: { id },
      data: { title: title.trim() }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/phases/[id] - delete phase
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const phase = await prisma.projectPhase.findUnique({
      where: { id },
      include: { project: { include: { participants: true } } }
    })
    if (!phase) return NextResponse.json({ error: "Phase not found" }, { status: 404 })

    const isOwner = phase.project.userId === userId
    const participant = phase.project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    if (!canEdit) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    await prisma.projectPhase.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
