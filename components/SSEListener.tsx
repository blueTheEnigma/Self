'use client'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface NudgeEvent {
  id: string
  senderName: string
  createdAt: string
}

interface Props {
  onNudge: (e: NudgeEvent) => void
}

export function SSEListener({ onNudge }: Props) {
  const { data: session } = useSession()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!(session?.user as any)?.pinVerified) return

    const es = new EventSource('/api/sse')
    esRef.current = es

    es.addEventListener('nudge', (event) => {
      const data: NudgeEvent = JSON.parse(event.data)
      onNudge(data)
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification('SELF — Nudge 👋', {
          body: `${data.senderName} is checking in on you.`,
          icon: '/icon.png',
        })
      }
    })

    es.onerror = () => {
      es.close()
      // Reconnect after 5s
      setTimeout(() => {
        esRef.current = new EventSource('/api/sse')
      }, 5000)
    }

    return () => { es.close() }
  }, [session, onNudge])

  return null
}
