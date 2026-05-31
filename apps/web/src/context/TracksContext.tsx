import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AnimeTrackEntry } from '@tsuzuku/shared-types';
import { fetchUserTracks, fetchLiveAnimeData } from '@tsuzuku/shared-api';
import { useAuth } from './AuthContext';

export type LiveAnimeData = {
  releasedEpisodes: number | null;
  totalEpisodes: number | null;
  status: string;
  genres: string[];
};

interface TracksContextType {
  tracks: AnimeTrackEntry[];
  liveData: Record<number, LiveAnimeData>;
  isLoading: boolean;
  refreshTracks: () => Promise<void>;
  addTrackToState: (track: AnimeTrackEntry) => void;
  updateTrackInState: (animeId: number, updates: Partial<AnimeTrackEntry>) => void;
  removeTrackFromState: (animeId: number) => void;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

export function TracksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<AnimeTrackEntry[]>([]);
  const [liveData, setLiveData] = useState<Record<number, LiveAnimeData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadTracks = async () => {
    if (!user) {
      setTracks([]);
      setLiveData({});
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchUserTracks();
      setTracks(data);
      
      const ids = data.map(t => t.anime_id);
      if (ids.length > 0) {
        const live = await fetchLiveAnimeData(ids);
        setLiveData(live);
      }
    } catch (e) {
      console.error('Failed to load user tracks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, [user]);

  const addTrackToState = (track: AnimeTrackEntry) => {
    setTracks(prev => [track, ...prev]);
  };

  const updateTrackInState = (animeId: number, updates: Partial<AnimeTrackEntry>) => {
    setTracks(prev => prev.map(t => t.anime_id === animeId ? { ...t, ...updates } : t));
  };

  const removeTrackFromState = (animeId: number) => {
    setTracks(prev => prev.filter(t => t.anime_id !== animeId));
  };

  return (
    <TracksContext.Provider value={{
      tracks,
      liveData,
      isLoading,
      refreshTracks: loadTracks,
      addTrackToState,
      updateTrackInState,
      removeTrackFromState
    }}>
      {children}
    </TracksContext.Provider>
  );
}

export function useTracks() {
  const context = useContext(TracksContext);
  if (context === undefined) {
    throw new Error('useTracks must be used within a TracksProvider');
  }
  return context;
}
