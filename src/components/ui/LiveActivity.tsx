'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'new' | 'buy' | 'sell' | 'graduated';
  token: string;
  amount?: string;
  trader?: string;
  timestamp: number;
}

export default function LiveActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/market/activity');
        const data = await res.json();
        if (data.activities) {
          setActivities(data.activities);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '4px 16px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      height: '100%',
      fontSize: '12px',
      color: '#888',
    }}>
      <span style={{ color: '#00C805', fontWeight: 600 }}>● LIVE</span>
      {activities.slice(0, 10).map((act) => {
        let color = '#888';
        let icon = '';
        if (act.type === 'buy') { color = '#00C805'; icon = '🟢'; }
        else if (act.type === 'sell') { color = '#FF3B30'; icon = '🔴'; }
        else if (act.type === 'new') { color = '#FFA500'; icon = '🆕'; }
        else if (act.type === 'graduated') { color = '#4A90D9'; icon = '🔵'; }
        return (
          <span key={act.id} style={{ color }}>
            {icon} {act.token} {act.type === 'buy' ? 'buy' : act.type === 'sell' ? 'sell' : act.type}
            {act.amount && ` ${act.amount} ETH`}
            {act.trader && ` by ${act.trader.slice(0, 6)}...`}
          </span>
        );
      })}
    </div>
  );
}
