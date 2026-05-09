'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PinPad } from '@/components/PinPad'
import styles from './pin.module.css'

export default function PinPage() {
  const router = useRouter()
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePin(pin: string) {
    setError(null)
    setLoading(true)
    const res = await fetch('/api/auth/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error === 'PIN not set' ? 'No PIN set — set one first.' : 'Incorrect PIN. Try again.')
      return
    }
    const params = new URLSearchParams(window.location.search)
    const cb = params.get('callbackUrl')
    router.push(cb || '/dashboard')
    router.refresh()
  }

  return (
    <div className="page-center">
      <div className={styles.wrap}>
        <div className={styles.logo}>SELF.</div>
        <h1 className={styles.title}>Enter your PIN</h1>
        <p className={styles.sub}>Required every time you open SELF.</p>
        <PinPad onComplete={handlePin} loading={loading} error={error} />
      </div>
    </div>
  )
}
