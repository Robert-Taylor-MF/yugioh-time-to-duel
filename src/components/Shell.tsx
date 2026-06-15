import React from 'react';
import { useApp } from '../context/AppContext';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { profile } = useApp();
  const themeClass = profile?.theme ? `theme-${profile.theme}` : 'theme-default';

  return (
    <div className="app-wrapper">
      <div className={`app-shell ${themeClass}`}>
        {children}
      </div>
    </div>
  );
};
