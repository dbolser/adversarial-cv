import React from 'react';

interface TerminalProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  title, 
  children, 
  className = "",
  borderColor = "border-slate-700" 
}) => {
  return (
    <div className={`bg-slate-950 border ${borderColor} rounded-lg overflow-hidden shadow-xl flex flex-col ${className}`}>
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between select-none">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
      </div>
      <div className="p-4 flex-grow overflow-auto font-mono text-sm relative">
        {children}
      </div>
    </div>
  );
};