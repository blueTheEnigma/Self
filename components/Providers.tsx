'use client'
import { useState, useCallback, useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { SSEListener } from './SSEListener'
import { Toast } from './Toast'
import { ReminderChecker } from './ReminderChecker'
import { SyncStoreProvider } from '@/lib/syncStore'

interface ToastItem {
  id: string
  message: string
  type: 'nudge' | 'info' | 'error' | 'reminder'
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[Service Worker] Registered with scope:', reg.scope))
        .catch(err => console.error('[Service Worker] Registration failed:', err))
    }
  }, [])

  const addToast = useCallback((t: ToastItem) => {
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 5000)
  }, [])

  const handleNudge = useCallback((e: { id: string; senderName: string }) => {
    addToast({ id: e.id, message: `${e.senderName} nudged you 👋`, type: 'nudge' })
    if (Notification.permission === 'default') Notification.requestPermission()
  }, [addToast])

  const handleReminder = useCallback((goalTitle: string, goalId: string) => {
    addToast({
      id: `reminder-${goalId}-${Date.now()}`,
      message: `⏰ Reminder: ${goalTitle}`,
      type: 'reminder',
    })
  }, [addToast])

  return (
    <SessionProvider>
      <SyncStoreProvider>
        <SSEListener onNudge={handleNudge} />
        <ReminderChecker onReminder={handleReminder} />
        {children}
        <div className="toast-container">
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type}
              onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
          ))}
        </div>
      </SyncStoreProvider>
    </SessionProvider>
  )
}
