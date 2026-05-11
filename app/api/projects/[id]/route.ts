export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id] — fetch the full project realm data
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = params

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
