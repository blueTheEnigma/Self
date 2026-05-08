'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import styles from './partner.module.css';

export default function PartnerView({ params }: { params: { partnerId: string } }) {
  const { data: session, status } = useSession();
  const [partner, setPartner] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudgeSent, setNudgeSent] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') {
      fetch(`/api/v1/partners/${params.partnerId}`)
        .then(res => {
           if (!res.ok) throw new Error('Failed to load');
           return res.json();
        })
        .then(data => {
          setPartner(data.partner);
          setGoals(data.goals);
          setLoading(false);
        })
        .catch(() => {
           alert('Could not load partner data. They may have removed you.');
           redirect('/partners');
        });
    }
  }, [status, params.partnerId]);

  const sendNudge = async () => {
    const res = await fetch('/api/v1/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: params.partnerId })
    });
    if (res.ok) {
      setNudgeSent(true);
      setTimeout(() => setNudgeSent(false), 3000);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => window.location.href = '/partners'} className={styles.backButton}>
          &larr; Back
        </button>
        <h1 className={styles.title}>{partner?.name?.toUpperCase()}</h1>
        <button 
          onClick={sendNudge} 
          className={styles.nudgeButton}
          disabled={nudgeSent}
        >
          {nudgeSent ? 'Sent.' : 'Knock'}
        </button>
      </header>

      <div className={styles.goalsList}>
        {goals.map(goal => (
          <div key={goal.id} className={styles.goalCard}>
            <div className={styles.goalHeader}>
              <div className={styles.dot} style={{ backgroundColor: goal.color }} />
              <span className={styles.goalTitle}>
                {goal.type === 'NAMED' ? goal.title : '---'}
              </span>
              <span className={styles.streakCount}>{goal.streak}</span>
            </div>
            <div className={styles.dotsContainer}>
              {/* Generate exactly 7 dots representing last 7 days */}
              {Array.from({ length: 7 }).map((_, i) => {
                // This is a simplified representation. A real app would match dates precisely.
                // For V1 MVP, if a checkIn exists in the last 7 days, we color it.
                const c = goal.checkIns[i];
                const isDone = c?.status === 'DONE';
                return (
                  <div 
                    key={i} 
                    className={styles.historyDot} 
                    style={{ backgroundColor: isDone ? goal.color : 'transparent' }}
                  />
                );
              }).reverse()}
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className={styles.emptyState}>
            {partner?.name} has no goals yet.
          </div>
        )}
      </div>
    </div>
  );
}
