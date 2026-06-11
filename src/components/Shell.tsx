import React from 'react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="app-wrapper">
      <div className="app-shell">
        {children}
      </div>
    </div>
  );
};
