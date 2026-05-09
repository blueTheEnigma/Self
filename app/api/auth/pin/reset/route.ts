import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// POST /api/auth/pin/reset
export async function POST(req: NextRequest) {
  try {
    const { email, securityAnswer, newPin } = await req.json()

    if (!email || !securityAnswer || !newPin || !/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: "Invalid fields or PIN format" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or security answer" }, { status: 404 })
    }

    // Verify security answer
    const validAnswer = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer)
    
    if (!validAnswer) {
      // Return a generic error to prevent brute forcing
      return NextResponse.json({ error: "Invalid email or security answer" }, { status: 401 })
    }

    const newPinHash = await bcrypt.hash(newPin, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash: newPinHash },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[PIN RESET ERROR]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
