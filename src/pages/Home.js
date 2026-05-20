import { useState, useEffect, useRef } from 'react'
import { getTrending, getPopular, getNewReleases } from '../lib/api'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'speedsongsupsa@gmail.com'
const placeholderColors = ['#1a1a2e','#16213e','#0f3460','#533483','#2b2d42','#e63946','#457b9d','#2d6a4f','#f4a261']
function getColor(id) { return placeholderColors[id % placeholderColors.length] }

function AvatarBubble({ profile, size = 34 }) {
  const fontSize = size * 0.38
  if (profile?.avatar_image_url) {
    return <img src={profile.avatar_image_url} alt={profile.avatar_name || 'Avatar'} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,45,85,0.8)', flexShrink: 0, boxShadow: '0 0 12px rgba(255,45,85,0.3)' }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: profile?.avatar_color || '#333', border: '2px solid rgba(255,45,85,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: '700', color: '#fff', fontFamily: "'Poppins', sans-serif", boxShadow: '0 0 12px rgba(255,45,85,0.3)' }}>
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
      onClick={() => onClick(movie)}
      style={{
        width: hovered ? '270px' : '180px',
        minWidth: hovered ? '270px' : '180px',
        height: '270px',
        borderRadius: '14px',
        cursor: 'pointer',
        flexShrink: 0,
        background: movie.cover_url ? `url(${movie.cover_url}) center/cover` : getColor(index),
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: hovered ? '0 25px 50px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,45,85,0.5), 0 0 40px rgba(255,45,85,0.2)' : '0 4px 20px rgba(0,0,0,0.5)',
        zIndex: hovered ? 10 : 1,
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
      }}>
      {!movie.cover_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>🎬</div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.05) 100%)' : 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)', transition: 'all 0.4s' }} />
      {hovered && (
        <>
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,45,85,0.92)', borderRadius: '6px', padding: '3px 10px', fontSize: '10px', color: '#fff', fontWeight: '800', letterSpacing: '1px', fontFamily: "'Poppins', sans-serif" }}>
            {movie.type === 'series' ? 'SÉRIE' : 'FILM'}
          </div>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,45,85,0.45)', borderRadius: '14px', pointerEvents: 'none' }} />
        </>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.2rem 1rem 1rem' }}>
        <p style={{ color: '#fff', fontSize: hovered ? '14px' : '13px', fontWeight: '700', margin: '0 0 4px', lineHeight: 1.3, textShadow: '0 1px 6px rgba(0,0,0,0.9)', transition: 'font-size 0.3s' }}>{movie.title}</p>
        {hovered && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <p style={{ color: '#bbb', fontSize: '11px', margin: '0 0 12px' }}>{movie.release_year} • {movie.duration_min}min{movie.category ? ` • ${movie.category}` : ''}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {movie.video_url && (
                <button onClick={e => { e.stopPropagation(); onPlay(movie) }}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 0', fontSize: '12px', cursor: 'pointer', fontWeight: '700', fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 12px rgba(255,45,85,0.4)' }}>
                  ▶ Regarder
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); onClick(movie) }}
                style={{ flex: movie.video_url ? 0 : 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: '#fff', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                + Infos
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
    <div style={{ width: '180px', minWidth: '180px', height: '270px', borderRadius: '14px', flexShrink: 0, background: 'linear-gradient(90deg, #111122 25%, #1e1e35 50%, #111122 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s infinite' }} />
  )
}

function MovieRow({ title, movies, loading, onMovieClick, onPlayClick }) {
  const rowRef = useRef(null)
  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem', paddingLeft: '2.5rem' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
        <div style={{ height: '2px', width: '50px', background: 'linear-gradient(to right, #ff2d55, transparent)', borderRadius: '2px' }} />
      </div>
      <div ref={rowRef} style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingBottom: '24px', paddingTop: '12px', scrollbarWidth: 'none', alignItems: 'flex-end' }}>
        {loading
          ? Array(7).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : movies.length === 0
            ? <p style={{ color: '#333', fontSize: '14px', fontStyle: 'italic', paddingTop: '8px' }}>Aucun contenu disponible...</p>
            : movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} onClick={onMovieClick} onPlay={onPlayClick} />)
        }
      </div>
    </div>
  )
}

