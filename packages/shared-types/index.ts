export interface AnimeTrackEntry {
  id: string;
  user_id: string;
  anime_id: number;
  title: string;
  cover_image: string | null;
  progress: number;
  status: 'WATCHING' | 'PLANNING' | 'COMPLETED' | 'DROPPED';
  total_episodes: number | null;
  updated_at: string;
}
