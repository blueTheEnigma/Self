import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const { name, email, password, token } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing)
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash },
  })

  // If registering via invite token, link the connection
  if (token) {
    const connection = await prisma.partnerConnection.findUnique({ where: { token } })
    if (connection && !connection.responderId && connection.status === "PENDING") {
      await prisma.partnerConnection.update({
        where: { id: connection.id },
        data: { responderId: user.id },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
