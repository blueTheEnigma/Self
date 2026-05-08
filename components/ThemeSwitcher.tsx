'use client'
import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'midnight', label: 'Midnight', color: '#6c9ef8' },
  { id: 'obsidian', label: 'Obsidian', color: '#d4a44c' },
  { id: 'grove',    label: 'Grove',    color: '#4ecb8d' },
  { id: 'paper',    label: 'Paper',    color: '#c0392b' },
]

export function ThemeSwitcher() {
  const [current, setCurrent] = useState('midnight')

  useEffect(() => {
    const saved = localStorage.getItem('self-theme') ?? 'midnight'
    setCurrent(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  async function handleChange(id: string) {
    setCurrent(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('self-theme', id)
    // Persist to DB
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: id }),
    })
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {THEMES.map(t => (
        <button
          key={t.id}
          id={`theme-${t.id}`}
          onClick={() => handleChange(t.id)}
          aria-label={`${t.label} theme`}
          title={t.label}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: t.color,
            border: current === t.id ? `3px solid var(--text-1)` : '3px solid transparent',
            cursor: 'pointer',
            transition: 'border-color 0.2s, transform 0.15s',
            transform: current === t.id ? 'scale(1.15)' : 'scale(1)',
            boxShadow: current === t.id ? `0 0 10px ${t.color}88` : 'none',
          }}
        />
      ))}
    </div>
  )
}
