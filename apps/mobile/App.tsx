import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AnimeTrackEntry } from '@tsuzuku/shared-types';
import { getMockTrackEntries, searchAniListAnime, fetchTrendingAniList, parseAnimeTitle, AniListMedia } from '@tsuzuku/shared-api';

// --- Custom Portable SVG Icons for React Native (Clean slate aesthetic) ---
const HomeIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 16, height: 16, borderWidth: 2, borderColor: color, borderRadius: 3 }} />
  </View>
);

const SearchIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 12, height: 12, borderWidth: 2, borderColor: color, borderRadius: 6 }} />
    <View style={{ width: 5, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }], position: 'absolute', bottom: 3, right: 3 }} />
  </View>
);

const UserIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 8, height: 8, borderWidth: 2, borderColor: color, borderRadius: 4 }} />
    <View style={{ width: 16, height: 6, borderWidth: 2, borderColor: color, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginTop: 1 }} />
  </View>
);

// Global state container simulated for mobile preview
let mobileTracksStore: AnimeTrackEntry[] = getMockTrackEntries();
let listeners: Array<() => void> = [];

const useMobileStore = () => {
  const [tracks, setTracks] = useState<AnimeTrackEntry[]>(mobileTracksStore);
  
  useEffect(() => {
    const onChange = () => setTracks([...mobileTracksStore]);
    listeners.push(onChange);
    return () => {
      listeners = listeners.filter(l => l !== onChange);
    };
  }, []);

  const updateTracks = (newTracks: AnimeTrackEntry[]) => {
    mobileTracksStore = newTracks;
    listeners.forEach(l => l());
  };

  return [tracks, updateTracks] as const;
};

