import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (...args) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        return fetch(...args, { signal: controller.signal })
          .finally(() => clearTimeout(timeout))
      }
    }
  }
)