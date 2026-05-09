'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import styles from './partners.module.css';

export default function Partners() {
  const { data: session, status } = useSession();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');

  const fetchConnections = async () => {
    const res = await fetch('/api/partners');
    const data = await res.json();
    setConnections(data.connections || []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status === 'authenticated') fetchConnections();
  }, [status]);

  const generateLink = async () => {
    const res = await fetch('/api/partners', { method: 'POST' });
    const data = await res.json();
    if (data.link) setInviteLink(data.link);
    else alert(data.error);
    fetchConnections();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Link copied to clipboard!');
  };

  const approvePartner = async (connectionId: string) => {
    const res = await fetch('/api/partners/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId })
    });
    if (res.ok) fetchConnections();
  };

  if (loading) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>PARTNERS.</h1>
      </header>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Add Partner</h2>
        {inviteLink ? (
          <div className={styles.inviteBox}>
            <input type="text" readOnly value={inviteLink} className={styles.linkInput} />
            <button onClick={copyLink} className={styles.button}>Copy</button>
          </div>
        ) : (
          <button onClick={generateLink} className={styles.button}>
            Generate Invite Link
          </button>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Circle</h2>
        <div className={styles.list}>
          {connections.map(conn => {
            const isRequester = conn.requesterId === (session?.user as any)?.id;
            const partner = isRequester ? conn.responder : conn.requester;
            
            return (
              <div key={conn.id} className={styles.card}>
                <div className={styles.partnerInfo}>
                  <div className={styles.avatar}>{partner?.name?.charAt(0) || '?'}</div>
                  <div>
                    <div className={styles.name}>{partner?.name || 'Pending Invite'}</div>
                    <div className={styles.status}>{conn.status}</div>
                  </div>
                </div>
                <div className={styles.actions}>
                  {conn.status === 'PENDING' && isRequester && partner && (
                    <button onClick={() => approvePartner(conn.id)} className={styles.approveButton}>
                      Approve
                    </button>
                  )}
                  {conn.status === 'APPROVED' && partner && (
                    <button onClick={() => window.location.href = `/partners/${partner.id}`} className={styles.viewButton}>
                      View
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {connections.length === 0 && (
            <div className={styles.emptyState}>No partners yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
