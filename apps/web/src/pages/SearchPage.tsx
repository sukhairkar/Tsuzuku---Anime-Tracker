import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AnimeCard } from '../components/AnimeCard';
import { CategoryDropdown } from '../components/CategoryDropdown';
import { searchAniListAnime, parseAnimeTitle, addTrack, type AniListMedia } from '@tsuzuku/shared-api';
import type { AnimeTrackEntry } from '@tsuzuku/shared-types';
import { useTracks } from '../context/TracksContext';
import { Search, Loader2, Sparkles, Frown, Tag, ArrowDownWideNarrow } from 'lucide-react';

const POPULAR_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Mecha", "Music", "Mystery", "Psychological", 
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
];

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'POPULARITY_DESC' },
  { label: 'Trending', value: 'TRENDING_DESC' },
  { label: 'Top Rated', value: 'SCORE_DESC' },
  { label: 'Newest', value: 'START_DATE_DESC' }
];

export default function SearchPage() {
  const { tracks, addTrackToState } = useTracks();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'POPULARITY_DESC';
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<AniListMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // If neither query nor genre is present, clear results
    if (!query.trim() && !genre.trim()) {
      setResults([]);
      return;
    }
    
    let isMounted = true;
    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const data = await searchAniListAnime(query, genre, sort);
        if (isMounted) setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    
    fetchResults();
    
    return () => { isMounted = false; };
  }, [query, genre, sort]);

  const updateParams = (updates: { q?: string, genre?: string, sort?: string }) => {
    const newParams: Record<string, string> = {};
    if (updates.q !== undefined ? updates.q : query) newParams.q = updates.q !== undefined ? updates.q : query;
    if (updates.genre !== undefined ? updates.genre : genre) newParams.genre = updates.genre !== undefined ? updates.genre : genre;
    if (updates.sort !== undefined ? updates.sort : sort) newParams.sort = updates.sort !== undefined ? updates.sort : sort;
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() });
  };

  const toggleGenre = (g: string) => {
    updateParams({ genre: genre === g ? '' : g });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value });
  };

  const handleQuickAdd = async (anime: AniListMedia, status: AnimeTrackEntry['status'] = 'PLANNING') => {
    try {
      const success = await addTrack({
        anime_id: anime.id,
        title: parseAnimeTitle(anime.title),
        cover_image: anime.coverImage?.large || null,
        total_episodes: anime.episodes || null,
        progress: status === 'COMPLETED' ? (anime.episodes || 0) : 0,
        status: status
      });
      if (success) {
        addTrackToState(success);
        setNotification(`Added ${parseAnimeTitle(anime.title)} to ${status.toLowerCase()}!`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('User not authenticated')) {
        setNotification('Please Sign In to track anime.');
      } else {
        setNotification(`Failed to add ${parseAnimeTitle(anime.title)}`);
      }
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl shadow-xl border border-emerald-500/30 bg-emerald-950/90 text-emerald-400 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Search Header */}
        <div className="w-full max-w-2xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm">
            Search Anime
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full group flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                autoFocus
                className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
                placeholder="What do you want to watch?"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 px-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
              >
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto shrink-0 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <ArrowDownWideNarrow className="h-5 w-5 text-indigo-500" />
              </div>
              <select
                value={sort}
                onChange={handleSortChange}
                className="w-full sm:w-48 pl-12 pr-10 py-4 appearance-none cursor-pointer bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400 mr-2">
              <Tag className="w-4 h-4" /> Genres
            </span>
            {POPULAR_GENRES.map(g => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                  genre === g 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 scale-105 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="w-full">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-semibold text-lg animate-pulse text-slate-600 dark:text-slate-400">Searching the database...</p>
            </div>
          ) : query || genre ? (
            results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 w-full pb-20">
                {results.map((anime) => {
                  const trackEntry = tracks.find(t => t.anime_id === anime.id);
                  const trackedStatus = trackEntry?.status;
                  const progress = trackEntry?.progress || 0;
                  return (
                    <div key={anime.id} className="w-full relative group">
                      <AnimeCard
                        id={anime.id}
                        title={parseAnimeTitle(anime.title)}
                        coverImage={anime.coverImage?.large || ''}
                        episodes={anime.episodes}
                        progress={progress}
                        status="PLANNING"
                        trackedStatus={trackedStatus}
                        releaseStatus={anime.status}
                        type="TV"
                        layout="poster"
                        showActions={false}
                      />
                      {/* Quick Add Overlay */}
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 text-center z-20">
                        <CategoryDropdown onSelect={(status) => handleQuickAdd(anime, status)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Frown className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No results found</h3>
                <p className="mt-2 text-slate-500">Try adjusting your filters</p>
              </div>
            )
          ) : null}
        </div>
      </main>
    </div>
  );
}
