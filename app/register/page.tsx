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
