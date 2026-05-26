-- Create anime_tracking table
create table public.anime_tracking (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    anime_id integer not null,
    title text not null,
    cover_image text,
    progress integer default 0 not null check (progress >= 0),
    status text default 'WATCHING' not null check (status in ('WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED')),
    total_episodes integer check (total_episodes is null or total_episodes >= 0),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index user_id for faster lookups
create index idx_anime_tracking_user_id on public.anime_tracking(user_id);

-- Enable Row-Level Security (RLS)
alter table public.anime_tracking enable row level security;

-- Policies for RLS
create policy "Users can view their own tracking records." 
    on public.anime_tracking for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own tracking records." 
    on public.anime_tracking for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own tracking records." 
    on public.anime_tracking for update 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own tracking records." 
    on public.anime_tracking for delete 
    using (auth.uid() = user_id);
