'use client'
import { useState, useRef } from 'react'
import styles from './PinPad.module.css'

interface Props {
  onComplete: (pin: string) => void
  loading?: boolean
  error?: string | null
}

export function PinPad({ onComplete, loading, error }: Props) {
  const [digits, setDigits] = useState<string[]>([])
  const [shake, setShake] = useState(false)
  const prevError = useRef(error)

  if (error && error !== prevError.current) {
    prevError.current = error
    setShake(true)
    setTimeout(() => setShake(false), 500)
    setDigits([])
  }

  function press(d: string) {
    if (loading) return
    if (d === 'del') {
      setDigits(prev => prev.slice(0, -1))
      return
    }
    const next = [...digits, d]
    setDigits(next)
    if (next.length === 4) {
      onComplete(next.join(''))
    }
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div className={`${styles.wrap} ${shake ? 'shake' : ''}`}>
      {/* Dots */}
      <div className={styles.dots}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`${styles.dot} ${i < digits.length ? styles.filled : ''}`} />
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Keypad */}
      <div className={styles.grid}>
        {keys.map((k, i) => (
          k === '' ? <div key={i} /> :
          <button
            key={i}
            id={`pin-key-${k}`}
            className={`${styles.key} ${k === 'del' ? styles.del : ''}`}
            onClick={() => press(k)}
            disabled={loading || (digits.length === 4 && k !== 'del')}
            aria-label={k === 'del' ? 'Delete' : k}
          >
            {k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
