import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'speedsongsupsa@gmail.com'

export default function Admin({ user, onBack }) {
  const [tab, setTab] = useState('movies')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', release_year: '', duration_min: '',
    type: 'movie', category: '', cover_url: '', video_url: '',
    trending: false, popular: false, new_release: false
  })

  const [avatarForm, setAvatarForm] = useState({
    serie: 'Breaking Bad', character_id: '', character_name: ''
  })

  useEffect(() => { loadMovies() }, [])

  const loadMovies = async () => {
    const { data, error } = await supabase.from('movies').select('*').order('created_at', { ascending: false })
    console.log('loadMovies:', data, error)
    setMovies(data || [])
  }

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>
        <p style={{ color: '#ff2d55', fontSize: '20px' }}>⛔ Accès refusé</p>
      </div>
    )
  }

  const handleAddMovie = async () => {
    setLoading(true)
    setMsg('⏳ Ajout en cours...')
    let videoUrl = form.video_url
    const driveMatch = videoUrl.match(/\/d\/([\w-]+)/)
    if (driveMatch) {
      videoUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }
    const { data, error } = await supabase.from('movies').insert({
      ...form,
      video_url: videoUrl,
      release_year: parseInt(form.release_year) || null,
      duration_min: parseInt(form.duration_min) || null,
    })
    console.log('insert movie:', data, error)
    if (error) setMsg('❌ ' + error.message)
    else {
      setMsg('✅ Film/Série ajouté !')
      setForm({ title: '', description: '', release_year: '', duration_min: '', type: 'movie', category: '', cover_url: '', video_url: '', trending: false, popular: false, new_release: false })
      loadMovies()
    }
    setLoading(false)
  }

  const handleDeleteMovie = async (id) => {
    const { error } = await supabase.from('movies').delete().eq('id', id)
    console.log('delete:', error)
    loadMovies()
  }

  const handleUploadCover = async (e, movieId) => {
    const file = e.target.files[0]
    if (!file) return
    setMsg('⏳ Upload affiche en cours...')
    const path = `covers/${movieId || Date.now()}_${file.name}`
    const { data: uploadData, error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
    console.log('upload cover:', uploadData, error)
    if (error) { setMsg('❌ Upload échoué: ' + error.message); return }
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    if (movieId) {
      const { error: updateError } = await supabase.from('movies').update({ cover_url: data.publicUrl }).eq('id', movieId)
      console.log('update cover_url:', updateError)
      if (updateError) { setMsg('❌ ' + updateError.message); return }
      loadMovies()
      setMsg('✅ Affiche mise à jour !')
    } else {
      setForm(f => ({ ...f, cover_url: data.publicUrl }))
      setMsg('✅ Affiche uploadée !')
    }
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMsg('⏳ Upload avatar en cours...')
    const path = `avatars/${avatarForm.serie}_${avatarForm.character_id}_${file.name}`
    const { data: uploadData, error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    console.log('upload avatar:', uploadData, error)
    if (error) { setMsg('❌ Upload avatar échoué: ' + error.message); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error: upsertError } = await supabase.from('avatar_options').upsert({
      serie: avatarForm.serie,
      character_id: avatarForm.character_id,
      character_name: avatarForm.character_name,
      image_url: data.publicUrl
    }, { onConflict: 'character_id' })
    console.log('upsert avatar:', upsertError)
    if (upsertError) { setMsg('❌ ' + upsertError.message); return }
    setMsg('✅ Avatar uploadé !')
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#1a1a2e', border: '1px solid #2a2a3e',
    borderRadius: '8px', color: '#fff', fontFamily: "'Poppins', sans-serif", fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', marginBottom: '10px'
  }

  const btnStyle = (active) => ({
    padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#ff2d55' : '#1a1a2e', color: '#fff',
    fontFamily: "'Poppins', sans-serif", fontSize: '13px', fontWeight: '600'
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            🎬 Admin <span style={{ color: '#ff2d55' }}>Cinemax</span>
          </h1>
          <button onClick={onBack} style={{ ...btnStyle(false), border: '1px solid #ff2d55', color: '#ff2d55' }}>
            ← Retour
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <button style={btnStyle(tab === 'movies')} onClick={() => setTab('movies')}>🎬 Films & Séries</button>
          <button style={btnStyle(tab === 'avatars')} onClick={() => setTab('avatars')}>👤 Avatars</button>
          <button style={btnStyle(tab === 'list')} onClick={() => setTab('list')}>📋 Catalogue</button>
        </div>

        {msg && (
          <p style={{ color: msg.startsWith('❌') ? '#ff4444' : msg.startsWith('⏳') ? '#f9c74f' : '#4caf50', marginBottom: '1rem', fontSize: '14px' }}>
            {msg}
          </p>
        )}

        {tab === 'movies' && (
          <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1a1a2e' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '1.5rem' }}>➕ Ajouter un film ou une série</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input style={inputStyle} placeholder="Titre *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <select style={inputStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="movie">Film</option>
                <option value="series">Série</option>
              </select>
              <input style={inputStyle} placeholder="Année (ex: 2024)" value={form.release_year} onChange={e => setForm(f => ({ ...f, release_year: e.target.value }))} />
              <input style={inputStyle} placeholder="Durée en minutes" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} />
              <input style={inputStyle} placeholder="Catégorie (Action, Drame...)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <div style={{ background: '#1a1a2e', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
              <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>📸 Affiche du film :</p>
              <input type="file" accept="image/*" onChange={e => handleUploadCover(e, null)} style={{ color: '#aaa', fontSize: '13px' }} />
              {form.cover_url && <img src={form.cover_url} alt="" style={{ width: '80px', borderRadius: '8px', marginTop: '8px', display: 'block' }} />}
            </div>

            <div style={{ background: '#1a1a2e', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '4px' }}>🎬 Lien Google Drive :</p>
              <p style={{ color: '#555', fontSize: '11px', marginBottom: '8px' }}>Colle n'importe quel lien Google Drive, la conversion est automatique</p>
              <input style={inputStyle} placeholder="https://drive.google.com/file/d/XXXX/view" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
              {form.video_url && <p style={{ color: '#4caf50', fontSize: '12px', marginTop: '4px' }}>✅ Lien détecté</p>}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {['trending', 'popular', 'new_release'].map(key => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                  {key === 'trending' ? '🔥 Tendance' : key === 'popular' ? '⭐ Populaire' : '🆕 Nouveauté'}
                </label>
              ))}
            </div>

            <button onClick={handleAddMovie} disabled={loading || !form.title}
              style={{ ...btnStyle(true), width: '100%', padding: '12px', fontSize: '15px', opacity: !form.title ? 0.5 : 1 }}>
              {loading ? 'Ajout en cours...' : '➕ Ajouter au catalogue'}
            </button>
          </div>
        )}

        {tab === 'avatars' && (
          <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1a1a2e' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '1.5rem' }}>👤 Uploader une photo de profil</h2>
            <select style={inputStyle} value={avatarForm.serie} onChange={e => setAvatarForm(f => ({ ...f, serie: e.target.value }))}>
              <option>Breaking Bad</option>
              <option>La Casa de Papel</option>
              <option>Squid Game</option>
              <option>Mercredi</option>
            </select>
            <input style={inputStyle} placeholder="ID du personnage (ex: heisenberg)" value={avatarForm.character_id} onChange={e => setAvatarForm(f => ({ ...f, character_id: e.target.value }))} />
            <input style={inputStyle} placeholder="Nom du personnage (ex: Heisenberg)" value={avatarForm.character_name} onChange={e => setAvatarForm(f => ({ ...f, character_name: e.target.value }))} />
            <div style={{ background: '#1a1a2e', borderRadius: '10px', padding: '14px' }}>
              <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>📸 Photo du personnage :</p>
              <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ color: '#aaa', fontSize: '13px' }} />
            </div>
          </div>
        )}

        {tab === 'list' && (
          <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1a1a2e' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '1.5rem' }}>📋 Catalogue ({movies.length} titres)</h2>
            {movies.length === 0 ? (
              <p style={{ color: '#555', fontSize: '14px' }}>Aucun film ajouté pour l'instant.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {movies.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1a1a2e', borderRadius: '10px', padding: '12px' }}>
                    {m.cover_url
                      ? <img src={m.cover_url} alt="" style={{ width: '45px', height: '65px', borderRadius: '6px', objectFit: 'cover' }} />
                      : <div style={{ width: '45px', height: '65px', borderRadius: '6px', background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>
                    }
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontWeight: '600', margin: 0, fontSize: '14px' }}>{m.title}</p>
                      <p style={{ color: '#aaa', fontSize: '12px', margin: '2px 0' }}>{m.type === 'series' ? 'Série' : 'Film'} • {m.release_year} • {m.duration_min}min</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {m.trending && <span style={{ background: '#ff2d5522', color: '#ff2d55', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>🔥 Trending</span>}
                        {m.popular && <span style={{ background: '#f9c74f22', color: '#f9c74f', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>⭐ Popular</span>}
                        {m.new_release && <span style={{ background: '#06d6a022', color: '#06d6a0', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>🆕 New</span>}
                        {m.video_url && <span style={{ background: '#4caf5022', color: '#4caf50', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>🎬 Vidéo OK</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <label style={{ color: '#aaa', fontSize: '11px', cursor: 'pointer' }}>
                        🖼 Changer affiche
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUploadCover(e, m.id)} />
                      </label>
                      <button onClick={() => handleDeleteMovie(m.id)}
                        style={{ background: 'transparent', border: '1px solid #ff2d55', borderRadius: '6px', color: '#ff2d55', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}