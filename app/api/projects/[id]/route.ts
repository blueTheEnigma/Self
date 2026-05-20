export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id] — fetch the full project realm data
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId }, // Owner
          { participants: { some: { userId } } } // Collaborator
        ]
      },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' } }
          }
        },
        participants: {
          include: { user: { select: { name: true, image: true, email: true } } }
        },
        goals: { where: { isActive: true } }
      }
    })

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    // Check permissions
    const isOwner = project.userId === userId
    const participant = project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    return NextResponse.json({ ...project, canEdit, isOwner })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/projects/[id] — update the project details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { participants: { some: { userId } } }
        ]
      },
      include: { participants: true }
    })

    if (!project) return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })

    const isOwner = project.userId === userId
    const participant = project.participants.find(p => p.userId === userId)
    const canEdit = isOwner || participant?.role === 'EDITOR'

    if (!canEdit) return NextResponse.json({ error: "Unauthorized to edit this project" }, { status: 403 })

    const { title, description, color, deadline } = await req.json()
    const data: any = {}
    if (title !== undefined) data.title = title.trim()
    if (description !== undefined) data.description = description
    if (color !== undefined) data.color = color
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null

    const updated = await prisma.project.update({
      where: { id },
      data
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
