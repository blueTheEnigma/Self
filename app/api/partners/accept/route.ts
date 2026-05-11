export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

  // Find the pending connection
  const connection = await prisma.partnerConnection.findUnique({
    where: { token },
  })

  if (!connection) {
    return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 })
  }

  if (connection.responderId) {
    return NextResponse.json({ error: "Invite link has already been used" }, { status: 400 })
  }

  if (connection.requesterId === userId) {
    return NextResponse.json({ error: "You cannot accept your own invite" }, { status: 400 })
  }

  // Accept the connection (leaves it as PENDING for the requester to approve)
  await prisma.partnerConnection.update({
    where: { id: connection.id },
    data: { responderId: userId },
  })

  return NextResponse.json({ ok: true })
}
