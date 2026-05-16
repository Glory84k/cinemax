import { useState, useEffect } from 'react'
import { getTrending, getPopular, getNewReleases } from '../lib/api'

const ADMIN_EMAIL = 'maximegayardraoux@gmail.com'

const placeholderColors = ['#1a1a2e','#16213e','#0f3460','#533483','#2b2d42','#e63946','#457b9d','#2d6a4f','#f4a261']

function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={() => onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: '160px', height: '240px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : placeholderColors[Math.floor(Math.random() * placeholderColors.length)],
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
            <button style={{ background: '#ff2d55', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontWeight: '600' }}>▶ Regarder</button>
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

function MovieRow({ title, movies, loading, onMovieClick }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '1rem', paddingLeft: '2rem' }}>{title}</h2>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.length === 0
            ? <p style={{ color: '#444', fontSize: '13px', fontStyle: 'italic' }}>Aucun contenu disponible...</p>
            : movies.map(m => <MovieCard key={m.id} movie={m} onClick={onMovieClick} />)
        }
      </div>
    </div>
  )
}

function HeroSlider({ movies }) {
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
          <button style={{ background: '#ff2d55', border: 'none', borderRadius: '10px', color: '#fff', padding: '10px 24px', fontSize: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>▶ Regarder</button>
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

export default function Home({ user, onLogout, onAdmin }) {
  const [trending, setTrending] = useState([])
  const [popular, setPopular] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [t, p, n] = await Promise.all([getTrending(), getPopular(), getNewReleases()])
      setTrending(t)
      setPopular(p)
      setNewReleases(n)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)' }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>Cine<span style={{ color: '#ff2d55' }}>max</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.email === ADMIN_EMAIL && (
            <button onClick={onAdmin} style={{ background: '#ff2d55', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>⚙️ Admin</button>
          )}
          <span style={{ color: '#aaa', fontSize: '12px' }}>{user?.email}</span>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid #ff2d55', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" }}>Déconnexion</button>
        </div>
      </nav>

      <HeroSlider movies={trending} />

      <div style={{ paddingTop: '1.5rem' }}>
        <MovieRow title="🔥 Tendances" movies={trending} loading={loading} onMovieClick={setSelectedMovie} />
        <MovieRow title="⭐ Populaires" movies={popular} loading={loading} onMovieClick={setSelectedMovie} />
        <MovieRow title="🆕 Nouveautés" movies={newReleases} loading={loading} onMovieClick={setSelectedMovie} />
      </div>

      {selectedMovie && (
        <div onClick={() => setSelectedMovie(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0f0f1a', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', border: '1px solid #ff2d55' }}>
            <h2 style={{ color: '#fff', marginBottom: '6px', fontSize: '20px' }}>{selectedMovie.title}</h2>
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '1rem' }}>{selectedMovie.release_year} • {selectedMovie.duration_min}min • {selectedMovie.type === 'series' ? 'Série' : 'Film'}</p>
            <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '1.5rem', lineHeight: 1.6 }}>{selectedMovie.description || 'Aucune description.'}</p>
            <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px', fontFamily: "'Poppins', sans-serif" }}>
              ▶ Regarder maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}