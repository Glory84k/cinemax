import { useState, useEffect } from 'react'
import { getTrending, getPopular, getNewReleases } from '../lib/api'

const ADMIN_EMAIL = 'speedsongsupsa@gmail.com'
const placeholderColors = ['#1a1a2e','#16213e','#0f3460','#533483','#2b2d42','#e63946','#457b9d','#2d6a4f','#f4a261']

function getColor(id) { return placeholderColors[id % placeholderColors.length] }

function AvatarBubble({ profile, size = 34 }) {
  const fontSize = size * 0.38
  if (profile?.avatar_image_url) {
    return <img src={profile.avatar_image_url} alt={profile.avatar_name || 'Avatar'} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,45,85,0.7)', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: profile?.avatar_color || '#333', border: '2px solid rgba(255,45,85,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: '700', color: '#fff', fontFamily: "'Poppins', sans-serif" }}>
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
        minWidth: '170px', height: '255px', borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : getColor(index),
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'scale(1.07) translateY(-4px)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,85,0.3)' : '0 4px 15px rgba(0,0,0,0.4)'
      }}>
      {!movie.cover_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎬</div>
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
        transition: 'all 0.3s'
      }} />
      {hovered && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ff2d55', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', color: '#fff', fontWeight: '700' }}>
          {movie.type === 'series' ? 'SÉRIE' : 'FILM'}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 0.875rem 0.875rem' }}>
        <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: '0 0 4px', lineHeight: 1.3 }}>{movie.title}</p>
        {hovered && (
          <div>
            <p style={{ color: '#aaa', fontSize: '10px', margin: '0 0 8px' }}>{movie.release_year} • {movie.duration_min}min</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {movie.video_url && (
                <button onClick={e => { e.stopPropagation(); onPlay(movie) }}
                  style={{ background: '#ff2d55', border: 'none', borderRadius: '6px', color: '#fff', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>
                  ▶ Voir
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); onClick(movie) }}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                ℹ️
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
      minWidth: '170px', height: '255px', borderRadius: '12px', flexShrink: 0,
      background: 'linear-gradient(90deg, #1a1a2e 25%, #242438 50%, #1a1a2e 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
    }} />
  )
}

function MovieRow({ title, movies, loading, onMovieClick, onPlayClick }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', paddingLeft: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '19px', fontWeight: '700', margin: 0 }}>{title}</h2>
        <div style={{ height: '2px', width: '40px', background: 'linear-gradient(to right, #ff2d55, transparent)', borderRadius: '2px' }} />
      </div>
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '12px', scrollbarWidth: 'none' }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.length === 0
            ? <p style={{ color: '#444', fontSize: '13px', fontStyle: 'italic', paddingTop: '8px' }}>Aucun contenu disponible...</p>
            : movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} onClick={onMovieClick} onPlay={onPlayClick} />)
        }
      </div>
    </div>
  )
}

function HeroSlider({ movies, onPlay }) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (movies.length === 0) return
    const timer = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => { setCurrent(c => (c + 1) % movies.length); setTransitioning(false) }, 300)
    }, 6000)
    return () => clearInterval(timer)
  }, [movies])

  if (movies.length === 0) return (
    <div style={{ height: '70vh', background: 'linear-gradient(135deg, #1a0010 0%, #0a0a0f 60%)', display: 'flex', alignItems: 'center', paddingLeft: '3rem' }}>
      <div style={{ paddingTop: '80px' }}>
        <p style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>🔥 À LA UNE</p>
        <h2 style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '800', margin: '0 0 16px', lineHeight: 1.05 }}>Bienvenue sur<br /><span style={{ color: '#ff2d55' }}>Cinemax</span></h2>
        <p style={{ color: '#888', fontSize: '15px', maxWidth: '400px', lineHeight: 1.6 }}>Films & Séries en streaming. Regarde ce que tu veux, quand tu veux.</p>
      </div>
    </div>
  )

  const movie = movies[current]
  return (
    <div style={{ height: '70vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: movie.cover_url ? `url(${movie.cover_url})` : 'none',
        backgroundColor: '#1a0010',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.3s ease',
        filter: 'brightness(0.45) saturate(1.2)'
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 50%)' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '0 3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '20px', padding: '4px 14px', width: 'fit-content', marginBottom: '16px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2d55', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>À la une</span>
        </div>
        <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.05, maxWidth: '550px', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{movie.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: '13px' }}>{movie.release_year}</span>
          <span style={{ color: '#555' }}>•</span>
          <span style={{ color: '#aaa', fontSize: '13px' }}>{movie.duration_min}min</span>
          {movie.category && <>
            <span style={{ color: '#555' }}>•</span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#ccc', fontSize: '11px', padding: '2px 10px', borderRadius: '12px' }}>{movie.category}</span>
          </>}
        </div>
        <p style={{ color: '#bbb', fontSize: '14px', maxWidth: '460px', marginBottom: '2rem', lineHeight: 1.65 }}>{movie.description?.slice(0, 130)}...</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          {movie.video_url && (
            <button onClick={() => onPlay(movie)}
              style={{ background: '#ff2d55', border: 'none', borderRadius: '10px', color: '#fff', padding: '12px 28px', fontSize: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 20px rgba(255,45,85,0.4)' }}>
              ▶ Regarder
            </button>
          )}
          <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
            + Ma liste
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', left: '3rem', display: 'flex', gap: '8px', zIndex: 1 }}>
        {movies.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? '28px' : '8px', height: '4px', borderRadius: '2px', background: i === current ? '#ff2d55' : 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all 0.4s' }} />
        ))}
      </div>
    </div>
  )
}

