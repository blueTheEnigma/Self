'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function InviteContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
    else setError('Invalid invite link. No token provided.');
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated' && token) {
      // Pass the current full URL as callback so they return here after login/register
      const currentUrl = encodeURIComponent(`/partners/invite?token=${token}`);
      router.push(`/register?callbackUrl=${currentUrl}`);
    }
  }, [status, token, router]);

  const handleAccept = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    
    const res = await fetch('/api/partners/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/partners'), 2000);
    } else {
      setError(data.error || 'Failed to accept invitation.');
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-2)' }}>Loading...</div>;
  }

  return (
    <div className="page-center">
      <div className="card-elevated" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-1)' }}>Partner Invitation</h1>
        
        {success ? (
          <div>
            <div className="success-msg" style={{ marginBottom: '1rem' }}>
              Invitation accepted! Waiting for final approval.
            </div>
            <p style={{ color: 'var(--text-2)' }}>Redirecting to partners page...</p>
          </div>
        ) : error ? (
          <div>
            <div className="error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>
            <button onClick={() => router.push('/partners')} className="btn btn-ghost btn-full">
              Go to Partners
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-2)', marginBottom: '2rem' }}>
              You have been invited to connect! Accept the invitation to share progress and nudges.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={handleAccept} 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Accept Invitation'}
              </button>
              <button onClick={() => router.push('/partners')} className="btn btn-ghost btn-full">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PartnerInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-2)' }}>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
