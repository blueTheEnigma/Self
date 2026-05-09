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
  const [mode, setMode] = useState('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('self-theme') ?? 'midnight'
    const savedMode = localStorage.getItem('self-mode') ?? 'dark'
    
    setCurrent(savedTheme)
    setMode(savedMode)
    
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.setAttribute('data-mode', savedMode)
  }, [])

  async function handleThemeChange(id: string) {
    setCurrent(id)
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('self-theme', id)
    
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: id }),
    })
  }

  function handleModeToggle() {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
    document.documentElement.setAttribute('data-mode', newMode)
    localStorage.setItem('self-mode', newMode)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Theme</span>
        <button 
          onClick={handleModeToggle}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-1)',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {mode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {THEMES.map(t => (
          <button
            key={t.id}
            id={`theme-${t.id}`}
            onClick={() => handleThemeChange(t.id)}
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
    </div>
  )
}
