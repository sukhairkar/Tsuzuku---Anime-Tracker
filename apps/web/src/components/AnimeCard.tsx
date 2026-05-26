import { Play, Plus, Minus, Trash2, Tv } from 'lucide-react';
import { StatusTag } from './StatusTag';
import { CategoryDropdown } from './CategoryDropdown';

export interface AnimeCardProps {
  id: string | number;
  title: string;
  coverImage: string | null;
  episodes?: number | null;
  progress?: number;
  status?: 'WATCHING' | 'PLANNING' | 'COMPLETED' | 'DROPPED';
  releaseStatus?: string;
  trackedStatus?: 'WATCHING' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | string;
  type?: string; // e.g. "TV", "Movie"
  layout?: 'poster' | 'landscape';
  showActions?: boolean;
  onIncrement?: (id: string | number) => void;
  onDecrement?: (id: string | number) => void;
  onCustomProgress?: (id: string | number, progress: number) => void;
  onStatusChange?: (id: string | number, newStatus: any) => void;
  onDelete?: (id: string | number, title: string) => void;
  onClick?: () => void;
}

export function AnimeCard({
  id,
  title,
  coverImage,
  episodes,
  progress,
  status,
  releaseStatus,
  trackedStatus,
  type = 'TV',
  layout = 'poster',
  showActions = false,
  onIncrement,
  onDecrement,
  onCustomProgress,
  onStatusChange,
  onDelete,
  onClick
}: AnimeCardProps) {
  const percentage = (episodes && progress) 
    ? Math.min((progress / episodes) * 100, 100) 
    : 0;

  // HiAnime style poster layout
  if (layout === 'poster') {
    return (
      <div className="group flex flex-col gap-2 w-full cursor-pointer h-full" onClick={onClick}>
        {/* Poster Container */}
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Tv className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-xs font-bold px-2 text-center">{title}</span>
            </div>
          )}

          {/* Tracked Indicator Badge */}
          {trackedStatus && (
            <div className={`absolute top-2 right-2 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-lg border flex items-center gap-1 z-10 ${
              trackedStatus === 'WATCHING' ? 'bg-emerald-500/90 text-white border-emerald-400/50' :
              trackedStatus === 'PLANNING' ? 'bg-amber-500/90 text-white border-amber-400/50' :
              trackedStatus === 'COMPLETED' ? 'bg-blue-500/90 text-white border-blue-400/50' :
              trackedStatus === 'DROPPED' ? 'bg-rose-500/90 text-white border-rose-400/50' :
              'bg-slate-500/90 text-white border-slate-400/50'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              {trackedStatus}
            </div>
          )}

          {/* Top Badges (HiAnime style) */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            {episodes && (
              <div className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                EP {progress !== undefined ? `${progress}/` : ''}{episodes}
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1">
            {type && (
              <div className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                {type}
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-indigo-500/90 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Bottom Progress Bar (if tracking) */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/60">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Text Metadata below image */}
        <div className="flex flex-col px-0.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors h-[2.5rem]">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {releaseStatus && (
              <span className={`px-1.5 py-0.5 rounded uppercase text-[9px] font-bold tracking-wider ${
                releaseStatus === 'RELEASING' ? 'bg-emerald-500/10 text-emerald-500' :
                releaseStatus === 'FINISHED' ? 'bg-blue-500/10 text-blue-500' :
                releaseStatus === 'NOT_YET_RELEASED' ? 'bg-amber-500/10 text-amber-500' :
                'bg-slate-500/10 text-slate-500'
              }`}>
                {releaseStatus.replace(/_/g, ' ')}
              </span>
            )}
            {type && <span>{type}</span>}
            {episodes && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                <span>{episodes}m</span>
              </>
            )}
          </div>
        </div>

        {/* Tracking Actions */}
        {showActions && (
          <div className="mt-3 flex flex-col gap-2 z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full">
              <StatusTag 
                status={status || 'PLANNING'} 
                onChange={(newStatus) => onStatusChange?.(id, newStatus)} 
              />
              <div className="flex items-center gap-1">
                <CategoryDropdown 
                  variant="icon" 
                  onSelect={(newStatus) => onStatusChange?.(id, newStatus)} 
                />
                <button 
                  onClick={() => onDelete?.(id, title)}
                  className="p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded transition-colors"
                  title="Delete from tracking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 w-full border border-slate-200 dark:border-slate-700/50">
              <button
                onClick={() => onDecrement?.(id)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md transition-colors"
                title="Decrease episode"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div 
                className="flex flex-col items-center flex-1 px-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded transition-colors"
                title="Set exact episode"
                onClick={(e) => {
                  e.stopPropagation();
                  const newEp = window.prompt(`Enter current episode for ${title}:`, String(progress || 0));
                  if (newEp !== null) {
                    const num = parseInt(newEp, 10);
                    if (!isNaN(num) && num >= 0) {
                      onCustomProgress?.(id, num);
                    }
                  }
                }}
              >
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                  EP {progress} <span className="text-slate-400 font-medium">/ {episodes || '?'}</span>
                </span>
              </div>
              <button
                onClick={() => onIncrement?.(id)}
                className="p-1.5 hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                title="Increase episode"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Landscape Layout (for Continue Watching list)
  return (
    <div className="flex-shrink-0 w-72 snap-start border border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group cursor-pointer" onClick={onClick}>
      <div className="relative h-40 bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}

        {/* Tracked Indicator Badge */}
        {trackedStatus && (
          <div className={`absolute top-2 left-2 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-lg border flex items-center gap-1 z-20 ${
            trackedStatus === 'WATCHING' ? 'bg-emerald-500/90 text-white border-emerald-400/50' :
            trackedStatus === 'PLANNING' ? 'bg-amber-500/90 text-white border-amber-400/50' :
            trackedStatus === 'COMPLETED' ? 'bg-blue-500/90 text-white border-blue-400/50' :
            trackedStatus === 'DROPPED' ? 'bg-rose-500/90 text-white border-rose-400/50' :
            'bg-slate-500/90 text-white border-slate-400/50'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            {trackedStatus}
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-indigo-500/90 text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Blur Backdrop overlay for title */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded self-start mb-1.5 backdrop-blur-md">
            EP {progress} {episodes ? `/ ${episodes}` : ''}
          </span>
          <h3 className="font-bold text-white text-sm line-clamp-1">{title}</h3>
        </div>

        {/* Fast Action Quick Increment + Button */}
        {showActions && (
          <button
            onClick={(e) => { e.stopPropagation(); onIncrement?.(id); }}
            className="absolute top-3 right-3 p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            title="Increment episode"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {showActions && (
        <div className="p-4 space-y-3 bg-white dark:bg-slate-900 z-10 relative" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <StatusTag 
              status={status || 'WATCHING'} 
              onChange={(newStatus) => onStatusChange?.(id, newStatus)} 
            />
            <div className="flex items-center gap-1">
              <CategoryDropdown 
                variant="icon" 
                onSelect={(newStatus) => onStatusChange?.(id, newStatus)} 
              />
              <button 
                onClick={() => onDelete?.(id, title)}
                className="p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded transition-colors duration-150"
                title="Delete from tracking"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-semibold">
                {episodes ? `${Math.round(percentage)}% watched` : 'Ongoing show'}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onDecrement?.(id); }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span 
                  className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-8 text-center cursor-pointer hover:text-indigo-500 transition-colors"
                  title="Set exact episode"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newEp = window.prompt(`Enter current episode for ${title}:`, String(progress || 0));
                    if (newEp !== null) {
                      const num = parseInt(newEp, 10);
                      if (!isNaN(num) && num >= 0) {
                        onCustomProgress?.(id, num);
                      }
                    }
                  }}
                >
                  {progress}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onIncrement?.(id); }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500 ease-out" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
