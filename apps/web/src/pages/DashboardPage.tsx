import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTracks } from '../context/TracksContext';
import type { AnimeTrackEntry } from '@tsuzuku/shared-types';
import { AnimeCard } from '../components/AnimeCard';
import { updateTrack, deleteTrack } from '@tsuzuku/shared-api';
import { Sparkles, BookOpen, Tag } from 'lucide-react';
import { Navbar } from '../components/Navbar';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { tracks, liveData, updateTrackInState, removeTrackFromState, refreshTracks } = useTracks();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter = (searchParams.get('filter') as AnimeTrackEntry['status']) || 'ALL';
  const selectedGenre = searchParams.get('genre') || '';
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuickIncrement = async (trackId: string | number) => {
    const track = tracks.find(t => t.id === String(trackId));
    if (!track) return;

    const nextProgress = track.progress + 1;
    const isCompleted = track.total_episodes && nextProgress >= track.total_episodes;
    const nextStatus = isCompleted ? 'COMPLETED' : track.status;

    updateTrackInState(track.anime_id, { progress: nextProgress, status: nextStatus });

    try {
      await updateTrack(track.id, { progress: nextProgress, status: nextStatus });
    } catch (e) {
      console.error(e);
      refreshTracks();
      showNotification('Failed to update progress.');
    }
  };

  const handleQuickDecrement = async (trackId: string | number) => {
    const track = tracks.find(t => t.id === String(trackId));
    if (!track || track.progress <= 0) return;

    const nextProgress = track.progress - 1;
    updateTrackInState(track.anime_id, { progress: nextProgress });

    try {
      await updateTrack(track.id, { progress: nextProgress });
    } catch (e) {
      console.error(e);
      refreshTracks();
      showNotification('Failed to update progress.');
    }
  };

  const handleCustomProgress = async (trackId: string | number, nextProgress: number) => {
    const track = tracks.find(t => t.id === String(trackId));
    if (!track) return;

    if (nextProgress < 0) nextProgress = 0;
    updateTrackInState(track.anime_id, { progress: nextProgress });

    try {
      await updateTrack(track.id, { progress: nextProgress });
    } catch (e) {
      console.error(e);
      refreshTracks();
      showNotification('Failed to set progress.');
    }
  };

  const handleStatusChange = async (trackId: string | number, newStatus: AnimeTrackEntry['status']) => {
    const track = tracks.find(t => t.id === String(trackId));
    if (!track) return;

    let newProgress = track.progress;
    if (newStatus === 'COMPLETED') {
      const maxEpisodes = track.total_episodes || liveData[track.anime_id]?.releasedEpisodes;
      if (maxEpisodes) {
        newProgress = maxEpisodes;
      }
    }

    updateTrackInState(track.anime_id, { status: newStatus, progress: newProgress });

    try {
      await updateTrack(String(trackId), { status: newStatus, progress: newProgress });
    } catch (e) {
      console.error(e);
      refreshTracks();
      showNotification('Failed to update status.');
    }
  };

  const handleDeleteTrack = async (trackId: string | number, title?: string) => {
    const track = tracks.find(t => t.id === String(trackId));
    if (!track) return;

    removeTrackFromState(track.anime_id);

    try {
      await deleteTrack(trackId);
      showNotification(title ? `Removed ${title} from tracker` : 'Anime removed from tracker');
    } catch (e) {
      console.error(e);
      refreshTracks();
      showNotification('Failed to delete track.');
    }
  };

  // Derive unique genres from tracked anime, and include a baseline of popular genres
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>([
      "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
      "Horror", "Mecha", "Music", "Mystery", "Psychological", 
      "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
    ]);
    tracks.forEach(track => {
      const g = liveData[track.anime_id]?.genres || [];
      g.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [tracks, liveData]);

  // Filter list by both status and genre
  const filteredList = useMemo(() => {
    return tracks.filter(t => {
      const matchesStatus = selectedFilter === 'ALL' || t.status === selectedFilter;
      const matchesGenre = !selectedGenre || liveData[t.anime_id]?.genres?.includes(selectedGenre);
      return matchesStatus && matchesGenre;
    });
  }, [tracks, liveData, selectedFilter, selectedGenre]);

  const toggleGenre = (g: string) => {
    const newParams: Record<string, string> = {};
    if (selectedFilter !== 'ALL') newParams.filter = selectedFilter;
    if (selectedGenre !== g) newParams.genre = g; // toggle on
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen pb-16 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient Background Gradient for Extra Color */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl shadow-xl border border-indigo-500/30 bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        
        {/* Genre Filter Strip */}
        {uniqueGenres.length > 0 && (
          <div className="mb-6 pb-2 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2 shrink-0 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" /> Genres
              </span>
              {uniqueGenres.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                    selectedGenre === g 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 scale-105 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* My Library Grid Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <BookOpen className="w-6 h-6 text-purple-500" />
              Anime Library ({filteredList.length})
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSearchParams(tab === 'ALL' ? (selectedGenre ? { genre: selectedGenre } : {}) : { filter: tab, ...(selectedGenre ? { genre: selectedGenre } : {}) })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 capitalize ${
                    selectedFilter === tab
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              No entries found matching this filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 w-full">
              {filteredList.map(track => (
                <div key={track.id} className="w-full">
                  <AnimeCard
                    id={track.id}
                    title={track.title}
                    coverImage={track.cover_image}
                    episodes={liveData[track.anime_id]?.releasedEpisodes ?? track.total_episodes}
                    progress={track.progress}
                    status={track.status}
                    releaseStatus={liveData[track.anime_id]?.status}
                    type="TV"
                    layout="poster"
                    showActions={true}
                    onIncrement={handleQuickIncrement}
                    onDecrement={handleQuickDecrement}
                    onCustomProgress={handleCustomProgress}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTrack}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
