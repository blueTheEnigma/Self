'use client'

import { useEffect, useState, useRef } from 'react';
import styles from './MomentumFeed.module.css';

interface MomentumItem {
  userId: string;
  userName: string;
  goalTitle: string;
  status: 'DONE' | 'PARTIAL' | 'MISSED';
  effort?: number;
  createdAt?: string;
}

export function MomentumFeed() {
  const [items, setItems] = useState<MomentumItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial history
    fetch('/api/user/momentum')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      });

    // 2. Listen for real-time pulses
    const eventSource = new EventSource('/api/sse');

    eventSource.addEventListener('momentum', (e: any) => {
      const data = JSON.parse(e.data);
      setItems(prev => [data, ...prev].slice(0, 20));
      
      // Gentle vibration if supported
      if ('vibrate' in navigator) navigator.vibrate(50);
    });

    return () => eventSource.close();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={styles.feedContainer}>
      <div className={styles.scrollArea} ref={scrollRef}>
        {items.map((item, idx) => (
          <div key={`${item.userId}-${idx}`} className={styles.feedItem}>
            <div className={styles.avatar}>{item.userName[0]}</div>
            <span className={styles.userName}>{item.userName}</span>
            <span className={styles.action}>hit</span>
            <span className={styles.goalTitle}>{item.goalTitle}</span>
            <span className={`${styles.statusTag} ${styles[item.status.toLowerCase()]}`}>
              {item.status === 'PARTIAL' ? `⚡ ${item.effort}%` : item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
