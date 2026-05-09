export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendSSEEvent } from "@/lib/sse"

// POST /api/nudge
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const senderId = (session.user as any).id

  const { receiverId, reaction } = await req.json()
  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 })

  // Verify they are partners
  const connection = await prisma.partnerConnection.findFirst({
    where: {
      status: "APPROVED",
      OR: [
        { requesterId: senderId, responderId: receiverId },
        { requesterId: receiverId, responderId: senderId },
      ],
    },
  })
  if (!connection) return NextResponse.json({ error: "Not partners" }, { status: 403 })

  // Throttle: only for "empty" nudges (alerts). Reactions are unlimited.
  if (!reaction) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recent = await prisma.nudge.findFirst({
      where: { senderId, receiverId, reaction: null, createdAt: { gte: since } },
    })
    if (recent) return NextResponse.json({ error: "Already nudged in the last 24h" }, { status: 429 })
  }

  const sender = await prisma.user.findUnique({ where: { id: senderId } })
  const nudge = await prisma.nudge.create({ data: { senderId, receiverId, reaction } })

  // Push real-time SSE event to receiver
  sendSSEEvent(receiverId, reaction ? "reaction" : "nudge", {
    id: nudge.id,
    senderName: sender?.name ?? "Someone",
    reaction,
    createdAt: nudge.createdAt,
  })

  return NextResponse.json({ ok: true })
}
