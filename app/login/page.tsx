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

  useState(() => {
    const e = params.get('error')
    if (e === 'OAuthAccountNotLinked') {
      setError('An account with this email already exists. Log in with your PIN first to link Google.')
    } else if (e) {
      setError('Authentication failed. Please try again.')
    }
  })

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

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.socialGaps}>
            <button 
              type="button" 
              className={styles.socialBtn}
              onClick={() => signIn('google')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </div>
        </form>
      )}

      {loginState === 'pin' && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
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
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-2)' }}>
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