// --- Home Screen ---
function HomeScreen() {
  const [tracks, setTracks] = useMobileStore();

  const continueWatching = tracks.filter(t => t.status === 'WATCHING');
  const otherShows = tracks.filter(t => t.status !== 'WATCHING');

  const incrementProgress = (id: string) => {
    const updated = tracks.map(track => {
      if (track.id === id) {
        const nextProgress = track.progress + 1;
        const total = track.total_episodes || 999;
        if (nextProgress > total) return track;
        return {
          ...track,
          progress: nextProgress,
          status: nextProgress === total ? 'COMPLETED' as const : track.status,
          updated_at: new Date().toISOString()
        };
      }
      return track;
    });
    setTracks(updated);
  };

  const cycleStatus = (id: string) => {
    const statuses: AnimeTrackEntry['status'][] = ['WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED'];
    const updated = tracks.map(track => {
      if (track.id === id) {
        const nextIdx = (statuses.indexOf(track.status) + 1) % statuses.length;
        const nextStatus = statuses[nextIdx];
        let nextProgress = track.progress;
        if (nextStatus === 'COMPLETED' && track.total_episodes) {
          nextProgress = track.total_episodes;
        } else if (nextStatus === 'PLANNING') {
          nextProgress = 0;
        }
        return {
          ...track,
          status: nextStatus,
          progress: nextProgress,
          updated_at: new Date().toISOString()
        };
      }
      return track;
    });
    setTracks(updated);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-4">
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
        
        {/* Header Title */}
        <View className="mb-6">
          <Text className="text-2xl font-black text-white">つづく Tsuzuku</Text>
          <Text className="text-slate-400 text-xs mt-1">Cross-Platform Anime Tracking</Text>
        </View>

        {/* Continue Watching Horizontal Scroller */}
        <View className="mb-8">
          <Text className="text-base font-bold text-slate-200 mb-3 flex items-center">
            📺 Continue Watching
          </Text>
          
          {continueWatching.length === 0 ? (
            <View className="p-6 border border-dashed border-slate-800 rounded-2xl items-center bg-slate-900/30">
              <Text className="text-slate-400 text-xs text-center">No shows in progress. Switch a show status below to Watching.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {continueWatching.map(item => {
                const percent = item.total_episodes ? (item.progress / item.total_episodes) * 100 : 0;
                return (
                  <View key={item.id} className="w-56 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mr-4 p-3 justify-between">
                    <View className="relative">
                      {item.cover_image && (
                        <Image source={{ uri: item.cover_image }} className="w-full h-32 rounded-xl object-cover" />
                      )}
                      
                      {/* Increment button overlay */}
                      <TouchableOpacity 
                        onPress={() => incrementProgress(item.id)}
                        className="absolute top-2 right-2 bg-emerald-500 w-8 h-8 rounded-full justify-center items-center shadow-lg active:scale-95"
                      >
                        <Text className="text-white font-bold text-base">+</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text className="text-white font-bold text-sm mt-3.5" numberOfLines={1}>
                      {item.title}
                    </Text>
                    
                    <View className="flex-row justify-between items-center mt-2.5">
                      <TouchableOpacity onPress={() => cycleStatus(item.id)} className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Text className="text-emerald-400 font-semibold text-[10px]">{item.status}</Text>
                      </TouchableOpacity>
                      <Text className="text-slate-400 text-[10px] font-bold">
                        EP {item.progress}/{item.total_episodes || '?'}
                      </Text>
                    </View>

                    {/* Progress Slider */}
                    <View className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <View style={{ width: `${percent}%` }} className="h-full bg-emerald-400" />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Library Lists */}
        <View className="mb-10">
          <Text className="text-base font-bold text-slate-200 mb-3">
            📚 Workspace Library
          </Text>

          {otherShows.map(item => (
            <View key={item.id} className="flex-row bg-slate-900 border border-slate-800/80 rounded-xl p-3 mb-3 items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                {item.cover_image && (
                  <Image source={{ uri: item.cover_image }} className="w-10 h-14 rounded-lg mr-3" />
                )}
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title}</Text>
                  <TouchableOpacity onPress={() => cycleStatus(item.id)} className="self-start mt-1 bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full">
                    <Text className="text-slate-300 font-semibold text-[9px]">{item.status}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => {
                    const updated = tracks.map(t => t.id === item.id ? { ...t, progress: Math.max(0, t.progress - 1) } : t);
                    setTracks(updated);
                  }}
                  className="w-7 h-7 bg-slate-800 border border-slate-700 rounded justify-center items-center"
                >
                  <Text className="text-slate-400 font-bold text-xs">-</Text>
                </TouchableOpacity>

                <Text className="text-white font-bold text-xs w-12 text-center">
                  {item.progress}/{item.total_episodes || '?'}
                </Text>

                <TouchableOpacity 
                  onPress={() => incrementProgress(item.id)}
                  className="w-7 h-7 bg-slate-800 border border-slate-700 rounded justify-center items-center"
                >
                  <Text className="text-slate-400 font-bold text-xs">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Search Screen ---
function SearchScreen() {
  const [tracks, setTracks] = useMobileStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AniListMedia[]>([]);
  const [trending, setTrending] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrendingAniList().then(res => setTrending(res));
  }, []);

  const triggerSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAniListAnime(text);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = (anime: AniListMedia) => {
    const exists = tracks.some(t => t.anime_id === anime.id);
    if (exists) return;

    const newTrack: AnimeTrackEntry = {
      id: `mobile-custom-${Date.now()}`,
      user_id: 'user-123',
      anime_id: anime.id,
      title: parseAnimeTitle(anime.title),
      cover_image: anime.coverImage?.large || null,
      progress: 0,
      status: 'PLANNING',
      total_episodes: anime.episodes,
      updated_at: new Date().toISOString()
    };
    setTracks([newTrack, ...tracks]);
  };

  const listToShow = query ? results : trending.slice(0, 10);

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-4">
      <View className="mt-4 flex-row items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 mb-4">
        <Text className="text-slate-500 mr-2">🔍</Text>
        <TextInput 
          value={query}
          onChangeText={triggerSearch}
          placeholder="Search AniList anime base..."
          placeholderTextColor="#64748b"
          className="text-white text-sm flex-1 p-0"
        />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#10b981" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-3">
            {query ? 'Search Results' : '🔥 Trending Today'}
          </Text>

          {listToShow.map(anime => {
            const added = tracks.some(t => t.anime_id === anime.id);
            return (
              <View key={anime.id} className="flex-row items-center justify-between bg-slate-900/50 border border-slate-900 p-2 rounded-xl mb-2.5">
                <View className="flex-row items-center flex-1 mr-2">
                  {anime.coverImage && (
                    <Image source={{ uri: anime.coverImage.large }} className="w-9 h-12 rounded mr-3" />
                  )}
                  <View className="flex-1">
                    <Text className="text-white font-bold text-xs" numberOfLines={1}>{parseAnimeTitle(anime.title)}</Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5">{anime.episodes ? `${anime.episodes} EP` : 'Ongoing'}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => addToLibrary(anime)}
                  disabled={added}
                  className={`px-3 py-1.5 rounded-lg border ${
                    added ? 'bg-slate-800 border-slate-800' : 'bg-emerald-500 border-emerald-500'
                  }`}
                >
                  <Text className="text-white font-bold text-[10px]">
                    {added ? 'Tracked' : '+ Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// --- Profile Screen ---
function ProfileScreen() {
  const [tracks] = useMobileStore();

  const totalTracked = tracks.length;
  const completed = tracks.filter(t => t.status === 'COMPLETED').length;
  const watching = tracks.filter(t => t.status === 'WATCHING').length;
  const episodesCount = tracks.reduce((sum, item) => sum + item.progress, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-4 justify-center">
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false} className="mt-8">
        
        {/* User Card */}
        <View className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full justify-center items-center mb-4">
          <Text className="text-2xl text-emerald-400">👤</Text>
        </View>

        <Text className="text-xl font-bold text-white">Anime Tracker User</Text>
        <Text className="text-slate-500 text-xs mt-1">Syncing to Supabase Cloud</Text>

        {/* Stats Grid */}
        <View className="w-full flex-row flex-wrap justify-between mt-8">
          
          <View className="w-[47%] bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Shows</Text>
            <Text className="text-2xl font-black text-white">{totalTracked}</Text>
          </View>

          <View className="w-[47%] bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Episodes Watched</Text>
            <Text className="text-2xl font-black text-white">{episodesCount}</Text>
          </View>

          <View className="w-[47%] bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Watching</Text>
            <Text className="text-2xl font-black text-emerald-400">{watching}</Text>
          </View>

          <View className="w-[47%] bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 items-center">
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Completed</Text>
            <Text className="text-2xl font-black text-teal-400">{completed}</Text>
          </View>
        </View>

        {/* Sync Info Banner */}
        <View className="w-full bg-slate-900/50 border border-slate-800 p-3.5 rounded-xl items-center mt-6">
          <Text className="text-slate-400 text-[11px] text-center leading-relaxed">
            ⚡ Offline changes are cached and will auto-sync once Supabase connection keys are provided.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Main Navigation Router ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#020617', // slate-950
            borderTopColor: '#1e293b', // slate-800
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#10b981', // emerald-500
          tabBarInactiveTintColor: '#64748b', // slate-500
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{
            tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({ color }) => <UserIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
