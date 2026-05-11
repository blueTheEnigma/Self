export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/projects — fetch current user's projects with bundled goals
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { 
      goals: { 
        where: { isActive: true },
        include: { checkIns: { orderBy: { date: "desc" }, take: 7 } }
      } 
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { title, description, color, deadline } = await req.json()
  if (!title || !color) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const project = await prisma.project.create({
    data: {
      userId,
      title: title.trim(),
      description: description?.trim() || null,
      color,
      deadline: deadline ? new Date(deadline) : null,
    },
    include: { goals: true },
  })

  return NextResponse.json(project, { status: 201 })
}
