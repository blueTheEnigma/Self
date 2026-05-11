export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/phases/[id]/tasks — add a task to a phase
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id: phaseId } = await params

  try {
    const { title, order } = await req.json()
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

    const task = await prisma.projectTask.create({
      data: {
        phaseId,
        title,
        order: order || 0
      }
    })

    return NextResponse.json(task)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
