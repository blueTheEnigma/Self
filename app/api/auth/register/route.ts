import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/auth/register
export async function POST(req: NextRequest) {
  console.log("[REGISTRATION DEBUG] Start")
  const { name, email, pin, securityAnswer, token } = await req.json()
  console.log("[REGISTRATION DEBUG] Parsed body for:", email)

  if (!name || !email || !pin || !securityAnswer) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  
  try {
    console.log("[REGISTRATION DEBUG] Checking existing user...")
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    console.log("[REGISTRATION DEBUG] Existing check done. Found:", !!existing)
    
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

    console.log("[REGISTRATION DEBUG] Hashing pin and security answer...")
    const pinHash = await bcrypt.hash(pin, 10)
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10)
    console.log("[REGISTRATION DEBUG] Hashing done.")

    console.log("[REGISTRATION DEBUG] Creating user in DB...")
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), pinHash, securityAnswer: securityAnswerHash },
    })
    console.log("[REGISTRATION DEBUG] User created ID:", user.id)

    if (token) {
      console.log("[REGISTRATION DEBUG] Processing token...")
      const connection = await prisma.partnerConnection.findUnique({ where: { token } })
      if (connection && !connection.responderId && connection.status === "PENDING") {
        await prisma.partnerConnection.update({
          where: { id: connection.id },
          data: { responderId: user.id },
        })
      }
    }

    console.log("[REGISTRATION DEBUG] Success")
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[REGISTRATION DEBUG] FATAL ERROR:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
