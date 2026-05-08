'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import styles from '../login/auth.module.css'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const inviteToken = params.get('token')

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, token: inviteToken }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error ?? 'Registration failed.'); setLoading(false); return }

    await signIn('credentials', { email: email.toLowerCase(), password, redirect: false })
    router.push('/pin/set')
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>SELF.</div>
      {inviteToken
        ? <p className={styles.tagline}>You were invited. Create your account to join.</p>
        : <p className={styles.tagline}>Start your private accountability practice.</p>
      }

      <form onSubmit={handleSubmit} className={styles.form}>
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
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" type="password" className="input"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters" required minLength={8}
            autoComplete="new-password" />
        </div>
        {error && <p className="error-msg" role="alert">{error}</p>}
        <button id="reg-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className={styles.switch}>
        Already have an account?{' '}
        <Link id="go-login" href="/login" className={styles.link}>Sign in</Link>
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
