import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'cinemax-auth',
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 1,
      },
    },
  }
)