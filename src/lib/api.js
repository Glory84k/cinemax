import { supabase } from './supabase'

export const getMovies = async () => {
  const { data } = await supabase.from('movies').select('*')
  return data || []
}

export const getTrending = async () => {
  const { data } = await supabase.from('movies').select('*').eq('trending', true)
  return data || []
}

export const getPopular = async () => {
  const { data } = await supabase.from('movies').select('*').eq('popular', true)
  return data || []
}

export const getNewReleases = async () => {
  const { data } = await supabase.from('movies').select('*').eq('new_release', true)
  return data || []
}

export const addToFavorites = async (userId, movieId) => {
  await supabase.from('favorites').insert({ user_id: userId, movie_id: movieId })
}

export const saveProgress = async (userId, movieId, seconds) => {
  await supabase.from('watch_history').upsert({
    user_id: userId, movie_id: movieId, progress_seconds: seconds, last_watched: new Date()
  }, { onConflict: 'user_id,movie_id' })
}