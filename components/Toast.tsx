'use client'

interface Props {
  message: string
  type: 'nudge' | 'info' | 'error' | 'reminder'
  onClose: () => void
}

const icons = { nudge: '👋', info: 'ℹ️', error: '⚠️', reminder: '⏰' }

export function Toast({ message, type, onClose }: Props) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span style={{ fontSize: 20 }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
                 color: 'var(--text-2)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
        aria-label="Dismiss"
      >×</button>
    </div>
  )
}
