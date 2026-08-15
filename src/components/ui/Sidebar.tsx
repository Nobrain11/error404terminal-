'use client';

import { Home, Sparkles, TrendingUp, TrendingDown, BarChart2, Bookmark, Flame } from 'lucide-react';

interface SidebarNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'discover', label: 'Discover', icon: Home },
  { id: 'new', label: 'New', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
  { id: 'losers', label: 'Top Losers', icon: TrendingDown },
  { id: 'volume', label: 'Volume', icon: BarChart2 },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
];

export default function SidebarNav({ activeCategory, onCategoryChange }: SidebarNavProps) {
  return (
    <nav style={{
      width: '56px',
      backgroundColor: '#0a0a0b',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '8px',
      gap: '2px',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? '#1a1a1a' : 'transparent',
              color: isActive ? '#00C805' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '9px',
              gap: '1px',
              transition: 'background 0.15s',
            }}
            title={cat.label}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span style={{ fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {cat.label.length > 6 ? cat.label.slice(0, 6) : cat.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
