'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import styles from './NotificationCenter.module.css'

export function NotificationCenter() {
  const { data: session } = useSession()
  const [notif, setNotif] = useState<{ msg: string; reaction?: string } | null>(null)

  useEffect(() => {
    if (!session?.user) return

    const eventSource = new EventSource('/api/sse')

    eventSource.addEventListener('nudge', (e) => {
      const data = JSON.parse(e.data)
      setNotif({ msg: `${data.senderName} nudged you!` })
      setTimeout(() => setNotif(null), 5000)
    })

    eventSource.addEventListener('reaction', (e) => {
      const data = JSON.parse(e.data)
      setNotif({ msg: `${data.senderName} reacted:`, reaction: data.reaction })
      setTimeout(() => setNotif(null), 5000)
    })

    return () => eventSource.close()
  }, [session])

  if (!notif) return null

  return (
    <div className={styles.toast}>
      <div className={styles.content}>
        <span className={styles.msg}>{notif.msg}</span>
        {notif.reaction && <span className={styles.reaction}>{notif.reaction}</span>}
      </div>
    </div>
  )
}
