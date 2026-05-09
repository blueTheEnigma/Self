'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PinPad } from '@/components/PinPad'
import styles from './auth.module.css'

type LoginState = 'email' | 'pin' | 'forgot-answer' | 'forgot-new-pin'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail]       = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [loginState, setLoginState] = useState<LoginState>('email')

  async function handlePinComplete(pin: string) {
    if (loginState === 'pin') {
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
    } else if (loginState === 'forgot-new-pin') {
      setError(null)
      setLoading(true)
      const res = await fetch('/api/auth/pin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), securityAnswer, newPin: pin })
      })
      setLoading(false)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to reset PIN.')
        return
      }
      // PIN reset successful, auto log them in
      await signIn('credentials', { email: email.toLowerCase(), pin, redirect: false })
      const cb = params.get('callbackUrl')
      router.push(cb || '/dashboard')
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError(null)
    setLoginState('pin')
  }

  function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!securityAnswer) return
    setError(null)
    setLoginState('forgot-new-pin')
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>SELF.</div>
      <p className={styles.tagline}>Private accountability for people who keep their word.</p>

      {loginState === 'email' && (
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
      )}

      {loginState === 'pin' && (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-2)' }}>
            Enter your PIN for <strong>{email}</strong>
          </p>
          <PinPad onComplete={handlePinComplete} loading={loading} error={error} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={() => { setError(null); setLoginState('forgot-answer') }} 
              className="btn btn-ghost btn-full" 
              disabled={loading}
            >
              Forgot PIN?
            </button>
            <button 
              onClick={() => { setError(null); setLoginState('email') }} 
              className="btn btn-ghost btn-full" 
              disabled={loading}
              style={{ color: 'var(--text-3)' }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {loginState === 'forgot-answer' && (
        <form onSubmit={handleAnswerSubmit} className={styles.form} style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-2)' }}>
            Reset PIN for <strong>{email}</strong>
          </p>
          <div className="field">
            <label htmlFor="login-security">Who referred you?</label>
            <input id="login-security" type="text" className="input"
              value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)}
              placeholder="Friend's name or 'Twitter'" required />
          </div>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">
            Verify
          </button>
          <button 
            type="button"
            onClick={() => { setError(null); setLoginState('pin') }} 
            className="btn btn-ghost btn-full" 
            style={{ marginTop: '0.5rem' }}
          >
            Cancel
          </button>
        </form>
      )}

      {loginState === 'forgot-new-pin' && (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-2)' }}>
            Set your <strong>new PIN</strong>
          </p>
          <PinPad onComplete={handlePinComplete} loading={loading} error={error} />
          <button 
            onClick={() => { setError(null); setLoginState('forgot-answer') }} 
            className="btn btn-ghost btn-full" 
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            Back
          </button>
        </div>
      )}

      {loginState === 'email' && (
        <p className={styles.switch}>
          No account?{' '}
          <Link id="go-register" href="/register" className={styles.link}>Create one</Link>
        </p>
      )}
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
