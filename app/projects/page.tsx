'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import styles from './projects.module.css';

interface Goal {
  id: string;
  title: string;
  color: string;
  category: string;
  checkIns: { status: string; date: string }[];
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  color: string;
  deadline: string | null;
  goals: Goal[];
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [deadline, setDeadline] = useState('');

  const fetchProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') fetchProjects();
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, color, deadline })
    });
    if (res.ok) {
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchProjects();
    }
  };

  const calculateProgress = (project: Project) => {
    if (project.goals.length === 0) return 0;
    
    // Average progress of all goals (using 30-day window or total)
    // For simplicity: % of goals that have at least one DONE in last 7 days?
    // Let's do: total completed / total active goals in project
    const totalGoals = project.goals.length;
    const completedGoals = project.goals.filter(g => 
      g.checkIns.some(ci => ci.status === 'DONE')
    ).length;
    
    return Math.round((completedGoals / totalGoals) * 100);
  };

  if (loading) return <div className="app-shell"><div className="page-center">Loading…</div></div>

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Bundled accountability journeys</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New
        </button>
      </header>

      <div className={styles.projectsGrid}>
        {projects.map(project => {
          const progress = calculateProgress(project);
          const radius = 32;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (progress / 100) * circumference;

          return (
            <div key={project.id} className={`${styles.projectCard} card-elevated`} style={{ '--project-color': project.color } as any}>
              <div className={styles.projectHeader}>
                <div style={{ flex: 1 }}>
                  <h2 className={styles.projectTitle}>{project.title}</h2>
                  <p className={styles.projectDesc}>{project.description || 'No description provided.'}</p>
                </div>
                
                <div className={styles.gaugeContainer}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle className={styles.gaugeBackground} cx="40" cy="40" r={radius} />
                    <circle 
                      className={styles.gaugeFill} 
                      cx="40" cy="40" r={radius} 
                      style={{ 
                        strokeDasharray: circumference,
                        strokeDashoffset: offset
                      }}
                    />
                    <text className={styles.gaugeText} x="40" y="45" textAnchor="middle">{progress}%</text>
                  </svg>
                </div>
              </div>

              <div className={styles.goalPreview}>
                <h4 className="label">Activities</h4>
                {project.goals.map(goal => (
                  <div key={goal.id} className={styles.goalMiniRow}>
                    <div className={styles.goalMiniDot} style={{ background: goal.color }} />
                    <span className={styles.goalMiniTitle}>{goal.title}</span>
                    <span className={styles.goalMiniType} style={{ fontSize: 9, opacity: 0.6 }}>{goal.category}</span>
                  </div>
                ))}
                {project.goals.length === 0 && <p style={{ fontSize: 11, opacity: 0.5 }}>No activities linked yet.</p>}
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className={styles.emptyState}>
            <p>Start a new bundled project to track complex goals.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginBottom: 20 }}>New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label">Project Title</label>
                <input className="input" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Marathon 2026" />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" style={{ minHeight: 80, resize: 'none' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you building toward?" />
              </div>

              <div className="form-group">
                <label className="label">Color Identity</label>
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

              <div className="form-group">
                <label className="label">Target Date (Optional)</label>
                <input className="input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Launch Journey</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
