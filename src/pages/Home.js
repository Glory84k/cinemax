import { useState, useEffect } from 'react'
import { getTrending, getPopular, getNewReleases } from '../lib/api'

const ADMIN_EMAIL = 'speedsongsupsa@gmail.com'

const placeholderColors = ['#1a1a2e','#16213e','#0f3460','#533483','#2b2d42','#e63946','#457b9d','#2d6a4f','#f4a261']

function getColor(id) {
  return placeholderColors[id % placeholderColors.length]
}

function AvatarBubble({ profile, size = 34 }) {
  const fontSize = size * 0.38
  if (profile?.avatar_image_url) {
    return (
      <img
        src={profile.avatar_image_url}
        alt={profile.avatar_name || 'Avatar'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,45,85,0.7)', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: profile?.avatar_color || '#333',
      border: '2px solid rgba(255,45,85,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: '700', color: '#fff', fontFamily: "'Poppins', sans-serif",
    }}>
      {profile?.avatar_initials || '?'}
    </div>
  )
}

function MovieCard({ movie, index, onClick, onPlay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: '160px', height: '240px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : getColor(index),
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered ? '0 8px 30px rgba(255,45,85,0.5)' : '0 2px 10px rgba(0,0,0,0.4)'
      }}>
      {!movie.cover_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🎬</div>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: hovered ? 'linear-gradient(transparent, rgba(0,0,0,0.97))' : 'linear-gradient(transparent, rgba(0,0,0,0.75))',
        padding: '1rem 0.75rem 0.75rem', transition: 'all 0.3s'
      }}>
        <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600', margin: 0 }}>{movie.title}</p>
        {hovered && (
          <div style={{ marginTop: '6px' }}>
            <p style={{ color: '#aaa', fontSize: '10px', margin: '0 0 6px' }}>{movie.release_year} • {movie.duration_min}min</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {movie.video_url && (
                <button onClick={e => { e.stopPropagation(); onPlay(movie) }}
                  style={{ background: '#ff2d55', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>
                  ▶ Regarder
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); onClick(movie) }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' }}>
                ℹ️ Infos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      minWidth: '160px', height: '240px', borderRadius: '10px', flexShrink: 0,
      background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
    }} />
  )
}

function MovieRow({ title, movies, loading, onMovieClick, onPlayClick }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '1rem', paddingLeft: '2rem' }}>{title}</h2>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.length === 0
            ? <p style={{ color: '#444', fontSize: '13px', fontStyle: 'italic' }}>Aucun contenu disponible...</p>
            : movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} onClick={onMovieClick} onPlay={onPlayClick} />)
        }
      </div>
    </div>
  )
}

