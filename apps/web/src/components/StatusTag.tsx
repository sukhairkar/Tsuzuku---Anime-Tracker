import React from 'react';
import type { AnimeTrackEntry } from '@tsuzuku/shared-types';

interface StatusTagProps {
  status: AnimeTrackEntry['status'];
  onChange?: (newStatus: AnimeTrackEntry['status']) => void;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, onChange }) => {
  const getColors = (stat: AnimeTrackEntry['status']) => {
    switch (stat) {
      case 'WATCHING':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'PLANNING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DROPPED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
  };

  const statuses: AnimeTrackEntry['status'][] = ['WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED'];

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onChange(statuses[nextIndex]);
  };

  return (
    <button
      onClick={cycleStatus}
      disabled={!onChange}
      className={`px-2.5 py-1 text-xs font-semibold tracking-wider rounded-full border transition-all duration-300 transform active:scale-95 select-none ${getColors(status)} ${
        onChange ? 'cursor-pointer hover:shadow-sm hover:brightness-115' : 'cursor-default'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'WATCHING' ? 'bg-emerald-500 animate-pulse' :
          status === 'PLANNING' ? 'bg-amber-500' :
          status === 'COMPLETED' ? 'bg-blue-500' : 'bg-rose-500'
        }`} />
        {status}
      </span>
    </button>
  );
};
