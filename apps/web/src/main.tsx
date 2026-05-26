import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeSupabase } from '@tsuzuku/shared-api'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseAnonKey) {
  initializeSupabase(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL or Anon Key is missing. Database features will not work.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
