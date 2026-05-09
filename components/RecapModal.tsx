'use client'
import { useEffect, useState } from 'react'
import styles from './RecapModal.module.css'

export function RecapModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recap')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.badge}>Monthly Recap</span>
          <h2 className={styles.title}>{data.monthName} Summary</h2>
        </div>

        <div className={styles.scoreSection}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{data.integrityScore}%</span>
            <span className={styles.scoreLabel}>Integrity</span>
          </div>
          <p className={styles.tagline}>
            You kept your word on {data.integrityScore}% of your commitments last month.
          </p>
        </div>

        <div className={styles.statsList}>
          <h3 className={styles.sectionLabel}>Highlights</h3>
          {data.mostConsistent && (
            <div className={styles.highlight}>
              <div className={styles.hIcon} style={{ background: data.mostConsistent.color }}>🏆</div>
              <div>
                <div className={styles.hTitle}>Most Consistent</div>
                <div className={styles.hValue}>{data.mostConsistent.title} ({data.mostConsistent.doneCount} days)</div>
              </div>
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-full" onClick={onClose}>
          Got it, keep going!
        </button>
      </div>
    </div>
  )
}
