import { useState, useEffect, useRef } from 'react';

import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '@tsuzuku/shared-api';
import { User, Settings, Save, Sparkles, Loader2, UploadCloud } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = getSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.displayName || '');
      setBio(user.user_metadata?.bio || '');
      setAvatarUrl(user.user_metadata?.avatarUrl || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const currentName = user?.user_metadata?.displayName || '';
      let newHistory: number[] = user?.user_metadata?.nameChangeHistory || [];
      
      const isChangingName = currentName !== displayName.trim();
      
      if (isChangingName) {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        newHistory = newHistory.filter(time => time > oneDayAgo);
        
        if (newHistory.length >= 2) {
          throw new Error('You can only change your display name twice every 24 hours.');
        }
        
        newHistory.push(now);
      }

      let finalAvatarUrl = avatarUrl;

      // Handle file upload if a new file was selected
      if (avatarFile && user) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl: finalAvatarUrl,
          nameChangeHistory: newHistory
        }
      });

      if (error) throw error;

      setAvatarUrl(finalAvatarUrl);
      showNotification('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const initial = (displayName || user.email || '?').charAt(0).toUpperCase();
  const displayAvatarUrl = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300 flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
      </div>

      <Navbar />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl shadow-xl border backdrop-blur-md animate-bounce ${notification.includes('can only change') || notification.includes('Failed') ? 'border-rose-500/30 bg-rose-950/90 text-rose-400' : 'border-emerald-500/30 bg-emerald-950/90 text-emerald-400'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col items-center">
        <div className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Profile Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Customize your public identity</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300 overflow-hidden relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {displayAvatarUrl ? (
                  <img src={displayAvatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; setAvatarUrl(''); }} />
                ) : (
                  <span className="text-5xl font-black text-white">{initial}</span>
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
                  <UploadCloud className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">Upload</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 dark:text-white max-w-[150px] truncate">{displayName || 'Anonymous'}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 w-full space-y-6">
              
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4" /> Display Name
                </label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 dark:text-white"
                  placeholder="e.g. NarutoLover99"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500">You can only change your name twice every 24 hours.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Short Bio
                </label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-900 dark:text-white min-h-[100px] resize-y"
                  placeholder="What's your favorite anime?"
                  maxLength={160}
                />
                <p className="text-xs text-slate-400 font-medium text-right">{bio.length}/160</p>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-4 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Save Changes
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </main>
    </div>
  );
}