function HeroSlider({ movies, onPlay, onInfo }) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = (i) => {
    if (i === current || transitioning) return
    setPrev(current)
    setTransitioning(true)
    setTimeout(() => { setCurrent(i); setPrev(null); setTransitioning(false) }, 600)
  }

  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % movies.length
        setPrev(c)
        setTransitioning(true)
        setTimeout(() => { setPrev(null); setTransitioning(false) }, 600)
        return next
      })
    }, 7000)
    return () => clearInterval(timer)
  }, [movies])

  if (movies.length === 0) return (
    <div style={{ height: '85vh', background: 'radial-gradient(ellipse at 30% 50%, #2a0010 0%, #0a0a0f 70%)', display: 'flex', alignItems: 'center', paddingLeft: '3rem' }}>
      <div style={{ paddingTop: '80px' }}>
        <p style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '20px' }}>🎬 STREAMING</p>
        <h2 style={{ color: '#fff', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '900', margin: '0 0 20px', lineHeight: 1.0, letterSpacing: '-2px' }}>Bienvenue sur<br /><span style={{ color: '#ff2d55' }}>Cinemax</span></h2>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '420px', lineHeight: 1.7 }}>Films & Séries en streaming. Regarde ce que tu veux, quand tu veux.</p>
      </div>
    </div>
  )

  const movie = movies[current]
  const bgImage = movie.banner_url || movie.cover_url

  return (
    <div style={{ position: 'relative', width: '100%', height: '85vh', overflow: 'hidden', background: '#000' }}>

      {/* Image précédente — fade out */}
      {prev !== null && movies[prev] && (
        <img
          src={movies[prev].banner_url || movies[prev].cover_url}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 0,
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.6s ease',
            filter: 'brightness(0.55) saturate(1.1)',
          }}
        />
      )}

      {/* Image courante */}
      {bgImage && (
        <img
          src={bgImage}
          alt={movie.title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center', // ← centré, pas top
            zIndex: 1,
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 0.6s ease',
            filter: 'brightness(0.65) saturate(1.2)',
          }}
        />
      )}

      {/* Gradient gauche */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(100deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.05) 70%)' }} />
      {/* Gradient bas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(10,10,15,1) 0%, rgba(10,10,15,0.15) 28%, transparent 55%)' }} />
      {/* Gradient haut navbar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '180px', zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

      {/* Contenu */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        padding: '0 3.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: '80px',
        maxWidth: '620px',
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px', width: 'fit-content' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff2d55', animation: 'pulse 2s infinite', boxShadow: '0 0 8px #ff2d55' }} />
          <span style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>À LA UNE</span>
        </div>

        <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 58px)', fontWeight: '900', margin: '0 0 14px', lineHeight: 1.05, letterSpacing: '-1.5px', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
          {movie.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {movie.release_year && <span style={{ color: '#ccc', fontSize: '13px', fontWeight: '600' }}>{movie.release_year}</span>}
          {movie.duration_min && <><span style={{ color: '#555' }}>•</span><span style={{ color: '#ccc', fontSize: '13px' }}>{movie.duration_min} min</span></>}
          {movie.category && <><span style={{ color: '#555' }}>•</span><span style={{ background: 'rgba(255,45,85,0.15)', color: '#ff6b8a', fontSize: '11px', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(255,45,85,0.25)', fontWeight: '600' }}>{movie.category}</span></>}
          <span style={{ background: movie.type === 'series' ? 'rgba(99,179,237,0.15)' : 'rgba(255,200,60,0.15)', color: movie.type === 'series' ? '#63b3ed' : '#f6c90e', fontSize: '11px', padding: '3px 12px', borderRadius: '20px', border: `1px solid ${movie.type === 'series' ? 'rgba(99,179,237,0.2)' : 'rgba(246,201,14,0.2)'}`, fontWeight: '600' }}>
            {movie.type === 'series' ? 'SÉRIE' : 'FILM'}
          </span>
        </div>

        {movie.description && (
          <p style={{ color: '#ccc', fontSize: '14px', maxWidth: '480px', marginBottom: '2.2rem', lineHeight: 1.75 }}>
            {movie.description.slice(0, 150)}{movie.description.length > 150 ? '...' : ''}
          </p>
        )}

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {movie.video_url && (
            <button onClick={() => onPlay(movie)}
              style={{ background: 'linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)', border: 'none', borderRadius: '12px', color: '#fff', padding: '14px 32px', fontSize: '15px', cursor: 'pointer', fontWeight: '800', fontFamily: "'Poppins', sans-serif", boxShadow: '0 6px 25px rgba(255,45,85,0.45)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,45,85,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(255,45,85,0.45)' }}>
              ▶ Regarder
            </button>
          )}
          <button onClick={() => onInfo(movie)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', padding: '14px 28px', fontSize: '15px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '600', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}>
            ℹ️ Plus d'infos
          </button>
        </div>
      </div>

      {/* Indicateurs */}
      {movies.length > 1 && (
        <div style={{ position: 'absolute', bottom: '28px', left: '3.5rem', display: 'flex', gap: '8px', zIndex: 4 }}>
          {movies.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ width: i === current ? '32px' : '8px', height: '4px', borderRadius: '2px', background: i === current ? '#ff2d55' : 'rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: i === current ? '0 0 8px rgba(255,45,85,0.6)' : 'none' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function MovieModal({ movie, onClose, onPlay }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #0f0f1a, #1a0a12)', borderRadius: '24px', width: '90%', maxWidth: '520px', overflow: 'hidden', border: '1px solid rgba(255,45,85,0.15)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', animation: 'slideUp 0.3s ease' }}>
        {movie.cover_url && (
          <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
            <img src={movie.cover_url} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f0f1a 0%, transparent 60%)' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>✕</button>
          </div>
        )}
        <div style={{ padding: '1.75rem' }}>
          {!movie.cover_url && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}>✕ Fermer</button>
            </div>
          )}
          <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>{movie.title}</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            {movie.release_year && <span style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>{movie.release_year}</span>}
            {movie.duration_min && <span style={{ background: 'rgba(255,255,255,0.07)', color: '#aaa', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>{movie.duration_min} min</span>}
            <span style={{ background: movie.type === 'series' ? 'rgba(99,179,237,0.12)' : 'rgba(255,200,60,0.12)', color: movie.type === 'series' ? '#63b3ed' : '#f6c90e', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
              {movie.type === 'series' ? 'SÉRIE' : 'FILM'}
            </span>
            {movie.category && <span style={{ background: 'rgba(255,45,85,0.1)', color: '#ff6b8a', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '600', border: '1px solid rgba(255,45,85,0.15)' }}>{movie.category}</span>}
          </div>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '1.75rem', lineHeight: 1.75 }}>{movie.description || 'Aucune description disponible.'}</p>
          {movie.video_url ? (
            <button onClick={() => { onClose(); onPlay(movie) }}
              style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '15px', fontFamily: "'Poppins', sans-serif", boxShadow: '0 6px 25px rgba(255,45,85,0.35)' }}>
              ▶ Regarder maintenant
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>Vidéo non disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VideoPlayer({ movie, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif", animation: 'fadeIn 0.2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '94%', maxWidth: '1050px', background: '#080810', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,45,85,0.2)', boxShadow: '0 0 80px rgba(0,0,0,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: '800' }}>{movie.title}</h2>
            <p style={{ color: '#555', margin: '3px 0 0', fontSize: '12px' }}>{movie.release_year} • {movie.duration_min}min • {movie.type === 'series' ? 'Série' : 'Film'}</p>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.25)', borderRadius: '10px', color: '#ff2d55', padding: '8px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif", fontWeight: '700' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,45,85,0.12)'}>
            ✕ Fermer
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          <iframe src={movie.video_url} title={movie.title} allow="fullscreen" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  )
}

export default function Home({ user, profile, onLogout, onAdmin, onProfile }) {
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [popular, setPopular] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [playingMovie, setPlayingMovie] = useState(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const topRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredRes, t, p, n] = await Promise.all([
          supabase.from('movies').select('*').eq('featured', true).order('featured_order', { ascending: true }),
          getTrending(),
          getPopular(),
          getNewReleases()
        ])
        setFeatured(featuredRes.data || [])
        setTrending(t)
        setPopular(p)
        setNewReleases(n)
      } catch (_) {
      } finally {
        setLoading(false)
      }
    }
    load()
    const onScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div ref={topRef} style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        ::-webkit-scrollbar{display:none}
      `}</style>

      {playingMovie && <VideoPlayer movie={playingMovie} onClose={() => setPlayingMovie(null)} />}
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onPlay={m => { setSelectedMovie(null); setPlayingMovie(m) }} />}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.9rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: navScrolled ? 'rgba(8,8,12,0.97)' : 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)', backdropFilter: navScrolled ? 'blur(24px)' : 'none', transition: 'all 0.4s', borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
        <h1 onClick={scrollToTop} style={{ color: '#fff', fontSize: '23px', fontWeight: '900', margin: 0, letterSpacing: '-0.8px', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Cine<span style={{ color: '#ff2d55' }}>max</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.email === ADMIN_EMAIL && (
            <button onClick={onAdmin} style={{ background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.25)', borderRadius: '10px', color: '#ff2d55', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '700', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,45,85,0.12)'}>
              ⚙️ Admin
            </button>
          )}
          <button onClick={onProfile} style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '5px 16px 5px 5px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
            <AvatarBubble profile={profile} size={32} />
            <span style={{ color: '#ddd', fontSize: '12px', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.avatar_name || user?.email?.split('@')[0]}
            </span>
          </button>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.35)', borderRadius: '10px', color: '#ff2d55', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,45,85,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Déco
          </button>
        </div>
      </nav>

      <HeroSlider movies={featured.length > 0 ? featured : trending} onPlay={setPlayingMovie} onInfo={setSelectedMovie} />

      <div style={{ paddingTop: '2.5rem' }}>
        <MovieRow title="🔥 Tendances" movies={trending} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="⭐ Populaires" movies={popular} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
        <MovieRow title="🆕 Nouveautés" movies={newReleases} loading={loading} onMovieClick={setSelectedMovie} onPlayClick={setPlayingMovie} />
      </div>
    </div>
  )
}