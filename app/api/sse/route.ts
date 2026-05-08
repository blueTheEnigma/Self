import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { addSSEClient, removeSSEClient } from "@/lib/sse"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = (session.user as any).id

  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
      addSSEClient(userId, controller)

      // Keep-alive ping every 25s
      const ping = setInterval(() => {
        try {
          c.enqueue(new TextEncoder().encode(": ping\n\n"))
        } catch {
          clearInterval(ping)
        }
      }, 25000)

      req.signal.addEventListener("abort", () => {
        clearInterval(ping)
        removeSSEClient(userId, controller)
        try { c.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      Connection:      "keep-alive",
    },
  })
}
