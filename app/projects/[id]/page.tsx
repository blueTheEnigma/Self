'use client'

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import styles from './realm.module.css';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  deadline?: string | null;
}

interface Phase {
  id: string;
  title: string;
  tasks: Task[];
}

interface Participant {
  userId: string;
  role: string;
  user: { name: string; image: string | null; email: string };
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  color: string;
  canEdit: boolean;
  isOwner: boolean;
  phases: Phase[];
  participants: Participant[];
  deadline?: string | null;
}

export default function ProjectRealm() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Project Settings State
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  // Edit Phase State
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingPhaseTitle, setEditingPhaseTitle] = useState('');

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDeadline, setEditingTaskDeadline] = useState('');

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.error) {
        console.error("Realm fetch error:", data.error);
        alert(`Failed to enter realm: ${data.error}`);
        router.push('/projects');
      } else {
        setProject(data);
      }
    } catch (err) {
      console.error("Realm network error:", err);
      router.push('/projects');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchProject();
  }, [status, id]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!project?.canEdit) return;
    
    // Optimistic update
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        phases: prev.phases.map(p => ({
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !currentStatus } : t)
        }))
      };
    });

    await fetch(`/api/tasks/${taskId}/toggle`, { method: 'POST' });
  };

  const addPhase = async () => {
    const title = prompt("Enter strategic phase name (e.g., 'Phase 1: Setup')");
    if (!title) return;

    const res = await fetch(`/api/projects/${id}/phases`, {
      method: 'POST',
      body: JSON.stringify({ title, order: project?.phases.length || 0 })
    });
    if (res.ok) fetchProject();
  };

  const addTask = async (phaseId: string) => {
    const title = prompt("Enter mini-task name");
    if (!title) return;

    const res = await fetch(`/api/phases/${phaseId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title, order: 0 })
    });
    if (res.ok) fetchProject();
  };

  const openEditModal = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    setEditColor(project.color);
    setEditDeadline(project.deadline ? project.deadline.split('T')[0] : '');
    setShowEditProjectModal(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        color: editColor,
        deadline: editDeadline || null
      })
    });
    if (res.ok) {
      setShowEditProjectModal(false);
      fetchProject();
    } else {
      alert('Failed to update project settings');
    }
  };

  const handleRenamePhase = async (phaseId: string) => {
    if (!editingPhaseTitle.trim()) return;
    const res = await fetch(`/api/phases/${phaseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingPhaseTitle })
    });
    if (res.ok) {
      setEditingPhaseId(null);
      fetchProject();
    } else {
      alert('Failed to rename phase');
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Delete this strategic phase and all its tasks?")) return;
    const res = await fetch(`/api/phases/${phaseId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      fetchProject();
    } else {
      alert('Failed to delete phase');
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editingTaskTitle,
        deadline: editingTaskDeadline || null
      })
    });
    if (res.ok) {
      setEditingTaskId(null);
      fetchProject();
    } else {
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      fetchProject();
    } else {
      alert('Failed to delete task');
    }
  };

  const overallProgress = useMemo(() => {
    if (!project?.phases.length) return 0;
    const allTasks = project.phases.flatMap(p => p.tasks);
    if (!allTasks.length) return 0;
    const completed = allTasks.filter(t => t.isCompleted).length;
    return Math.round((completed / allTasks.length) * 100);
  }, [project]);

  if (loading) return <div className="app-shell"><div className="page-center">Entering Realm...</div></div>;
  if (!project) return null;

  return (
    <div className={styles.realmWrapper} style={{ '--realm-color': project.color, '--realm-color-dim': `${project.color}33` } as any}>
      <div className="app-shell" style={{ maxWidth: 800, paddingBottom: 100 }}>
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h1>{project.title}</h1>
              {project.canEdit && (
                <button className="btn btn-ghost btn-sm" onClick={openEditModal}>
                  ⚙️ Settings
                </button>
              )}
            </div>
            <p>{project.description || 'A grand journey in progress.'}</p>
            <div className="streak-badge mt-12" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: project.color }}>{overallProgress}% Total Completion</span>
              {project.deadline && (
                <span style={{ opacity: 0.6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📅</span> Deadline: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className={styles.collaborators}>
            {project.participants.map(p => (
              <div key={p.userId} className={styles.avatar} title={`${p.user.name} (${p.role})`}>
                {p.user.image ? <img src={p.user.image} alt={p.user.name} /> : p.user.name[0]}
              </div>
            ))}
            {project.isOwner && (
              <button className={styles.avatar} style={{ borderStyle: 'dashed', cursor: 'pointer' }} onClick={() => {}}>
                +
              </button>
            )}
          </div>
        </header>

        <div className={styles.roadmap}>
          {project.phases.map((phase, pIdx) => {
            const phaseTasks = phase.tasks;
            const completed = phaseTasks.filter(t => t.isCompleted).length;
            const progress = phaseTasks.length ? Math.round((completed / phaseTasks.length) * 100) : 0;

            return (
              <div key={phase.id} className={styles.phaseCard}>
                <div className={styles.phaseHeader}>
                  {editingPhaseId === phase.id ? (
                    <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <input 
                        className="input" 
                        value={editingPhaseTitle} 
                        onChange={e => setEditingPhaseTitle(e.target.value)} 
                        style={{ fontSize: 14, padding: '4px 8px', flex: 1 }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => handleRenamePhase(phase.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingPhaseId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3 className={styles.phaseTitle}>0{pIdx + 1} {phase.title}</h3>
                        {project.canEdit && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                              onClick={() => { setEditingPhaseId(phase.id); setEditingPhaseTitle(phase.title); }}
                              title="Rename Phase"
                            >
                              ✏️
                            </button>
                            <button 
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                              onClick={() => handleDeletePhase(phase.id)}
                              title="Delete Phase"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                      <span className="label" style={{ color: progress === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                        {progress}% Done
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.taskList}>
                  {phaseTasks.map(task => {
                    const isTaskEditing = editingTaskId === task.id;
                    return (
                      <div 
                        key={task.id} 
                        className={`${styles.taskItem} ${task.isCompleted ? styles.checked : ''}`}
                        onClick={() => { if (!isTaskEditing) toggleTask(task.id, task.isCompleted); }}
                        style={{ cursor: isTaskEditing ? 'default' : 'pointer' }}
                      >
                        {isTaskEditing ? (
                          <div 
                            style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <input 
                              className="input" 
                              value={editingTaskTitle} 
                              onChange={e => setEditingTaskTitle(e.target.value)}
                              placeholder="Task title"
                              style={{ fontSize: 14, padding: '6px 10px', width: '100%' }}
                            />
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <label style={{ fontSize: 12, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 6 }}>
                                Deadline:
                                <input 
                                  type="date" 
                                  className="input" 
                                  value={editingTaskDeadline} 
                                  onChange={e => setEditingTaskDeadline(e.target.value)}
                                  style={{ padding: '4px 6px', fontSize: 12 }}
                                />
                              </label>
                              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleUpdateTask(task.id)}>Save</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingTaskId(null)}>Cancel</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.checkbox}>
                              {task.isCompleted && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <span className={styles.taskText}>{task.title}</span>
                              {task.deadline && (
                                <span style={{ 
                                  fontSize: 11, 
                                  opacity: 0.7, 
                                  marginTop: 2, 
                                  color: new Date(task.deadline) < new Date() && !task.isCompleted ? '#f87171' : 'var(--text-3)',
                                  fontWeight: new Date(task.deadline) < new Date() && !task.isCompleted ? 'bold' : 'normal'
                                }}>
                                  📅 Due: {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline) < new Date() && !task.isCompleted ? '(Overdue)' : ''}
                                </span>
                              )}
                            </div>
                            {project.canEdit && (
                              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                                <button 
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setEditingTaskTitle(task.title);
                                    setEditingTaskDeadline(task.deadline ? task.deadline.split('T')[0] : '');
                                  }}
                                  title="Edit Task"
                                >
                                  ✏️
                                </button>
                                <button 
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Delete Task"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {project.canEdit && (
                    <button className={styles.addBtn} onClick={() => addTask(phase.id)}>+ Add Mini-Task</button>
                  )}
                </div>
              </div>
            );
          })}
          
          {project.canEdit && (
            <button className="btn btn-ghost btn-full" style={{ borderStyle: 'dashed' }} onClick={addPhase}>
              + Add Strategic Phase
            </button>
          )}
        </div>
      </div>

      {showEditProjectModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card-elevated" style={{ width: '100%', maxWidth: 450, padding: 28, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: 20 }}>Project Settings</h2>
            <form onSubmit={handleEditProject}>
              <div className="form-group">
                <label className="label">Project Title</label>
                <input className="input" type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="input" style={{ minHeight: 80, resize: 'none' }} value={editDescription} onChange={e => setEditDescription(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">Color Identity</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'].map(c => (
                    <button
                      type="button"
                      key={c}
                      style={{
                        backgroundColor: c, width: 28, height: 28, borderRadius: '50%',
                        border: editColor === c ? '2.5px solid var(--text-1)' : 'none', cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Target Date (Optional)</label>
                <input className="input" type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button type="button" onClick={() => setShowEditProjectModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
