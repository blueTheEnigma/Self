'use client'

import { useEffect, useState } from 'react';
import styles from './EffortHeatmap.module.css';

interface HeatmapData {
  [date: string]: { color: string; effort: number }[];
}

export function EffortHeatmap() {
  const [data, setData] = useState<HeatmapData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/heatmap')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) return <div className={styles.heatmapContainer}>Loading Heatmap...</div>;

  return (
    <div className={styles.heatmapContainer}>
      <h3 className={styles.title}>Effort Mosaic</h3>
      <div className={styles.grid}>
        {days.map(day => {
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayData = data[dateStr] || [];

          return (
            <div key={day} className={styles.daySquare}>
              <span className={styles.dayNumber}>{day}</span>
              {dayData.length > 0 ? (
                dayData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={styles.mosaicTile} 
                    style={{ 
                      backgroundColor: item.color,
                      opacity: 0.2 + (item.effort / 100) * 0.8
                    }} 
                  />
                ))
              ) : (
                <div className={`${styles.mosaicTile} ${styles.empty}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span>Lower Effort</span>
        <span>Higher Effort</span>
      </div>
    </div>
  );
}
