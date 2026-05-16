import { useState, useEffect } from 'react'
import { getTrending, getPopular, getNewReleases } from '../lib/api'

const placeholderColors = ['#1a1a2e','#16213e','#0f3460','#533483','#2b2d42','#8d99ae','#e63946','#457b9d','#2d6a4f','#f4a261']

function MovieCard({ movie, onClick }) {
  const [hovered, setHovered] = useState(false)
  const color = placeholderColors[Math.floor(Math.random() * placeholderColors.length)]

  return (
    <div onClick={() => onClick(movie)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: '180px', height: '260px', borderRadius: '12px', cursor: 'pointer',
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : color,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered ? '0 8px 30px rgba(255,45,85,0.4)' : '0 2px 10px rgba(0,0,0,0.4)'
      }}>
      {!movie.cover_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '40px' }}>🎬</span>
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: hovered ? 'linear-gradient(transparent, rgba(0,0,0,0.95))' : 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '1rem 0.75rem 0.75rem', transition: 'all 0.3s'
      }}>
        <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0 }}>{movie.title}</p>
        {hovered && (
          <div style={{ marginTop: '6px' }}>
            <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 8px' }}>{movie.release_year} • {movie.duration_min}min</p>
            <button style={{ background: '#ff2d55', border: 'none', borderRadius: '6px', color: '#fff', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
              ▶ Regarder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      minWidth: '180px', height: '260px', borderRadius: '12px', flexShrink: 0,
      background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a3e 50%, #1a1a2e 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
    }} />
  )
}

function MovieRow({ title, movies, loading, onMovieClick }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '1rem', paddingLeft: '2rem' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.length === 0
            ? <p style={{ color: '#555', fontSize: '14px' }}>Aucun contenu pour l'instant...</p>
            : movies.map(m => <MovieCard key={m.id} movie={m} onClick={onMovieClick} />)
        }
      </div>
    </div>
  )
}

export default function Home({ user, onLogout }) {
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

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0 }}>Cine<span style={{ color: '#ff2d55' }}>max</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#aaa', fontSize: '13px' }}>{user?.email}</span>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid #ff2d55', borderRadius: '8px', color: '#ff2d55', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ height: '50vh', background: 'linear-gradient(135deg, #1a0010, #0a0a0f)', display: 'flex', alignItems: 'center', paddingLeft: '2rem', paddingTop: '80px' }}>
        <div>
          <p style={{ color: '#ff2d55', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>🔥 À la une</p>
          <h2 style={{ color: '#fff', fontSize: '48px', fontWeight: '800', margin: '0 0 12px', lineHeight: 1.1 }}>Bienvenue sur<br /><span style={{ color: '#ff2d55' }}>Cinemax</span></h2>
          <p style={{ color: '#aaa', fontSize: '15px', maxWidth: '400px', marginBottom: '1.5rem' }}>Films & Séries en streaming. Regarde ce que tu veux, quand tu veux.</p>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ paddingTop: '2rem' }}>
        <MovieRow title="🔥 Tendances" movies={trending} loading={loading} onMovieClick={setSelectedMovie} />
        <MovieRow title="⭐ Populaires" movies={popular} loading={loading} onMovieClick={setSelectedMovie} />
        <MovieRow title="🆕 Nouveautés" movies={newReleases} loading={loading} onMovieClick={setSelectedMovie} />
      </div>

      {/* Modal film */}
      {selectedMovie && (
        <div onClick={() => setSelectedMovie(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a2e', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '90%', border: '1px solid #ff2d55' }}>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>{selectedMovie.title}</h2>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '1rem' }}>{selectedMovie.release_year} • {selectedMovie.duration_min} min • {selectedMovie.type === 'series' ? 'Série' : 'Film'}</p>
            <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '1.5rem' }}>{selectedMovie.description || 'Aucune description disponible.'}</p>
            <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
              ▶ Regarder maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}