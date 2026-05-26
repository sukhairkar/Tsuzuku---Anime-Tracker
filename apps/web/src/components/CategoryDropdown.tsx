import { useState, useRef, useEffect } from 'react';
import type { AnimeTrackEntry } from '@tsuzuku/shared-types';
import { Plus, PlayCircle, Calendar, CheckCircle2, XCircle, ChevronDown, List } from 'lucide-react';

interface CategoryDropdownProps {
  onSelect: (status: AnimeTrackEntry['status']) => void;
  variant?: 'compact' | 'hero' | 'icon';
}

export function CategoryDropdown({ onSelect, variant = 'compact' }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status: AnimeTrackEntry['status']) => {
    onSelect(status);
    setIsOpen(false);
  };

  const options: { label: string; value: AnimeTrackEntry['status']; icon: any; color: string }[] = [
    { label: 'Watching', value: 'WATCHING', icon: PlayCircle, color: 'text-emerald-400' },
    { label: 'Planning', value: 'PLANNING', icon: Calendar, color: 'text-amber-400' },
    { label: 'Completed', value: 'COMPLETED', icon: CheckCircle2, color: 'text-blue-400' },
    { label: 'Dropped', value: 'DROPPED', icon: XCircle, color: 'text-rose-400' },
  ];

  if (variant === 'hero') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 font-black rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-xl"
        >
          <Plus className="w-6 h-6" />
          Add to Tracker
          <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-3 w-full bg-slate-950/95 backdrop-blur-3xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-slate-800/50 transition-colors group"
              >
                <option.icon className={`w-5 h-5 ${option.color} group-hover:scale-110 transition-transform`} />
                <span className="font-bold text-slate-200 group-hover:text-white">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="p-1.5 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-500 rounded transition-colors"
          title="Change Status"
        >
          <List className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-[999] animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <option.icon className={`w-4 h-4 ${option.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold text-xs text-slate-300 group-hover:text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact Variant (for Carousels & Search Modal)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-indigo-500/25 w-full"
      >
        <Plus className="w-4 h-4" />
        Add
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <option.icon className={`w-4 h-4 ${option.color} group-hover:scale-110 transition-transform`} />
                <span className="font-semibold text-xs text-slate-300 group-hover:text-white">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
