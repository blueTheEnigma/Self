'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PinPad } from '@/components/PinPad'
import styles from '../pin.module.css'

export default function SetPinPage() {
  const router = useRouter()
  const [step, setStep]       = useState<'set' | 'confirm'>('set')
  const [first, setFirst]     = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePin(pin: string) {
    if (step === 'set') {
      setFirst(pin)
      setStep('confirm')
      return
    }
    // Confirm step
    if (pin !== first) {
      setError("PINs don't match. Try again.")
      setStep('set')
      setFirst('')
      return
    }
    setError(null)
    setLoading(true)
    const res = await fetch('/api/auth/pin/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    setLoading(false)
    if (!res.ok) {
      setError('Failed to set PIN. Try again.')
      return
    }
    // Now verify the PIN to get pinVerified in session
    await fetch('/api/auth/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const params = new URLSearchParams(window.location.search)
    const cb = params.get('callbackUrl')
    router.push(cb || '/dashboard')
    router.refresh()
  }

  return (
    <div className="page-center">
      <div className={styles.wrap}>
        <div className={styles.logo}>SELF.</div>
        <h1 className={styles.title}>
          {step === 'set' ? 'Set your 4-digit PIN' : 'Confirm your PIN'}
        </h1>
        <p className={styles.sub}>
          {step === 'set'
            ? 'You\'ll need this every time you open SELF.'
            : 'Enter the same PIN again to confirm.'}
        </p>
        <PinPad onComplete={handlePin} loading={loading} error={error} key={step} />
      </div>
    </div>
  )
}
