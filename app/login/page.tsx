'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PinPad } from '@/components/PinPad'
import styles from './auth.module.css'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [showPin, setShowPin]   = useState(false)

  async function handlePinComplete(pin: string) {
    if (!email) {
      setError('Please enter your email first.')
      setShowPin(false)
      return
    }
    setError(null)
    setLoading(true)
    const res = await signIn('credentials', {
      email: email.toLowerCase(),
      pin,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) { 
      setError('Invalid email or PIN.')
      return 
    }
    const cb = params.get('callbackUrl')
    router.push(cb || '/dashboard')
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError(null)
    setShowPin(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>SELF.</div>
      <p className={styles.tagline}>Private accountability for people who keep their word.</p>

      {!showPin ? (
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className="input"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" />
          </div>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">
            Next
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-2)' }}>
            Enter your PIN for <strong>{email}</strong>
          </p>
          <PinPad onComplete={handlePinComplete} loading={loading} error={error} />
          <button 
            onClick={() => setShowPin(false)} 
            className="btn btn-ghost btn-full" 
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            Back
          </button>
        </div>
      )}

      <p className={styles.switch}>
        No account?{' '}
        <Link id="go-register" href="/register" className={styles.link}>Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="page-center">
      <Suspense fallback={<div />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
