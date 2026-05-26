import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AnimeCard } from '../components/AnimeCard';
import { CategoryDropdown } from '../components/CategoryDropdown';
import { 
  fetchTrendingAniList, 
  fetchAiringAnime, 
  fetchUpcomingAnime,
  parseAnimeTitle,
  addTrack
} from '@tsuzuku/shared-api';
import type { AniListMedia, AnimeTrackEntry } from '@tsuzuku/shared-api';
import { useTracks } from '../context/TracksContext';
import { Sparkles, PlayCircle, Calendar, Plus, ChevronRight } from 'lucide-react';

export default function BrowsePage() {
  const { tracks, addTrackToState } = useTracks();
  const [trending, setTrending] = useState<AniListMedia[]>([]);
  const [airing, setAiring] = useState<AniListMedia[]>([]);
  const [upcoming, setUpcoming] = useState<AniListMedia[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingAniList().then(setTrending);
    fetchAiringAnime().then(setAiring);
    fetchUpcomingAnime().then(setUpcoming);
  }, []);

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

  const heroAnime = trending.find(a => a.bannerImage) || trending[0];

  const renderCarousel = (title: string, icon: React.ReactNode, list: AniListMedia[]) => (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white drop-shadow-md">
          {icon}
          {title}
        </h2>
        <button className="text-sm font-bold text-slate-400 hover:text-white flex items-center transition-colors">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-6 px-4 md:px-8 scroll-smooth snap-x snap-mandatory">
        {list.map(anime => {
          const trackEntry = tracks.find(t => t.anime_id === anime.id);
          const trackedStatus = trackEntry?.status;
          const progress = trackEntry?.progress || 0;
          return (
            <div key={anime.id} className="w-40 md:w-48 flex-shrink-0 snap-start relative group">
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
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans relative pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl shadow-xl border border-emerald-500/30 bg-emerald-950/90 text-emerald-400 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Section */}
      {heroAnime?.bannerImage && (
        <div className="relative w-full h-[60vh] md:h-[70vh] z-20">
          <div className="absolute inset-0">
            <img 
              src={heroAnime.bannerImage} 
              alt="Hero Backdrop" 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
          </div>
          
          <div className="absolute z-50 top-0 w-full">
            <Navbar />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 flex flex-col items-start z-20">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl max-w-3xl">
              {parseAnimeTitle(heroAnime.title)}
            </h1>
            
            {heroAnime.description && (
              <p 
                className="text-slate-300 max-w-2xl mb-8 line-clamp-3 font-medium text-lg drop-shadow-lg"
                dangerouslySetInnerHTML={{ __html: heroAnime.description }}
              />
            )}
            
            <div className="flex items-center gap-4 relative">
              <CategoryDropdown variant="hero" onSelect={(status) => handleQuickAdd(heroAnime, status)} />
            </div>
          </div>
        </div>
      )}

      {/* Without Hero fallback */}
      {!heroAnime?.bannerImage && (
        <div className="pt-24 pb-8">
          <Navbar />
        </div>
      )}

      {/* Browse Genres List */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-6 relative z-30">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400 mr-2 shrink-0">
             Genres:
          </span>
          {["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"].map(g => (
            <Link
              key={g}
              to={`/search?genre=${encodeURIComponent(g)}`}
              className="shrink-0 snap-start px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105"
            >
              {g}
            </Link>
          ))}
        </div>
      </div>

      {/* Content Rows */}
      <main className="relative z-10 w-full mx-auto space-y-12 mt-12">
        {trending.length > 0 && renderCarousel("Trending Now", <Sparkles className="w-6 h-6 text-indigo-400" />, trending)}
        {airing.length > 0 && renderCarousel("Currently Airing", <PlayCircle className="w-6 h-6 text-emerald-400" />, airing)}
        {upcoming.length > 0 && renderCarousel("Upcoming Seasons", <Calendar className="w-6 h-6 text-purple-400" />, upcoming)}
      </main>
    </div>
  );
}
