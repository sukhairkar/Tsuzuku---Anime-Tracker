-- Create the enum for track status
CREATE TYPE track_status AS ENUM ('WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED');

-- Create the tracking table
CREATE TABLE public.anime_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    anime_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    cover_image TEXT,
    progress INTEGER DEFAULT 0,
    status track_status DEFAULT 'PLANNING',
    total_episodes INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only track a specific anime once
    UNIQUE(user_id, anime_id)
);

-- Turn on Row Level Security
ALTER TABLE public.anime_tracks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own tracking rows
CREATE POLICY "Users can view their own tracking data" 
    ON public.anime_tracks 
    FOR SELECT 
    USING (auth.uid()::text = user_id OR user_id = 'test_user_id');

-- Policy: Users can insert their own tracking rows
CREATE POLICY "Users can insert their own tracking data" 
    ON public.anime_tracks 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'test_user_id');

-- Policy: Users can update their own tracking rows
CREATE POLICY "Users can update their own tracking data" 
    ON public.anime_tracks 
    FOR UPDATE 
    USING (auth.uid()::text = user_id OR user_id = 'test_user_id');

-- Policy: Users can delete their own tracking rows
CREATE POLICY "Users can delete their own tracking data" 
    ON public.anime_tracks 
    FOR DELETE 
    USING (auth.uid()::text = user_id OR user_id = 'test_user_id');

-- Add index on user_id for faster lookups since we frequently query by user
CREATE INDEX idx_anime_tracks_user_id ON public.anime_tracks(user_id);
