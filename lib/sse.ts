/**
 * Simple SSE broadcaster using a global Map of userId → ReadableStreamController.
 * Works for single-process dev server. For multi-instance prod, use Redis pub/sub.
 */

type Controller = ReadableStreamDefaultController<Uint8Array>

const clients = new Map<string, Set<Controller>>()

export function addSSEClient(userId: string, controller: Controller) {
  if (!clients.has(userId)) clients.set(userId, new Set())
  clients.get(userId)!.add(controller)
}

export function removeSSEClient(userId: string, controller: Controller) {
  clients.get(userId)?.delete(controller)
}

export function sendSSEEvent(userId: string, event: string, data: unknown) {
  const userClients = clients.get(userId)
  if (!userClients) return
  const payload = new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  )
  for (const ctrl of userClients) {
    try {
      ctrl.enqueue(payload)
    } catch {
      userClients.delete(ctrl)
    }
  }
}
