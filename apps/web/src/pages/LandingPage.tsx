import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Shield, Zap } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { fetchTrendingAniList } from '@tsuzuku/shared-api';
import type { AniListMedia } from '@tsuzuku/shared-api';

export default function LandingPage() {
  const [heroAnime, setHeroAnime] = useState<AniListMedia | null>(null);

  useEffect(() => {
    fetchTrendingAniList().then(res => {
      const bannerAnime = res.find(a => a.bannerImage) || res[0];
      setHeroAnime(bannerAnime);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 transition-colors duration-300 overflow-hidden font-sans relative">
      
      {/* Massive Hero Background Image */}
      {heroAnime?.bannerImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={heroAnime.bannerImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          {/* Gradient to blend background into the page */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
        </div>
      )}

      {/* Decorative Gradients (Fallback/Accent) */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-screen">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center min-h-[70vh] justify-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm mb-8 border border-indigo-500/30 backdrop-blur-md">
          <Star className="w-4 h-4" />
          <span>The next-generation anime tracker</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8 text-white drop-shadow-2xl">
          Never lose track of your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            anime journey.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 font-medium leading-relaxed drop-shadow-md">
          Tsuzuku is a stunning, lightning-fast cross-platform application for tracking what you watch, what you plan to watch, and what you've dropped. Powered by real-time sync.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <button className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-lg">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </div>
      </main>

      {/* Feature Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast</h3>
          <p className="text-slate-400 font-medium">Built on modern architecture ensuring your dashboard loads instantly.</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
            <Star className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">AniList Powered</h3>
          <p className="text-slate-400 font-medium">Access millions of anime titles with live metadata via AniList's API.</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">Cross-Platform Sync</h3>
          <p className="text-slate-400 font-medium">Your progress syncs flawlessly between web and mobile devices in real-time.</p>
        </div>
      </div>
    </div>
  );
}
