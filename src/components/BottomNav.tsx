import React from 'react';
import { Swords, Layers, BookOpen, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'duel', label: 'Duelo', icon: Swords },
    { id: 'decks', label: 'Decks', icon: Layers },
    { id: 'album', label: 'Coleção', icon: BookOpen },
    { id: 'tournaments', label: 'Torneio', icon: Trophy },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="bottom-nav no-print">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon className="nav-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
