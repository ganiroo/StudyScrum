
import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`glass rounded-[32px] shadow-xl shadow-slate-200/50 p-6 ${className}`}>
      {children}
    </div>
  );
};
