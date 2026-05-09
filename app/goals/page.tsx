'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import styles from './goals.module.css';

interface Goal {
  id: string;
  type: string;
  title: string | null;
  color: string;
  frequency: string;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
const FREQUENCIES = [
  { id: 'DAILY', label: 'Daily' },
  { id: 'WEEKDAYS', label: 'Weekdays' },
  { id: 'WEEKENDS', label: 'Weekends' },
  { id: 'MON_WED_FRI', label: 'Mon/Wed/Fri' },
  { id: 'TUE_THU_SAT', label: 'Tue/Thu/Sat' },
  { id: 'WEEKLY', label: 'Weekly' },
  { id: 'BIWEEKLY', label: 'Bi-weekly' },
  { id: 'MONTHLY', label: 'Monthly' },
];

export default function GoalsDashboard() {
  const { data: session, status } = useSession();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [type, setType] = useState('NAMED');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState('DAILY');

  const fetchGoals = () => {
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGoals(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') fetchGoals();
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title: type === 'NAMED' ? title : null, color, frequency })
    });
    if (res.ok) {
      setShowModal(false);
      setTitle('');
      fetchGoals();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create goal');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this goal?')) return;
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, archive: true })
    });
    fetchGoals();
  };

  if (loading) return null;

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">ALL GOALS.</h1>
          <p className="page-subtitle">Manage your habits</p>
        </div>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + Add Goal
        </button>
      </header>

      <div className={styles.goalsList}>
        {goals.map(goal => (
          <div key={goal.id} className={styles.goalCard} style={{ borderLeft: `4px solid ${goal.color}` }}>
            <div className={styles.goalInfo}>
              <h3 className={styles.goalTitle}>{goal.type === 'NAMED' ? goal.title : 'Unnamed Goal'}</h3>
              <p className={styles.goalFreq}>{FREQUENCIES.find(f => f.id === goal.frequency)?.label || goal.frequency}</p>
            </div>
            <button className={styles.archiveButton} onClick={() => handleArchive(goal.id)}>
              Archive
            </button>
          </div>
        ))}

        {goals.length === 0 && (
          <div className={styles.emptyState}>
            <p>No goals tracked yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>New Goal</h2>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="NAMED">Named Goal</option>
                  <option value="UNNAMED">Unnamed Goal (Color Only)</option>
                </select>
              </div>

              {type === 'NAMED' && (
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Read 10 pages" />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Frequency</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                  {FREQUENCIES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Color</label>
                <div className={styles.colorPicker}>
                  {COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      className={styles.colorBtn}
                      style={{ backgroundColor: c, border: color === c ? '3px solid var(--text-1)' : 'none' }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
