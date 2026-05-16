import { supabase } from './supabase'

export const getTrending = async () => {
  const { data } = await supabase
    .from('movies')
    .select('id, title, description, cover_url, video_url, category, type, release_year, duration_min')
    .eq('trending', true)
    .limit(10)
  return data || []
}

export const getPopular = async () => {
  const { data } = await supabase
    .from('movies')
    .select('id, title, description, cover_url, video_url, category, type, release_year, duration_min')
    .eq('popular', true)
    .limit(10)
  return data || []
}

export const getNewReleases = async () => {
  const { data } = await supabase
    .from('movies')
    .select('id, title, description, cover_url, video_url, category, type, release_year, duration_min')
    .eq('new_release', true)
    .limit(10)
  return data || []
}