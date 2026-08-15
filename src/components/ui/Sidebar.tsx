'use client';

import {
  Home,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Bookmark,
  Flame,
} from 'lucide-react';

interface SidebarProps {
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

export default function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  return (
    <nav className="terminal-sidebar">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            title={cat.label}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
            <span className="sidebar-label">{cat.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
