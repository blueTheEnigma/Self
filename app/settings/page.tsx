'use client'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { NavBar } from '@/components/NavBar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { RecapModal } from '@/components/RecapModal'
import { useRouter } from 'next/navigation'
import styles from './settings.module.css'

interface UserProfile {
  id: string; name: string; email: string; theme: string; hasPin: boolean
  createdAt: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile]   = useState<UserProfile | null>(null)
  const [name, setName]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [pinStep, setPinStep]   = useState<'idle'|'current'|'new'|'confirm'>('idle')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin]     = useState('')
  const [showRecap, setShowRecap] = useState(false)

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(d => {
      setProfile(d)
      setName(d.name ?? '')
    })
  }, [])

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function changePin(e: React.FormEvent) {
    e.preventDefault()
    setPinError(null)
    if (!/^\d{4}$/.test(pinInput)) { setPinError('PIN must be 4 digits'); return }

    if (pinStep === 'current') {
      // Verify current PIN
      const res = await fetch('/api/auth/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      })
      if (!res.ok) { setPinError('Incorrect current PIN'); setPinInput(''); return }
      setCurrentPin(pinInput); setPinInput(''); setPinStep('new')
    } else if (pinStep === 'new') {
      setNewPin(pinInput); setPinInput(''); setPinStep('confirm')
    } else if (pinStep === 'confirm') {
      if (pinInput !== newPin) { setPinError("PINs don't match"); setPinInput(''); setPinStep('new'); return }
      const res = await fetch('/api/auth/pin/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      })
      if (!res.ok) { setPinError('Failed to update PIN'); return }
      setPinStep('idle'); setPinInput(''); setNewPin(''); setCurrentPin('')
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    }
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="app-shell">
      {showRecap && <RecapModal onClose={() => setShowRecap(false)} />}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          {memberSince && <p className="page-subtitle">Member since {memberSince}</p>}
        </div>
      </div>

      {/* Theme */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <ThemeSwitcher />
      </section>

      <div className="divider" />

      {/* Insights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Insights</h2>
        <button 
          className="card-elevated" 
          style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowRecap(true)}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>Monthly Performance</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>View your integrity score and habits.</div>
          </div>
          <span style={{ fontSize: 20, color: 'var(--accent)' }}>→</span>
        </button>
      </section>

      <div className="divider" />

      {/* Profile */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <form onSubmit={saveName} className={styles.form}>
          <div className="field">
            <label htmlFor="settings-name">Name</label>
            <input id="settings-name" type="text" className="input"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" className="input" value={profile?.email ?? ''} disabled
              style={{ opacity: 0.5 }} />
          </div>
          {saved && <p className="success-msg">Saved.</p>}
          <button id="save-name-btn" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </section>

      <div className="divider" />

      {/* PIN */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PIN</h2>
        {pinStep === 'idle' ? (
          <button id="change-pin-btn" className="btn btn-ghost btn-full"
            onClick={() => setPinStep('current')}>
            Change PIN
          </button>
        ) : (
          <form onSubmit={changePin} className={styles.form}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {pinStep === 'current' && 'Enter your current PIN to continue.'}
              {pinStep === 'new' && 'Enter a new 4-digit PIN.'}
              {pinStep === 'confirm' && 'Confirm your new PIN.'}
            </p>
            <div className="field">
              <label htmlFor="pin-input">
                {pinStep === 'current' ? 'Current PIN' : pinStep === 'new' ? 'New PIN' : 'Confirm PIN'}
              </label>
              <input id="pin-input" type="password" inputMode="numeric" maxLength={4}
                className="input" value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••" pattern="\d{4}" required />
            </div>
            {pinError && <p className="error-msg">{pinError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" id="pin-next-btn" className="btn btn-primary" style={{ flex: 1 }}>
                {pinStep === 'confirm' ? 'Save PIN' : 'Next'}
              </button>
              <button type="button" className="btn btn-ghost"
                onClick={() => { setPinStep('idle'); setPinInput(''); setPinError(null) }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="divider" />

      {/* Sign out */}
      <section className={styles.section}>
        <button id="signout-btn" className="btn btn-ghost btn-full"
          onClick={() => signOut({ callbackUrl: '/login' })}>
          Sign out
        </button>
      </section>

      <div className="divider" />

      {/* Danger Zone */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ color: 'var(--accent)' }}>Danger Zone</h2>
        <button 
          className="btn btn-danger btn-full"
          onClick={() => {
            const confirm = window.prompt("This will permanently delete your account, goals, and history. Type 'DELETE' to confirm:")
            if (confirm === 'DELETE') {
              fetch('/api/user/delete', { method: 'DELETE' }).then(() => {
                signOut({ callbackUrl: '/register' })
              })
            }
          }}
        >
          Delete Account
        </button>
      </section>

      <NavBar />
    </div>
  )
}
