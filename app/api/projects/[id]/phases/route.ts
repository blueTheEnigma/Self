export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/projects/[id]/phases — add a new phase
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const { title, order } = await req.json()
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

    const phase = await prisma.projectPhase.create({
      data: {
        projectId: id,
        title,
        order: order || 0
      }
    })

    return NextResponse.json(phase)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
