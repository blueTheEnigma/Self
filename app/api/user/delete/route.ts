import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/user/delete
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id

  try {
    // Delete the user. Because of onDelete: Cascade in schema.prisma,
    // this will automatically wipe their goals, check-ins, nudges, and connections.
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[ACCOUNT DELETION ERROR]", err)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