function VideoPlayer({ movie, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '92%', maxWidth: '1000px', background: '#0f0f1a', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,45,85,0.3)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.5)' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: '700' }}>{movie.title}</h2>
            <p style={{ color: '#666', margin: '2px 0 0', fontSize: '12px' }}>{movie.release_year} • {movie.duration_min}min • {movie.type === 'series' ? 'Série' : 'Film'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '8px', color: '#ff2d55', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
            ✕ Fermer
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          <iframe src={movie.video_url} title={movie.title} allow="fullscreen" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
        {movie.description && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{movie.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home({ user, profile, onLogout, onAdmin, onProfile }) {
  const [trending, setTrending] = useState([])
  const [popular, setPopular] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [playingMovie, setPlayingMovie] = useState(null)
  const [navScrolled, setNavScrolled] = useState(false)

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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {playingMovie && <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />}

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: navScrolled ? 'rgba(8,8,12,0.98)' : 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        backdropFilter: navScrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s',
        borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
          Cine<span style={{ color: '#ff2d55' }}>max</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.email === ADMIN_EMAIL && (
            <button onClick={onAdmin} style={{ background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
              ⚙️ Admin
            </button>
          )}
          <button onClick={onProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '4px 14px 4px 4px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <AvatarBubble profile={profile} size={30} />
            <span style={{ color: '#ddd', fontSize: '12px', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.avatar_name || user?.email?.split('@')[0]}
            </span>
          </button>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.4)', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" }}>
            Déco
          </button>
        </div>
      </nav>

      <HeroSlider movies={trending} onPlay={setPlayingMovie} />

      <div style={{ paddingTop: '2rem' }}>
        <MovieRow title="🔥 Tendances" movies={trending} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="⭐ Populaires" movies={popular} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="🆕 Nouveautés" movies={newReleases} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
      </div>

      {selectedMovie && (
        <div onClick={() => setSelectedMovie(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0f0f1a', borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '90%', border: '1px solid rgba(255,45,85,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            {selectedMovie.cover_url && <img src={selectedMovie.cover_url} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }} />}
            <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '20px', fontWeight: '800' }}>{selectedMovie.title}</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: '#aaa', fontSize: '11px', padding: '3px 10px', borderRadius: '12px' }}>{selectedMovie.release_year}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: '#aaa', fontSize: '11px', padding: '3px 10px', borderRadius: '12px' }}>{selectedMovie.duration_min}min</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', color: '#aaa', fontSize: '11px', padding: '3px 10px', borderRadius: '12px' }}>{selectedMovie.type === 'series' ? 'Série' : 'Film'}</span>
            </div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.7 }}>{selectedMovie.description || 'Aucune description.'}</p>
            {selectedMovie.video_url ? (
              <button onClick={() => { setSelectedMovie(null); setPlayingMovie(selectedMovie) }}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px', fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 20px rgba(255,45,85,0.3)' }}>
                ▶ Regarder maintenant
              </button>
            ) : (
              <p style={{ color: '#444', fontSize: '13px', textAlign: 'center' }}>Vidéo non disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}