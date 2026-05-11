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
}

export default function ProjectRealm() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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
            <h1>{project.title}</h1>
            <p>{project.description || 'A grand journey in progress.'}</p>
            <div className="streak-badge mt-12">
              <span style={{ color: project.color }}>{overallProgress}% Total Completion</span>
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
                  <h3 className={styles.phaseTitle}>0{pIdx + 1} {phase.title}</h3>
                  <span className="label" style={{ color: progress === 100 ? 'var(--success)' : 'var(--text-3)' }}>
                    {progress}% Done
                  </span>
                </div>

                <div className={styles.taskList}>
                  {phaseTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`${styles.taskItem} ${task.isCompleted ? styles.checked : ''}`}
                      onClick={() => toggleTask(task.id, task.isCompleted)}
                    >
                      <div className={styles.checkbox}>
                        {task.isCompleted && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"><path d="M2 6l3 3 5-5" /></svg>}
                      </div>
                      <span className={styles.taskText}>{task.title}</span>
                    </div>
                  ))}
                  {project.canEdit && (
                    <button className={styles.addBtn}>+ Add Mini-Task</button>
                  )}
                </div>
              </div>
            );
          })}
          
          {project.canEdit && (
            <button className="btn btn-ghost btn-full" style={{ borderStyle: 'dashed' }}>
              + Add Strategic Phase
            </button>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
