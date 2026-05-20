'use client'

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
}

const ENCOURAGEMENTS = [
  "Writing things down is the first step to mastering them! Keep it up! 🌟",
  "A clear mind leads to focused actions. Great job reflecting today! 🧠✨",
  "Your future self will thank you for documenting this journey. Onward! 🚀",
  "Every reflection brings you closer to your goals. You've got this! 💪",
  "Journaling is the mirror of the soul. Reflect and grow today! 🌱",
  "Small daily reflections accumulate into massive clarity over time! 📈"
];

export default function JournalPage() {
  const { status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch journal entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetchEntries();
      // Select random encouragement
      setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const url = editingEntryId ? `/api/journal/${editingEntryId}` : '/api/journal';
      const method = editingEntryId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        // Show encouraging feedback
        const msg = editingEntryId 
          ? "Reflection updated! Progression is a continuous cycle. 🔄"
          : "Reflection saved! " + ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        
        setSaveSuccessMsg(msg);
        setTimeout(() => setSaveSuccessMsg(null), 5000);

        // Reset
        setTitle('');
        setContent('');
        setEditingEntryId(null);
        fetchEntries();
      } else {
        alert('Failed to save entry');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setTitle(entry.title || '');
    setContent(entry.content);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal reflection?")) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEntries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setTitle('');
    setContent('');
  };

  if (loading) return <div className="app-shell"><div className="page-center">Opening journal...</div></div>;

  return (
    <div className="app-shell" style={{ paddingBottom: 100 }}>
      <header className="page-header">
        <div>
          <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-3)' }}>← Dashboard</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>Journal</h1>
          <p className="page-subtitle">Your personal space for reflection and clarity.</p>
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

      {saveSuccessMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--success)',
          color: 'var(--success)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fade-in 0.3s ease'
        }}>
          <span>✨</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Write Section */}
      <div className="card-elevated" style={{ marginBottom: 32, padding: 24, background: 'var(--bg-surface)' }}>
        <h3 style={{ marginBottom: 16 }}>{editingEntryId ? 'Refining Reflection' : 'New Reflection'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Title (Optional)</label>
            <input 
              className="input" 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Morning Clarity, Post-workout thoughts"
              style={{ fontSize: 14 }}
            />
          </div>

          <div className="form-group">
            <label className="label">Content</label>
            <textarea 
              className="input" 
              required 
              rows={6}
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Write freely... what's on your mind? What did you achieve today?"
              style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical', minHeight: 120 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {editingEntryId && (
              <button type="button" onClick={cancelEdit} className="btn btn-ghost" style={{ flex: 1 }}>
                Cancel Edit
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              {editingEntryId ? 'Save Edits' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>

      {/* Entries List */}
      <div>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Previous Reflections</span>
          <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 'normal' }}>({entries.length})</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.map(entry => (
            <div key={entry.id} className="card-elevated" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>
                    {entry.title || 'Untitled Reflection'}
                  </h4>
                  <span style={{ fontSize: 11, opacity: 0.5, marginTop: 2, display: 'block' }}>
                    {new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                    onClick={() => handleEdit(entry)}
                    title="Edit entry"
                  >
                    ✏️
                  </button>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.6 }}
                    onClick={() => handleDelete(entry.id)}
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p style={{ 
                fontSize: 14, 
                color: 'var(--text-2)', 
                lineHeight: 1.6, 
                whiteSpace: 'pre-wrap',
                background: 'rgba(255,255,255,0.01)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '2px solid var(--border)'
              }}>
                {entry.content}
              </p>
            </div>
          ))}

          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <span style={{ fontSize: 32 }}>📓</span>
              <p style={{ marginTop: 8 }}>No journal entries yet.</p>
              <p style={{ fontSize: 12 }}>Use the editor above to capture your first reflection.</p>
            </div>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
