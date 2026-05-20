'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

interface TaskAlert {
  id: string;
  title: string;
  deadline: string;
  projectTitle: string;
  projectColor: string;
  projectId: string;
}

interface GoalAlert {
  id: string;
  title: string;
  targetDate: string;
  color: string;
}

export default function AlertsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskAlert[]>([]);
  const [goals, setGoals] = useState<GoalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (!data.error) {
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchAlerts();
  }, [status]);

  const handleToggleTask = async (taskId: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' });
      // Keep state fresh
      fetchAlerts();
    } catch (err) {
      console.error(err);
      fetchAlerts();
    }
  };

  const getUrgency = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
    if (diffDays === 0) return { label: 'Due Today', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' };
    if (diffDays <= 3) return { label: `Due in ${diffDays} days`, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
    return { label: `Due: ${target.toLocaleDateString()}`, color: 'var(--text-3)', bg: 'rgba(255, 255, 255, 0.05)' };
  };

  const overdueCount = [...tasks, ...goals].filter(item => {
    const d = new Date((item as any).deadline || (item as any).targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  const totalAlerts = tasks.length + goals.length;

  // Choose encouragement message
  let encouragement = "Your horizon is clear! This is the perfect time to plan your next major milestones. Onward! 🌊";
  if (overdueCount > 0) {
    encouragement = "Deadlines are just markers of our commitments, not our self-worth. Take it one step at a time today! You can do this! ☀️";
  } else if (totalAlerts > 0) {
    encouragement = "Look at you go! Keeping up with your deadlines is a superpower. Keep that momentum high! 🚀";
  }

  if (loading) return <div className="app-shell"><div className="page-center">Retrieving alerts...</div></div>;

  return (
    <div className="app-shell" style={{ paddingBottom: 100 }}>
      <header className="page-header">
        <div>
          <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-3)' }}>← Dashboard</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Alerts</h1>
          <p className="page-subtitle">Prioritized milestones and mini-tasks.</p>
        </div>
      </header>

      {/* Encouragement Banner */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: 28,
        fontSize: 14,
        color: 'var(--text-2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        lineHeight: 1.5,
        backdropFilter: 'blur(4px)'
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <span>{encouragement}</span>
      </div>

      {totalAlerts === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
          <span style={{ fontSize: 40 }}>🎉</span>
          <p style={{ marginTop: 12, fontSize: 16, fontWeight: 'bold' }}>All clear!</p>
          <p style={{ fontSize: 13 }}>No pending deadlines or overdue items. Great work keeping organized!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Prioritized Tasks Section */}
          {tasks.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎯 Prioritized Tasks</span>
                <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 'normal' }}>({tasks.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tasks.map(task => {
                  const urgency = getUrgency(task.deadline);
                  return (
                    <div 
                      key={task.id} 
                      className="card-elevated" 
                      style={{ 
                        padding: 16, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: `4px solid ${urgency.color}`
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            color: urgency.color, 
                            backgroundColor: urgency.bg,
                            padding: '2px 6px',
                            borderRadius: 4
                          }}>
                            {urgency.label}
                          </span>
                          <Link 
                            href={`/projects/${task.projectId}`} 
                            style={{ 
                              fontSize: 11, 
                              color: task.projectColor, 
                              textDecoration: 'none', 
                              fontWeight: 'bold',
                              opacity: 0.8
                            }}
                          >
                            📁 {task.projectTitle}
                          </Link>
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>
                          {task.title}
                        </span>
                      </div>
                      
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggleTask(task.id)}
                        style={{ flexShrink: 0 }}
                      >
                        ✓ Done
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prioritized Milestone Goals Section */}
          {goals.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏁 Goal Milestones</span>
                <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 'normal' }}>({goals.length})</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.map(goal => {
                  const urgency = getUrgency(goal.targetDate);
                  return (
                    <div 
                      key={goal.id} 
                      className="card-elevated" 
                      style={{ 
                        padding: 16, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: `4px solid ${urgency.color}`
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            color: urgency.color, 
                            backgroundColor: urgency.bg,
                            padding: '2px 6px',
                            borderRadius: 4
                          }}>
                            {urgency.label}
                          </span>
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>
                          {goal.title}
                        </span>
                      </div>
                      
                      <Link 
                        href="/goals" 
                        className="btn btn-ghost btn-sm"
                        style={{ color: goal.color }}
                      >
                        View Goal
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      <NavBar />
    </div>
  );
}