function HeroSlider({ movies, onPlay }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (movies.length === 0) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % movies.length), 5000)
    return () => clearInterval(timer)
  }, [movies])

  if (movies.length === 0) return (
    <div style={{ height: '55vh', background: 'linear-gradient(135deg, #1a0010, #0a0a0f)', display: 'flex', alignItems: 'center', paddingLeft: '2rem', paddingTop: '80px' }}>
      <div>
        <p style={{ color: '#ff2d55', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>🔥 À la une</p>
        <h2 style={{ color: '#fff', fontSize: '44px', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.1 }}>Bienvenue sur<br /><span style={{ color: '#ff2d55' }}>Cinemax</span></h2>
        <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '400px' }}>Films & Séries en streaming. Regarde ce que tu veux, quand tu veux.</p>
      </div>
    </div>
  )

  const movie = movies[current]
  return (
    <div style={{ height: '55vh', position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : 'linear-gradient(135deg, #1a0010, #0a0a0f)',
        transition: 'all 0.8s ease', filter: 'brightness(0.4)'
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.9) 40%, transparent)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>🔥 À la une</p>
        <h2 style={{ color: '#fff', fontSize: '42px', fontWeight: '800', margin: '0 0 10px', lineHeight: 1.1, maxWidth: '500px' }}>{movie.title}</h2>
        <p style={{ color: '#bbb', fontSize: '13px', marginBottom: '6px' }}>{movie.release_year} • {movie.duration_min}min • {movie.category}</p>
        <p style={{ color: '#aaa', fontSize: '13px', maxWidth: '420px', marginBottom: '1.5rem', lineHeight: 1.6 }}>{movie.description?.slice(0, 120)}...</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {movie.video_url && (
            <button onClick={() => onPlay(movie)}
              style={{ background: '#ff2d55', border: 'none', borderRadius: '10px', color: '#fff', padding: '10px 24px', fontSize: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>
              ▶ Regarder
            </button>
          )}
          <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', padding: '10px 24px', fontSize: '14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>+ Ma liste</button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 1 }}>
        {movies.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === current ? '#ff2d55' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

function VideoPlayer({ movie, onClose }) {
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '960px', background: '#0f0f1a', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ff2d55' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#0a0a0f' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: '700' }}>{movie.title}</h2>
            <p style={{ color: '#aaa', margin: 0, fontSize: '12px' }}>{movie.release_year} • {movie.duration_min}min • {movie.type === 'series' ? 'Série' : 'Film'}</p>
          </div>
          <button onClick={onClose}
            style={{ background: 'transparent', border: '1px solid #ff2d55', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif" }}>
            ✕ Fermer
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          <iframe src={movie.video_url} title={movie.title} allow="autoplay; fullscreen" allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
        {movie.description && (
          <div style={{ padding: '1rem 1.5rem' }}>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{movie.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home({ user, profile, onLogout, onAdmin, onProfile }) {
  const [trending, setTrending]       = useState([])
  const [popular, setPopular]         = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [playingMovie, setPlayingMovie]   = useState(null)
  const [navScrolled, setNavScrolled]     = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [t, p, n] = await Promise.all([getTrending(), getPopular(), getNewReleases()])
        setTrending(t); setPopular(p); setNewReleases(n)
      } catch (_) {
      } finally {
        setLoading(false)
      }
    }
    load()
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {playingMovie && <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />}

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navScrolled ? 'rgba(10,10,15,0.97)' : 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
        backdropFilter: navScrolled ? 'blur(10px)' : 'none',
        transition: 'background 0.3s',
        borderBottom: navScrolled ? '1px solid rgba(255,45,85,0.08)' : 'none',
      }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>
          Cine<span style={{ color: '#ff2d55' }}>max</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.email === ADMIN_EMAIL && (
            <button onClick={onAdmin} style={{ background: '#ff2d55', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
              ⚙️ Admin
            </button>
          )}

          {/* Bouton profil avec avatar */}
          <button
            onClick={onProfile}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px', padding: '4px 12px 4px 4px',
              cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <AvatarBubble profile={profile} size={30} />
            <span style={{ color: '#ddd', fontSize: '12px', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.avatar_name || user?.email?.split('@')[0]}
            </span>
          </button>

          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid #ff2d55', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <HeroSlider movies={trending} onPlay={setPlayingMovie} />

      <div style={{ paddingTop: '1.5rem' }}>
        <MovieRow title="🔥 Tendances"  movies={trending}    loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="⭐ Populaires" movies={popular}     loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="🆕 Nouveautés" movies={newReleases} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
      </div>

      {selectedMovie && (
        <div onClick={() => setSelectedMovie(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0f0f1a', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', border: '1px solid #ff2d55' }}>
            <h2 style={{ color: '#fff', marginBottom: '6px', fontSize: '20px' }}>{selectedMovie.title}</h2>
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '1rem' }}>{selectedMovie.release_year} • {selectedMovie.duration_min}min • {selectedMovie.type === 'series' ? 'Série' : 'Film'}</p>
            <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>{selectedMovie.description || 'Aucune description.'}</p>
            {selectedMovie.video_url ? (
              <button onClick={() => { setSelectedMovie(null); setPlayingMovie(selectedMovie) }}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px', fontFamily: "'Poppins', sans-serif" }}>
                ▶ Regarder maintenant
              </button>
            ) : (
              <p style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>Vidéo non disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}