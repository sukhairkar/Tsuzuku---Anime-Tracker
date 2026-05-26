import type { AnimeTrackEntry } from '@tsuzuku/shared-types';

export interface AniListMedia {
  id: number;
  title: {
    english: string | null;
    romaji: string | null;
  };
  coverImage: {
    extraLarge?: string;
    large: string;
    medium: string;
    color?: string;
  } | null;
  episodes: number | null;
  description?: string;
  genres?: string[];
  bannerImage?: string;
  status?: string;
  nextAiringEpisode?: { episode: number } | null;
}

const ANILIST_URL = 'https://graphql.anilist.co';

/**
 * Fallback title parser: use English if present; if null, use Romaji.
 */
export function parseAnimeTitle(title: { english: string | null; romaji: string | null } | null | undefined): string {
  if (!title) return 'Unknown Title';
  return title.english || title.romaji || 'Unknown Title';
}

/**
 * Fetch Anime from AniList by Search Query and/or Genre
 */
export async function searchAniListAnime(query?: string, genre?: string, sort?: string): Promise<AniListMedia[]> {
  const graphqlQuery = `
    query ($search: String, $genreIn: [String], $sort: [MediaSort]) {
      Page(page: 1, perPage: 24) {
        media(search: $search, genre_in: $genreIn, type: ANIME, sort: $sort) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            medium
          }
          episodes
          status
          nextAiringEpisode {
            episode
          }
          description
          genres
          bannerImage
        }
      }
    }
  `;

  try {
    const variables: any = {
      sort: sort ? [sort] : ['POPULARITY_DESC']
    };
    if (query?.trim()) variables.search = query.trim();
    if (genre?.trim()) variables.genreIn = [genre.trim()];

    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables,
      }),
    });

    const json = await response.json();
    if (json.errors) {
      console.error('AniList API Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'AniList query failed');
    }

    return json.data?.Page?.media || [];
  } catch (error) {
    console.error('Failed fetching AniList search results:', error);
    return [];
  }
}

/**
 * Fetch Trending Anime from AniList for Dashboard
 */
export async function fetchTrendingAniList(): Promise<AniListMedia[]> {
  const graphqlQuery = `
    query {
      Page(page: 1, perPage: 12) {
        media(sort: [TRENDING_DESC, POPULARITY_DESC], type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            medium
          }
          episodes
          status
          nextAiringEpisode {
            episode
          }
          description
          genres
          bannerImage
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
      }),
    });

    const json = await response.json();
    if (json.errors) {
      console.error('AniList API Errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'AniList query failed');
    }

    return json.data?.Page?.media || [];
  } catch (error) {
    console.error('Failed fetching AniList trending results:', error);
    return [];
  }
}

export async function fetchAiringAnime(): Promise<AniListMedia[]> {
  const graphqlQuery = `
    query {
      Page(page: 1, perPage: 12) {
        media(status: RELEASING, sort: [POPULARITY_DESC], type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            medium
          }
          episodes
          status
          nextAiringEpisode {
            episode
          }
          description
          genres
          bannerImage
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const json = await response.json();
    return json.data?.Page?.media || [];
  } catch (error) {
    console.error('Failed fetching AniList airing results:', error);
    return [];
  }
}

export async function fetchUpcomingAnime(): Promise<AniListMedia[]> {
  const graphqlQuery = `
    query {
      Page(page: 1, perPage: 12) {
        media(status: NOT_YET_RELEASED, sort: [POPULARITY_DESC], type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            medium
          }
          episodes
          description
          genres
          bannerImage
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const json = await response.json();
    return json.data?.Page?.media || [];
  } catch (error) {
    console.error('Failed fetching AniList upcoming results:', error);
    return [];
  }
}

export async function fetchLiveAnimeData(ids: number[]): Promise<Record<number, { releasedEpisodes: number | null, totalEpisodes: number | null, status: string, genres: string[] }>> {
  if (!ids || ids.length === 0) return {};

  const graphqlQuery = `
    query ($idIn: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $idIn, type: ANIME) {
          id
          episodes
          status
          genres
          nextAiringEpisode {
            episode
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: graphqlQuery, variables: { idIn: ids } }),
    });

    const json = await response.json();
    const media = json.data?.Page?.media || [];
    
    const result: Record<number, { releasedEpisodes: number | null, totalEpisodes: number | null, status: string, genres: string[] }> = {};
    media.forEach((m: any) => {
      let released = m.episodes; // If FINISHED, released is total episodes
      if (m.nextAiringEpisode?.episode) {
        released = m.nextAiringEpisode.episode - 1;
      } else if (m.status === 'RELEASING' && !m.nextAiringEpisode) {
        // Edge case: sometimes RELEASING but nextAiringEpisode is null (e.g. hiatus)
        // We just don't know the exact released count easily, fallback to null or guess
        released = null;
      } else if (m.status === 'NOT_YET_RELEASED') {
        released = 0;
      }
      
      result[m.id] = {
        releasedEpisodes: released,
        totalEpisodes: m.episodes,
        status: m.status,
        genres: m.genres || []
      };
    });
    
    return result;
  } catch (error) {
    console.error('Failed fetching live anime data:', error);
    return {};
  }
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase DB Singleton
let supabase: SupabaseClient | null = null;

/**
 * Initialize the Supabase Client. Call this once at your app root.
 */
export function initializeSupabase(url: string, anonKey: string) {
  if (!supabase) {
    supabase = createClient(url, anonKey);
  }
  return supabase;
}

/**
 * Get the Supabase client instance
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) throw new Error("Supabase client not initialized.");
  return supabase;
}

/**
 * Fetch all tracking entries for a user
 */
export async function fetchUserTracks(): Promise<AnimeTrackEntry[]> {
  if (!supabase) throw new Error("Supabase client not initialized.");
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('anime_tracks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching tracks:', error);
    throw new Error(error.message);
  }

  return data as AnimeTrackEntry[];
}

/**
 * Add a new anime to tracking
 */
export async function addTrack(track: Omit<AnimeTrackEntry, 'id' | 'updated_at' | 'user_id'>): Promise<AnimeTrackEntry> {
  if (!supabase) throw new Error("Supabase client not initialized.");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('anime_tracks')
    .insert([{ ...track, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error adding track:', error);
    throw new Error(error.message);
  }

  return data as AnimeTrackEntry;
}

/**
 * Update an existing tracking entry's progress or status
 */
export async function updateTrack(
  trackId: string | number, 
  updates: Partial<Pick<AnimeTrackEntry, 'progress' | 'status'>>
): Promise<AnimeTrackEntry> {
  if (!supabase) throw new Error("Supabase client not initialized.");

  const { data, error } = await supabase
    .from('anime_tracks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', String(trackId))
    .select()
    .single();

  if (error) {
    console.error('Error updating track:', error);
    throw new Error(error.message);
  }

  return data as AnimeTrackEntry;
}

/**
 * Delete a tracking entry
 */
export async function deleteTrack(trackId: string | number): Promise<void> {
  if (!supabase) throw new Error("Supabase client not initialized.");

  const { error } = await supabase
    .from('anime_tracks')
    .delete()
    .eq('id', String(trackId));

  if (error) {
    console.error('Error deleting track:', error);
    throw new Error(error.message);
  }
}
