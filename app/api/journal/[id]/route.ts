import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/journal/[id] - Update entry
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId }
    })
    if (!entry) return NextResponse.json({ error: "Entry not found or unauthorized" }, { status: 404 })

    const { title, content } = await req.json()
    const data: any = {}
    if (title !== undefined) data.title = title?.trim() || null
    if (content !== undefined) {
      if (!content.trim()) return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 })
      data.content = content.trim()
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/journal/[id] - Delete entry
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id
  const { id } = await params

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId }
    })
    if (!entry) return NextResponse.json({ error: "Entry not found or unauthorized" }, { status: 404 })

    await prisma.journalEntry.delete({
      where: { id }
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
