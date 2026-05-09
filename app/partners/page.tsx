'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NavBar } from '@/components/NavBar';
import styles from './partners.module.css';

export default function Partners() {
  const { data: session, status } = useSession();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');

  const fetchConnections = async () => {
    const res = await fetch('/api/partners');
    const data = await res.json();
    setConnections(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') fetchConnections();
  }, [status]);

  const generateLink = async () => {
    const res = await fetch('/api/partners', { method: 'POST' });
    const data = await res.json();
    if (data.token) {
      const link = `${window.location.origin}/partners/invite?token=${data.token}`;
      setInviteLink(link);
    } else alert(data.error);
    fetchConnections();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link copied to clipboard!');
  };

  const approvePartner = async (connectionId: string) => {
    const res = await fetch('/api/partners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, action: 'APPROVED' })
    });
    if (res.ok) fetchConnections();
  };

  const removePartner = async (connectionId: string) => {
    if (!confirm('Are you sure you want to remove this partner?')) return;
    const res = await fetch('/api/partners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId })
    });
    if (res.ok) fetchConnections();
  };

  if (loading) return <div className="app-shell"><div className="page-center">Loading…</div></div>

  return (
    <div className="app-shell">
      <div className="page-header">
        <h1 className="page-title">Circle</h1>
      </div>

      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="label">Your Circle</h2>
          <span className={styles.limitBadge}>{connections.filter(c => c.status === 'APPROVED').length} / 5 Partners</span>
        </div>
        
        <div className={styles.list}>
          {connections.map(conn => {
            const isRequester = conn.requesterId === (session?.user as any)?.id;
            const partner = isRequester ? conn.responder : conn.requester;
            const isPending = conn.status === 'PENDING';
            
            return (
              <div key={conn.id} className="card-elevated" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.partnerInfo}>
                  <div className={styles.avatar}>
                    {isPending ? '✨' : (partner?.name?.charAt(0) || '👤')}
                  </div>
                  <div>
                    <div className={styles.name}>
                      {partner?.name || (isRequester ? 'Waiting for Friend...' : 'Tag Along Invite')}
                    </div>
                    <div className={styles.statusBadge}>
                      {isPending ? (isRequester ? 'Invite Sent' : 'Wants to tag along') : 'Partner'}
                    </div>
                  </div>
                </div>
                <div className={styles.actions}>
                  {isPending && !isRequester && (
                    <button onClick={() => approvePartner(conn.id)} className="btn btn-primary btn-sm">
                      Accept
                    </button>
                  )}
                  {conn.status === 'APPROVED' && partner && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link href={`/partners/${partner.id}`} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
                        View
                      </Link>
                      <button onClick={() => removePartner(conn.id)} className="btn btn-ghost" style={{ padding: '8px 12px', opacity: 0.5 }}>
                        ✕
                      </button>
                    </div>
                  )}
                  {isPending && isRequester && (
                    <button onClick={() => removePartner(conn.id)} className="btn btn-ghost" style={{ fontSize: 12 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {connections.filter(c => c.status === 'APPROVED').length < 5 && connections.length < 10 && (
            <div className={styles.inviteSection}>
              <p className={styles.inviteText}>Invite a friend to tag along on your journey.</p>
              {inviteLink ? (
                <div className={styles.inviteBox}>
                  <input type="text" readOnly value={inviteLink} className="input" style={{ flex: 1, fontSize: 12 }} />
                  <button onClick={copyLink} className="btn btn-primary btn-sm">Copy</button>
                </div>
              ) : (
                <button onClick={generateLink} className="btn btn-ghost btn-full" style={{ borderStyle: 'dashed' }}>
                  + Generate Invite Link
                </button>
              )}
            </div>
          )}

          {connections.length === 0 && !inviteLink && (
            <div className={styles.emptyState}>Your circle is empty. Start your journey with a friend.</div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
