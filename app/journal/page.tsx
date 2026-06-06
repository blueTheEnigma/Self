'use client'
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import { useSyncStore, generateUUID } from '@/lib/syncStore'

const ENCOURAGEMENTS = [
  "Writing things down is the first step to mastering them! Keep it up! 🌟",
  "A clear mind leads to focused actions. Great job reflecting today! 🧠✨",
  "Your future self will thank you for documenting this journey. Onward! 🚀",
  "Every reflection brings you closer to your goals. You've got this! 💪",
  "Journaling is the mirror of the soul. Reflect and grow today! 🌱",
  "Small daily reflections accumulate into massive clarity over time! 📈"
]

export default function JournalPage() {
  const { status } = useSession()
  const router = useRouter()

  // Connect to unified offline store
  const {
    journals,
    saveJournal,
    deleteJournal,
    syncing,
    isOnline
  } = useSyncStore()

  // App Layout State
  const [activeTab, setActiveTab] = useState<'write' | 'history' | 'recap'>('write')

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingCreatedAt, setEditingCreatedAt] = useState<string | null>(null)
  const [encouragement, setEncouragement] = useState('')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)

  // Recap Filter State
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth())
  const [recapYear, setRecapYear] = useState(new Date().getFullYear())

  // Protect route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Random encouragement on mount
  useEffect(() => {
    setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)])
  }, [])

  // Handle Journal Save (Create/Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const nowStr = new Date().toISOString()
    const entryId = editingEntryId || generateUUID()

    const entry = {
      id: entryId,
      title: title.trim() || null,
      content: content.trim(),
      createdAt: editingCreatedAt || nowStr
    }

    saveJournal(entry)

    // Visual feedback
    const msg = editingEntryId
      ? "Reflection updated! Progression is a continuous cycle. 🔄"
      : "Reflection saved offline! " + ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
    
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(null), 5000)

    // Reset Form
    setTitle('')
    setContent('')
    setEditingEntryId(null)
    setEditingCreatedAt(null)
    
    // Go to history to see new reflection
    setActiveTab('history')
  }

  // Load entry into form for editing
  const handleEdit = (entry: any) => {
    setEditingEntryId(entry.id)
    setEditingCreatedAt(entry.createdAt)
    setTitle(entry.title || '')
    setContent(entry.content)
    setActiveTab('write')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete entry
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this reflection?")) return
    deleteJournal(id)
  }

  const cancelEdit = () => {
    setEditingEntryId(null)
    setEditingCreatedAt(null)
    setTitle('')
    setContent('')
  }

  // RECAP COMPUTATIONS
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const yearsList = useMemo(() => {
    const startYear = 2024
    const currentYear = new Date().getFullYear()
    const list = []
    for (let y = currentYear + 1; y >= startYear; y--) {
      list.push(y)
    }
    return list
  }, [])

  const filteredRecapEntries = useMemo(() => {
    return journals.filter(entry => {
      const d = new Date(entry.createdAt)
      return d.getMonth() === recapMonth && d.getFullYear() === recapYear
    })
  }, [journals, recapMonth, recapYear])

  const recapStats = useMemo(() => {
    const entriesCount = filteredRecapEntries.length
    
    // Find unique days with reflections
    const uniqueDaysSet = new Set(filteredRecapEntries.map(entry => {
      return new Date(entry.createdAt).getDate()
    }))

    const daysInMonth = new Date(recapYear, recapMonth + 1, 0).getDate()
    const rate = daysInMonth > 0 ? Math.round((uniqueDaysSet.size / daysInMonth) * 100) : 0

    let quote = "A quiet month. Every page is a fresh start to reflect. 📖"
    if (rate >= 75) {
      quote = "Exceptional self-awareness this month! Keep reflecting. 🧠🌟"
    } else if (rate >= 40) {
      quote = "Consistent reflection. You're building a strong habit. 🌱"
    } else if (rate > 0) {
      quote = "Reflected on a few key days. Try capturing more small moments next month! 📈"
    }

    return {
      entriesCount,
      uniqueDays: uniqueDaysSet,
      rate,
      daysInMonth,
      quote
    }
  }, [filteredRecapEntries, recapMonth, recapYear])

  const calendarGrid = useMemo(() => {
    const startDayOfWeek = new Date(recapYear, recapMonth, 1).getDay()
    const cells: (number | null)[] = []
    
    // Pad empty cells before the 1st day
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(null)
    }

    // Add days of the month
    for (let d = 1; d <= recapStats.daysInMonth; d++) {
      cells.push(d)
    }

    return cells
  }, [recapMonth, recapYear, recapStats.daysInMonth])

  return (
    <div className="app-shell" style={{ paddingBottom: 100 }}>
      <header className="page-header" style={{ paddingBottom: 16 }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--text-3)' }}>← Today</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Journal</h1>
          <p className="page-subtitle">Your personal space for reflection and clarity.</p>
        </div>
        {syncing && (
          <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '4px 8px', borderRadius: 12 }}>
            Syncing…
          </span>
        )}
        {!isOnline && !syncing && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--border)', padding: '4px 8px', borderRadius: 12 }}>
            Offline Mode
          </span>
        )}
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        background: 'var(--bg-surface)',
        padding: 4,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        backdropFilter: 'var(--glass)'
      }}>
        {(['write', 'history', 'recap'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 'calc(var(--radius-sm) - 4px)',
              border: 'none',
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'var(--bg)' : 'var(--text-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
          >
            {tab === 'write' ? '✍️ Write' : tab === 'history' ? '📓 History' : '📊 Recap'}
          </button>
        ))}
      </div>

      {saveSuccessMsg && (
        <div style={{
          background: 'rgba(78, 203, 141, 0.12)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fade-in 0.3s ease'
        }}>
          <span>✨</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* VIEW: WRITE */}
      {activeTab === 'write' && (
        <div className="fade-in">
          {/* Motivation Box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: 24,
            fontSize: 13,
            color: 'var(--text-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            lineHeight: 1.5,
            backdropFilter: 'var(--glass)'
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span>{encouragement}</span>
          </div>

          <div className="card-elevated" style={{ padding: 20, background: 'var(--bg-surface)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
              {editingEntryId ? 'Refining Reflection' : 'New Reflection'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Title (Optional)</label>
                <input
                  className="input"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Morning focus, Zaria updates, weekly review..."
                />
              </div>

              <div className="field">
                <label className="label">Content</label>
                <textarea
                  className="input"
                  required
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Capture your thoughts... What went well? What needs adjustment?"
                  style={{ resize: 'vertical', minHeight: 150 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {editingEntryId && (
                  <button type="button" onClick={cancelEdit} className="btn btn-ghost" style={{ flex: 1 }}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingEntryId ? 'Save Edits' : 'Save Reflection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: HISTORY */}
      {activeTab === 'history' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <span>Reflections Ledger</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 'normal' }}>({journals.length} total)</span>
          </h3>

          {journals.map(entry => (
            <div key={entry.id} className="card-elevated" style={{ padding: 20, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
                    {entry.title || 'Untitled Reflection'}
                  </h4>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'block' }}>
                    {new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleEdit(entry)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}
                    title="Edit reflection"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4 }}
                    title="Delete reflection"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p style={{
                fontSize: 13,
                color: 'var(--text-2)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '2px solid var(--border)',
                borderTop: '1px solid rgba(255, 255, 255, 0.01)'
              }}>
                {entry.content}
              </p>
            </div>
          ))}

          {journals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
              <span style={{ fontSize: 40 }}>📓</span>
              <p style={{ marginTop: 12, fontWeight: 600 }}>Empty journal ledger.</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Tap "Write" above to log your first entry.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: RECAP */}
      {activeTab === 'recap' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: 12,
            background: 'var(--bg-surface)',
            padding: 16,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            backdropFilter: 'var(--glass)'
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label" style={{ fontSize: 9 }}>Month</span>
              <select
                className="input"
                value={recapMonth}
                onChange={e => setRecapMonth(parseInt(e.target.value))}
                style={{ padding: '8px 12px', fontSize: 13 }}
              >
                {monthsList.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label" style={{ fontSize: 9 }}>Year</span>
              <select
                className="input"
                value={recapYear}
                onChange={e => setRecapYear(parseInt(e.target.value))}
                style={{ padding: '8px 12px', fontSize: 13 }}
              >
                {yearsList.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="card" style={{ padding: 24, textAlign: 'center', background: 'var(--bg-surface)' }}>
            <span className="label" style={{ color: 'var(--accent)', marginBottom: 8, display: 'block' }}>
              Consistency Score
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
              {recapStats.rate}%
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
              Reflected on {recapStats.uniqueDays.size} of {recapStats.daysInMonth} days
            </p>
            <div style={{ height: 1, background: 'var(--border)', width: '60%', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{recapStats.quote}"
            </p>
          </div>

          {/* Calendar Grid */}
          <div className="card-elevated" style={{ padding: 20, background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>
              Reflection Calendar
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, paddingBottom: 6 }}>
                  {d}
                </div>
              ))}
              
              {calendarGrid.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} />
                }
                const hasEntry = recapStats.uniqueDays.has(day)
                return (
                  <div
                    key={`day-${day}`}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: 11,
                      fontWeight: 600,
                      background: hasEntry ? 'var(--accent)' : 'transparent',
                      color: hasEntry ? 'var(--bg)' : 'var(--text-2)',
                      border: hasEntry ? '1px solid var(--accent)' : '1px solid transparent',
                      boxShadow: hasEntry ? '0 0 10px var(--accent-glow)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Month Entries Highlight */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>
              Reflections written in {monthsList[recapMonth]} {recapYear}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredRecapEntries.map(entry => (
                <div
                  key={`recap-entry-${entry.id}`}
                  style={{
                    padding: 16,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {entry.title || 'Untitled Reflection'}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12,
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {entry.content}
                  </p>
                </div>
              ))}

              {filteredRecapEntries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No entries written this month.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  )
}
