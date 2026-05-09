'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { PinPad } from '@/components/PinPad'
import styles from '../login/auth.module.css'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const inviteToken = params.get('token')

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [showPin, setShowPin]   = useState(false)

  async function handlePinComplete(pin: string) {
    if (!name || !email || !securityAnswer) {
      setError('Please fill all fields first.')
      setShowPin(false)
      return
    }
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, pin, securityAnswer, token: inviteToken }),
    })
    const data = await res.json()

    if (!res.ok) { 
      setError(data.error ?? 'Registration failed.')
      setLoading(false)
      return 
    }

    await signIn('credentials', { email: email.toLowerCase(), pin, redirect: false })
    const cb = params.get('callbackUrl')
    router.push(cb || '/dashboard')
  }

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !securityAnswer) return
    setError(null)
    setShowPin(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>SELF.</div>
      {inviteToken
        ? <p className={styles.tagline}>You were invited. Create your account to join.</p>
        : <p className={styles.tagline}>Start your private accountability practice.</p>
      }

      {!showPin ? (
        <form onSubmit={handleInfoSubmit} className={styles.form}>
          <div className="field">
            <label htmlFor="reg-name">Your name</label>
            <input id="reg-name" type="text" className="input"
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Alex" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className="input"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="reg-security">Who referred you? (Security Question)</label>
            <input id="reg-security" type="text" className="input"
              value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)}
              placeholder="Friend's name, or 'Twitter'" required />
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>This will help you recover your PIN if you forget it.</p>
          </div>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <button id="reg-submit" type="submit" className="btn btn-primary btn-full">
            Next
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button 
            type="button" 
            className={styles.socialBtn}
            onClick={() => signIn('google')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-2)' }}>
            Set a 4-digit PIN for <strong>{email}</strong>
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
        Already have an account?{' '}
        <Link id="go-login" href={params.get('callbackUrl') ? `/login?callbackUrl=${encodeURIComponent(params.get('callbackUrl')!)}` : '/login'} className={styles.link}>Sign in</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="page-center">
      <Suspense fallback={<div />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
