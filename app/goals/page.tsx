'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import styles from './goals.module.css';

interface Goal {
  id: string;
  category: string;
  title: string;
  color: string;
  frequency: string;
  projectId?: string | null;
}

interface Project {
  id: string;
  title: string;
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
  const [category, setCategory] = useState('HABIT');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState('DAILY');
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchGoals = () => {
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else if (Array.isArray(data)) {
          setGoals(data);
        }
      })
      .catch(err => console.error("Fetch goals error:", err))
      .finally(() => setLoading(false));
  };

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(err => console.error("Fetch projects error:", err));
  };

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') {
      fetchGoals();
      fetchProjects();
    }
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title, color, frequency, isPrivate, targetValue, unit, projectId: projectId || null })
    });
    if (res.ok) {
      setShowModal(false);
      setTitle('');
      setIsPrivate(false);
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

  if (loading) return <div className="app-shell"><div className="page-center">Loading…</div></div>

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add
        </button>
      </header>

      <div className={styles.goalsList}>
        {goals.map(goal => (
          <div key={goal.id} className="card-elevated" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className={styles.goalInfo} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: goal.color }} />
              <div>
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                <p className={styles.goalFreq}>{goal.category === 'HABIT' ? (FREQUENCIES.find(f => f.id === goal.frequency)?.label || goal.frequency) : 'Milestone'}</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => handleArchive(goal.id)}>
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
          <div className="card-elevated" style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginBottom: 20 }}>New Goal</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label">Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="HABIT">Recurring Habit</option>
                  <option value="MILESTONE">One-time Milestone</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Title</label>
                <input className="input" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Read 10 pages" />
              </div>

              {category === 'HABIT' && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="label">Target (Optional)</label>
                    <input className="input" type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="e.g. 10" />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="label">Unit (Optional)</label>
                    <input className="input" type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. pages" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="label">Frequency</label>
                <select className="input" value={frequency} onChange={e => setFrequency(e.target.value)}>
                  {FREQUENCIES.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Link to Project (Optional)</label>
                <select className="input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                  <option value="">No Project (Standalone)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Privacy</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                  <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                  Keep this goal private from partners
                </label>
              </div>

              <div className="form-group">
                <label className="label">Color</label>
                <div className={styles.colorPicker}>
                  {COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      className={styles.colorBtn}
                      style={{ backgroundColor: c, border: color === c ? '2px solid var(--text-1)' : 'none' }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
