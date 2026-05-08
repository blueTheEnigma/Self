'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './auth.module.css'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) { setError('Invalid email or password.'); return }
    router.push('/pin')
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>SELF.</div>
      <p className={styles.tagline}>Private accountability for people who keep their word.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" className="input"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" className="input"
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required autoComplete="current-password" />
        </div>
        {error && <p className="error-msg" role="alert">{error}</p>}
        <button id="login-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

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
