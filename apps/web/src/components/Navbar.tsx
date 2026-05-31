import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, LogOut, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '@tsuzuku/shared-api';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-500/10 dark:border-indigo-500/20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-xl tracking-tighter">つ</span>
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent hidden sm:block">
              Tsuzuku
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/browse"
              className="font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-400 hover:to-orange-400 transition-all duration-300 drop-shadow-sm uppercase mr-2"
            >
              Browse
            </Link>
            {(['ALL', 'WATCHING', 'PLANNING', 'COMPLETED', 'DROPPED'] as const).map(tab => {
              const isActive = isDashboard && location.search.includes(`filter=${tab}`) || (tab === 'ALL' && isDashboard && !location.search);
              return (
                <Link 
                  key={tab}
                  to={`/dashboard${tab === 'ALL' ? '' : `?filter=${tab}`}`} 
                  className={`font-semibold text-sm transition-colors duration-200 capitalize ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.toLowerCase()}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/search"
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Search Anime"
            >
              <Search className="w-5 h-5" />
            </Link>
            
            <a
              href="https://github.com/sukhairkar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group relative font-semibold text-sm"
              title="View on GitHub"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">sukhairkar</span>
            </a>
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-200 group"
                  title="Edit Profile"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative">
                    {user.user_metadata?.avatarUrl ? (
                      <img src={user.user_metadata.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-black text-sm">
                        {(user.user_metadata?.displayName || user.email || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {user.user_metadata?.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 leading-tight">User Profile</span>
                  </div>
                </Link>
              </div>
            ) : (
              <Link 
                to="/auth"
                className="hidden sm:flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
