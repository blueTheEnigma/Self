import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPin } from "@/lib/pin"

// POST /api/auth/pin/set  — set or change PIN for authenticated user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || !/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "PIN must be exactly 4 digits" }, { status: 400 })

  const pinHash = await hashPin(pin)
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { pinHash },
  })

  return NextResponse.json({ ok: true })
}
