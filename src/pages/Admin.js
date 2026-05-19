import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'speedsongsupsa@gmail.com'

export default function Admin({ user, onBack }) {
  const [tab, setTab] = useState('movies')
  const [movies, setMovies] = useState([])
  const [featuredMovies, setFeaturedMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [bannerUploading, setBannerUploading] = useState(null) // id du film en cours d'upload

  const [form, setForm] = useState({
    title: '', description: '', release_year: '', duration_min: '',
    type: 'movie', category: '', cover_url: '', video_url: '',
    trending: false, popular: false, new_release: false, featured: false
  })

  const [avatarForm, setAvatarForm] = useState({
    serie: 'Breaking Bad', character_id: '', character_name: '', image_url: ''
  })

  useEffect(() => { loadMovies() }, [])

  useEffect(() => {
    if (tab === 'featured') loadFeaturedMovies()
  }, [tab])

  const loadMovies = async () => {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false })
    setMovies(data || [])
  }

  const loadFeaturedMovies = async () => {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('featured', true)
      .order('featured_order', { ascending: true })
    setFeaturedMovies(data || [])
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
    setMsg('')

    let videoUrl = form.video_url
    const driveMatch = videoUrl.match(/\/d\/([\w-]+)/)
    if (driveMatch) {
      videoUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    }

    const { error } = await supabase.from('movies').insert({
      ...form,
      video_url: videoUrl,
      release_year: parseInt(form.release_year) || null,
      duration_min: parseInt(form.duration_min) || null,
    })
    if (error) setMsg('❌ ' + error.message)
    else {
      setMsg('✅ Film/Série ajouté !')
      setForm({ title: '', description: '', release_year: '', duration_min: '', type: 'movie', category: '', cover_url: '', video_url: '', trending: false, popular: false, new_release: false, featured: false })
      loadMovies()
    }
    setLoading(false)
  }

  const handleDeleteMovie = async (id) => {
    await supabase.from('movies').delete().eq('id', id)
    loadMovies()
  }

  const handleToggle = async (id, field, value) => {
    await supabase.from('movies').update({ [field]: value }).eq('id', id)
    loadMovies()
  }

  const handleUploadCover = async (e, movieId) => {
    const file = e.target.files[0]
    if (!file) return
    const path = `covers/${movieId || Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('covers').getPublicUrl(path)
      if (movieId) {
        await supabase.from('movies').update({ cover_url: data.publicUrl }).eq('id', movieId)
        loadMovies()
        setMsg('✅ Affiche mise à jour !')
      } else {
        setForm(f => ({ ...f, cover_url: data.publicUrl }))
        setMsg('✅ Affiche uploadée !')
      }
    }
  }

  // Upload bannière 16:9 pour "À la une"
  const handleUploadBanner = async (e, movieId) => {
    const file = e.target.files[0]
    if (!file) return
    setBannerUploading(movieId)
    setMsg('')

    // On stocke les bannières dans le bucket "covers" sous un dossier "banners"
    const path = `banners/${movieId}_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('covers').upload(path, file, { upsert: true })
    if (error) {
      setMsg('❌ Erreur upload : ' + error.message)
    } else {
      const { data } = supabase.storage.from('covers').getPublicUrl(path)
      await supabase.from('movies').update({ banner_url: data.publicUrl }).eq('id', movieId)
      setMsg('✅ Bannière mise à jour !')
      loadFeaturedMovies()
    }
    setBannerUploading(null)
  }

  // Déplacer un film dans l'ordre À la une
  const handleMoveOrder = async (movie, direction) => {
    const idx = featuredMovies.findIndex(m => m.id === movie.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= featuredMovies.length) return

    const other = featuredMovies[swapIdx]
    const orderA = movie.featured_order ?? idx
    const orderB = other.featured_order ?? swapIdx

    await Promise.all([
      supabase.from('movies').update({ featured_order: orderB }).eq('id', movie.id),
      supabase.from('movies').update({ featured_order: orderA }).eq('id', other.id),
    ])
    loadFeaturedMovies()
  }

  // Retirer un film de "À la une"
  const handleRemoveFeatured = async (id) => {
    await supabase.from('movies').update({ featured: false, featured_order: null }).eq('id', id)
    loadFeaturedMovies()
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const path = `avatars/${avatarForm.serie}_${avatarForm.character_id}_${file.name}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('avatar_options').upsert({
        serie: avatarForm.serie,
        character_id: avatarForm.character_id,
        character_name: avatarForm.character_name,
        image_url: data.publicUrl
      }, { onConflict: 'character_id' })
      setMsg('✅ Avatar uploadé !')
    }
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

  const checkboxes = [
    { key: 'featured',     label: '⭐ À la une' },
    { key: 'trending',     label: '🔥 Tendance' },
    { key: 'popular',      label: '👍 Populaire' },
    { key: 'new_release',  label: '🆕 Nouveauté' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0 }}>
            🎬 Admin <span style={{ color: '#ff2d55' }}>Cinemax</span>
          </h1>
          <button onClick={onBack} style={{ ...btnStyle(false), border: '1px solid #ff2d55', color: '#ff2d55' }}>
            ← Retour
          </button>
        </div>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button style={btnStyle(tab === 'movies')}  onClick={() => setTab('movies')}>🎬 Films & Séries</button>
          <button style={btnStyle(tab === 'featured')} onClick={() => setTab('featured')}>🎞️ À la une</button>
          <button style={btnStyle(tab === 'avatars')} onClick={() => setTab('avatars')}>👤 Avatars</button>
          <button style={btnStyle(tab === 'list')}    onClick={() => setTab('list')}>📋 Catalogue</button>
        </div>

        {msg && (
          <p style={{ color: msg.startsWith('❌') ? '#ff4444' : '#4caf50', marginBottom: '1rem', fontSize: '14px' }}>
            {msg}
          </p>
        )}

        {/* ─── ONGLET FILMS & SÉRIES ─── */}
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
              <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '4px' }}>🎬 Lien Google Drive de la vidéo :</p>
              <p style={{ color: '#555', fontSize: '11px', marginBottom: '8px' }}>Colle n'importe quel lien Google Drive, la conversion est automatique</p>
              <input style={inputStyle} placeholder="https://drive.google.com/file/d/XXXX/view?usp=sharing" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
              {form.video_url && <p style={{ color: '#4caf50', fontSize: '12px', marginTop: '4px' }}>✅ Lien détecté</p>}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {checkboxes.map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: form[key] ? '#fff' : '#aaa', fontSize: '13px', cursor: 'pointer', background: form[key] ? 'rgba(255,45,85,0.1)' : 'transparent', border: `1px solid ${form[key] ? 'rgba(255,45,85,0.3)' : '#2a2a3e'}`, borderRadius: '8px', padding: '7px 14px', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: '#ff2d55' }} />
                  {label}
                </label>
              ))}
            </div>

            <button onClick={handleAddMovie} disabled={loading || !form.title}
              style={{ ...btnStyle(true), width: '100%', padding: '12px', fontSize: '15px', opacity: !form.title ? 0.5 : 1 }}>
              {loading ? 'Ajout en cours...' : '➕ Ajouter au catalogue'}
            </button>
          </div>
        )}

        {/* ─── ONGLET À LA UNE ─── */}
        {tab === 'featured' && (
          <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', border: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>🎞️ Gestion du Hero — À la une</h2>
              <span style={{ background: 'rgba(255,45,85,0.15)', color: '#ff6b8a', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,45,85,0.25)', fontWeight: '700' }}>
                {featuredMovies.length} film{featuredMovies.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p style={{ color: '#555', fontSize: '12px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Ces films apparaissent dans le slider tout en haut de la page. Upload une image <strong style={{ color: '#888' }}>16:9 haute qualité</strong> pour chaque bannière (recommandé : 1920×1080). L'ordre se change avec les flèches ↑↓.
            </p>

            {featuredMovies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #2a2a3e', borderRadius: '12px' }}>
                <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>Aucun film marqué « À la une ».</p>
                <p style={{ color: '#444', fontSize: '12px', marginTop: '8px' }}>Va dans <strong style={{ color: '#666' }}>Films & Séries</strong> ou <strong style={{ color: '#666' }}>Catalogue</strong> et coche ⭐ À la une.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {featuredMovies.map((m, idx) => (
                  <div key={m.id} style={{ display: 'flex', gap: '16px', background: '#131320', borderRadius: '14px', overflow: 'hidden', border: '1px solid #1e1e35', transition: 'border-color 0.2s' }}>

                    {/* Aperçu bannière 16:9 */}
                    <div style={{ position: 'relative', width: '280px', minWidth: '280px', aspectRatio: '16/9', background: '#0a0a18', overflow: 'hidden', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      {m.banner_url ? (
                        <>
                          <img
                            src={m.banner_url}
                            alt="bannière"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(19,19,32,0.9) 100%)' }} />
                          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: '#4caf50', fontWeight: '600' }}>
                            ✅ Bannière 16:9
                          </div>
                        </>
                      ) : m.cover_url ? (
                        <>
                          <img
                            src={m.cover_url}
                            alt="cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.5) blur(2px)' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '20px' }}>🖼️</span>
                            <span style={{ color: '#f6c90e', fontSize: '10px', fontWeight: '700', textAlign: 'center', padding: '0 12px' }}>Affiche utilisée<br />(upload une bannière 16:9)</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '28px' }}>🎬</span>
                          <span style={{ color: '#444', fontSize: '10px', marginTop: '6px' }}>Pas d'image</span>
                        </>
                      )}
                    </div>

                    {/* Infos + contrôles */}
                    <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Numéro d'ordre */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ background: 'rgba(255,45,85,0.15)', color: '#ff2d55', fontSize: '11px', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx + 1}
                          </span>
                          <p style={{ color: '#fff', fontWeight: '700', margin: 0, fontSize: '15px' }}>{m.title}</p>
                        </div>
                        <p style={{ color: '#666', fontSize: '11px', margin: '0 0 12px' }}>
                          {m.type === 'series' ? 'Série' : 'Film'} · {m.release_year || '—'} · {m.duration_min ? m.duration_min + 'min' : '—'}
                          {m.category ? ` · ${m.category}` : ''}
                        </p>
                      </div>

                      {/* Bouton upload bannière */}
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          background: bannerUploading === m.id ? 'rgba(255,45,85,0.05)' : 'rgba(255,45,85,0.12)',
                          border: '1px solid rgba(255,45,85,0.3)', borderRadius: '8px',
                          color: '#ff6b8a', padding: '8px 16px', fontSize: '12px', fontWeight: '700',
                          cursor: bannerUploading === m.id ? 'wait' : 'pointer', transition: 'all 0.2s'
                        }}>
                          {bannerUploading === m.id ? (
                            <><span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #ff2d55', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Upload en cours...</>
                          ) : (
                            <>📤 {m.banner_url ? 'Changer la bannière 16:9' : 'Uploader une bannière 16:9'}</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={bannerUploading !== null}
                            onChange={e => handleUploadBanner(e, m.id)}
                          />
                        </label>
                        <span style={{ color: '#444', fontSize: '10px', marginLeft: '10px' }}>JPG/PNG · 1920×1080 recommandé</span>
                      </div>

                      {/* Contrôles ordre + retirer */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleMoveOrder(m, 'up')}
                          disabled={idx === 0}
                          style={{ background: idx === 0 ? '#1a1a2e' : '#1e1e35', border: '1px solid #2a2a3e', borderRadius: '7px', color: idx === 0 ? '#333' : '#aaa', padding: '6px 12px', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif', fontWeight: '600'" }}
                          title="Monter dans le slider">
                          ↑ Monter
                        </button>
                        <button
                          onClick={() => handleMoveOrder(m, 'down')}
                          disabled={idx === featuredMovies.length - 1}
                          style={{ background: idx === featuredMovies.length - 1 ? '#1a1a2e' : '#1e1e35', border: '1px solid #2a2a3e', borderRadius: '7px', color: idx === featuredMovies.length - 1 ? '#333' : '#aaa', padding: '6px 12px', cursor: idx === featuredMovies.length - 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}
                          title="Descendre dans le slider">
                          ↓ Descendre
                        </button>
                        <button
                          onClick={() => handleRemoveFeatured(m.id)}
                          style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '7px', color: '#ff4444', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", marginLeft: 'auto' }}
                          title="Retirer de À la une">
                          ✕ Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ONGLET AVATARS ─── */}
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
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>📸 Photo du personnage :</p>
              <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ color: '#aaa', fontSize: '13px' }} />
            </div>
          </div>
        )}

        {/* ─── ONGLET CATALOGUE ─── */}
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
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {[
                          { key: 'featured',    label: '⭐ Une',      color: '#a855f7' },
                          { key: 'trending',    label: '🔥 Trend',    color: '#ff2d55' },
                          { key: 'popular',     label: '👍 Pop',      color: '#f9c74f' },
                          { key: 'new_release', label: '🆕 New',      color: '#06d6a0' },
                          { key: 'video_url',   label: '🎬 Vidéo',    color: '#4caf50', readonly: true },
                        ].map(({ key, label, color, readonly }) => {
                          const active = !!m[key]
                          if (readonly) return active ? (
                            <span key={key} style={{ background: color + '22', color, fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{label}</span>
                          ) : null
                          return (
                            <button key={key} onClick={() => handleToggle(m.id, key, !active)}
                              style={{ background: active ? color + '22' : '#2a2a3e', color: active ? color : '#555', fontSize: '10px', padding: '3px 10px', borderRadius: '4px', border: `1px solid ${active ? color + '44' : 'transparent'}`, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.2s' }}>
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <label style={{ color: '#aaa', fontSize: '11px', cursor: 'pointer' }}>
                        🖼 Affiche
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}