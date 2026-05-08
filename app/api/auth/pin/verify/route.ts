import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyPin, hashPin } from "@/lib/pin"
import { encode, decode } from "next-auth/jwt"

// POST /api/auth/pin/verify  — verify PIN, return new token with pinVerified=true
export async function POST(req: NextRequest) {
  const token = req.cookies.get("next-auth.session-token")?.value ||
                req.cookies.get("__Secure-next-auth.session-token")?.value
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const decoded = await decode({ token, secret: process.env.NEXTAUTH_SECRET! })
  if (!decoded?.id) return NextResponse.json({ error: "Invalid session" }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || pin.length !== 4) return NextResponse.json({ error: "Invalid PIN" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: decoded.id as string } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (!user.pinHash) return NextResponse.json({ error: "PIN not set" }, { status: 400 })

  const valid = await verifyPin(pin, user.pinHash)
  if (!valid) return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 })

  // Re-issue the JWT with pinVerified=true
  const newToken = await encode({
    token: { ...decoded, pinVerified: true },
    secret: process.env.NEXTAUTH_SECRET!,
  })

  const isSecure = process.env.NEXTAUTH_URL?.startsWith("https")
  const cookieName = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token"
  const res = NextResponse.json({ ok: true })
  res.cookies.set(cookieName, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: !!isSecure,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  })
  return res
}
