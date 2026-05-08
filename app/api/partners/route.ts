export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/partners  — list connections + pending invites
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const connections = await prisma.partnerConnection.findMany({
    where: {
      OR: [{ requesterId: userId }, { responderId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      responder:  { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(connections)
}

// POST /api/partners  — generate invite link token
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  // Max 5 approved partners
  const approved = await prisma.partnerConnection.count({
    where: {
      status: "APPROVED",
      OR: [{ requesterId: userId }, { responderId: userId }],
    },
  })
  if (approved >= 5) return NextResponse.json({ error: "Maximum 5 partners reached" }, { status: 429 })

  const connection = await prisma.partnerConnection.create({
    data: { requesterId: userId, status: "PENDING" },
  })

  return NextResponse.json({ token: connection.token }, { status: 201 })
}

// PATCH /api/partners  — approve or reject a connection
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { connectionId, action } = await req.json()
  if (!["APPROVED", "REJECTED"].includes(action))
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  // Only the requester can approve/reject incoming respondents
  await prisma.partnerConnection.updateMany({
    where: { id: connectionId, requesterId: userId },
    data: { status: action },
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/partners  — remove a partner
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { connectionId } = await req.json()
  await prisma.partnerConnection.deleteMany({
    where: {
      id: connectionId,
      OR: [{ requesterId: userId }, { responderId: userId }],
    },
  })

  return NextResponse.json({ ok: true })
}
