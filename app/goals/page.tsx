'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import styles from './goals.module.css';

interface Goal {
  id: string;
  type: string;
  title: string | null;
  color: string;
}

export default function GoalsDashboard() {
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    if (status === 'authenticated') {
      fetch('/api/v1/goals')
        .then(res => res.json())
        .then(data => {
          if (data.goals) setGoals(data.goals);
          setLoading(false);
        });
    }
  }, [status]);

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>TODAY.</h1>
      </header>

      <div className={styles.goalsList}>
        {goals.map(goal => (
          <div key={goal.id} className={styles.goalCard} style={{ borderColor: goal.color }}>
            <div className={styles.goalInfo}>
              <div className={styles.dot} style={{ backgroundColor: goal.color }} />
              {goal.type === 'NAMED' && <span className={styles.goalTitle}>{goal.title}</span>}
            </div>
            <button className={styles.checkInButton}>
              Complete
            </button>
          </div>
        ))}

        {goals.length === 0 && (
          <div className={styles.emptyState}>
            No goals tracked yet.
            <button className={styles.addButton}>Add Goal</button>
          </div>
        )}
      </div>
    </div>
  );
}
