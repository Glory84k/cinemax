import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Profile from './pages/Profile'

const avatars = {
  Netflix: {
    'Breaking Bad': [
      { id: 'walter_white', initials: 'WW', name: 'Walter White', color: '#2d6a4f' },
      { id: 'heisenberg',   initials: 'HB', name: 'Heisenberg',   color: '#1a1a1a' },
      { id: 'jesse',        initials: 'JP', name: 'Jesse Pinkman', color: '#457b9d' },
      { id: 'gus',          initials: 'GF', name: 'Gus Fring',     color: '#e63946' },
      { id: 'hank',         initials: 'HS', name: 'Hank',          color: '#f4a261' },
      { id: 'walter_jr',    initials: 'WJ', name: 'Walter Jr.',    color: '#6d6875' },
      { id: 'skyler',       initials: 'SW', name: 'Skyler',        color: '#a8dadc' },
      { id: 'marie',        initials: 'MH', name: 'Marie Schrader', color: '#9b5de5' },
    ],
    'La Casa de Papel': [
      { id: 'professor', initials: 'PR', name: 'Le Professeur', color: '#e63946' },
      { id: 'tokyo',     initials: 'TK', name: 'Tokyo',         color: '#ff6b6b' },
      { id: 'berlin',    initials: 'BL', name: 'Berlin',        color: '#343a40' },
      { id: 'nairobi',   initials: 'NB', name: 'Nairobi',       color: '#f9c74f' },
      { id: 'denver',    initials: 'DV', name: 'Denver',        color: '#4cc9f0' },
      { id: 'rio',       initials: 'RO', name: 'Rio',           color: '#06d6a0' },
    ],
    'Squid Game': [
      { id: 'gi_hun',    initials: 'GH', name: 'Gi-hun',    color: '#e63946' },
      { id: 'sang_woo',  initials: 'SW', name: 'Sang-woo',  color: '#2b2d42' },
      { id: 'sae_byeok', initials: 'SB', name: 'Sae-byeok', color: '#457b9d' },
      { id: 'frontman',  initials: 'FM', name: 'Frontman',   color: '#111' },
      { id: 'ali',       initials: 'AL', name: 'Ali',        color: '#06d6a0' },
      { id: 'deok_su',   initials: 'DS', name: 'Deok-su',   color: '#f4a261' },
    ],
    'Mercredi': [
      { id: 'mercredi', initials: 'ME', name: 'Mercredi', color: '#1a1a2e' },
      { id: 'enid',     initials: 'EN', name: 'Enid',     color: '#9b5de5' },
      { id: 'xavier',   initials: 'XV', name: 'Xavier',   color: '#457b9d' },
      { id: 'bianca',   initials: 'BI', name: 'Bianca',   color: '#e63946' },
      { id: 'thing',    initials: 'TH', name: 'Thing',    color: '#2d6a4f' },
    ],
  }
}

function AvatarPicker({ onSelect }) {
  const [activeSerie, setActiveSerie] = useState('Breaking Bad')
  const [selected, setSelected] = useState(null)
  const [avatarOptions, setAvatarOptions] = useState({})
  const series = Object.keys(avatars.Netflix)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('avatar_options').select('*')
        if (data && data.length > 0) {
          const grouped = {}
          data.forEach(a => {
            if (!grouped[a.serie]) grouped[a.serie] = []
            grouped[a.serie].push(a)
          })
          setAvatarOptions(grouped)
        }
      } catch (_) {}
    }
    load()
  }, [])

  const getAvatars = (serie) => {
    if (avatarOptions[serie] && avatarOptions[serie].length > 0) {
      return avatarOptions[serie].map(a => ({
        id: a.character_id,
        name: a.character_name,
        image_url: a.image_url,
        initials: a.character_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: '#1a1a2e',
      }))
    }
    return avatars.Netflix[serie] || []
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ background: '#0f0f1a', borderRadius: '20px', padding: '2rem', width: '92%', maxWidth: '580px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid #ff2d55' }}>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '22px' }}>🎭 Choisis ton personnage</h2>
        <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '1.5rem' }}>Il te représentera sur Cinemax</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {series.map(s => (
            <button key={s} onClick={() => setActiveSerie(s)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeSerie === s ? '#ff2d55' : '#1e1e2e', color: '#fff', fontSize: '13px', fontFamily: "'Poppins', sans-serif" }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {getAvatars(activeSerie).map(avatar => (
            <div key={avatar.id} onClick={() => setSelected(avatar)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden',
                border: selected?.id === avatar.id ? '3px solid #ff2d55' : '3px solid transparent',
                transform: selected?.id === avatar.id ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.2s',
                boxShadow: selected?.id === avatar.id ? '0 0 20px #ff2d5566' : 'none',
                background: avatar.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {avatar.image_url
                  ? <img src={avatar.image_url} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{avatar.initials}</span>
                }
              </div>
              <span style={{ color: selected?.id === avatar.id ? '#ff2d55' : '#aaa', fontSize: '11px', textAlign: 'center', maxWidth: '75px' }}>{avatar.name}</span>
            </div>
          ))}
        </div>
        <button onClick={() => selected && onSelect(selected)}
          style={{ width: '100%', padding: '14px', background: selected ? 'linear-gradient(135deg, #ff2d55, #ff6b35)' : '#1e1e2e', border: 'none', borderRadius: '12px', color: selected ? '#fff' : '#555', fontWeight: '700', cursor: selected ? 'pointer' : 'not-allowed', marginTop: '2rem', fontSize: '16px', fontFamily: "'Poppins', sans-serif" }}>
          {selected ? `✓ Choisir ${selected.name}` : 'Sélectionne un personnage'}
        </button>
      </div>
    </div>
  )
}

function App() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin]   = useState(true)
  const [message, setMessage]   = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [pendingUser, setPendingUser]           = useState(null)
  const [user, setUser]         = useState(undefined)
  const [profile, setProfile]   = useState(null)
  const [page, setPage]         = useState('home')

  const loadProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data || null)
    } catch (_) {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u.id)
    }).catch(() => setUser(null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async () => {
    setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage('❌ ' + error.message); return }
      if (data.user) { setPendingUser(data.user); setShowAvatarPicker(true) }
    }
  }

  const handleAvatarSelect = async (avatar) => {
    const userId = pendingUser?.id || user?.id
    const payload = {
      id:               userId,
      avatar_id:        avatar.id,
      avatar_name:      avatar.name,
      avatar_color:     avatar.color || '#1a1a2e',
      avatar_initials:  avatar.initials,
      avatar_image_url: avatar.image_url || null,
    }
    try {
      await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
    } catch (_) {}
    setProfile(payload)
    setShowAvatarPicker(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (_) {}
    setUser(null)
    setProfile(null)
    setPage('home')
    localStorage.removeItem('cinemax-auth')
  }

  if (user === undefined) return null

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif", position: 'relative' }}>
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      {showAvatarPicker && <AvatarPicker onSelect={handleAvatarSelect} />}
      <div style={{ background: 'rgba(15,15,26,0.95)', padding: '2.5rem', borderRadius: '20px', width: '380px', position: 'relative', zIndex: 1, border: '1px solid rgba(255,45,85,0.3)', boxShadow: '0 0 60px rgba(255,45,85,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎬</div>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>Cine<span style={{ color: '#ff2d55' }}>max</span></h1>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>Films & Séries en streaming</p>
        </div>
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#1a1a2e', borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setIsLogin(true)}  style={{ flex: 1, padding: '10px', background: isLogin  ? '#ff2d55' : 'transparent', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>Connexion</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', background: !isLogin ? '#ff2d55' : 'transparent', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>Inscription</button>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', marginBottom: '12px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#fff', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", fontSize: '14px', outline: 'none' }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          style={{ width: '100%', padding: '14px 16px', marginBottom: '16px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#fff', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", fontSize: '14px', outline: 'none' }} />
        <button onClick={handleAuth}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '16px', fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 20px rgba(255,45,85,0.4)' }}>
          {isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'}
        </button>
        {message && <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: message.startsWith('❌') ? '#ff4444' : '#4caf50' }}>{message}</p>}
      </div>
    </div>
  )

  return (
    <>
      {showAvatarPicker && <AvatarPicker onSelect={handleAvatarSelect} />}
      {page === 'admin'   && <Admin   user={user} onBack={() => setPage('home')} />}
      {page === 'profile' && <Profile user={user} profile={profile} onBack={() => setPage('home')} onLogout={handleLogout} onAvatarUpdated={handleAvatarSelect} />}
      {page === 'home'    && <Home    user={user} profile={profile} onLogout={handleLogout} onAdmin={() => setPage('admin')} onProfile={() => setPage('profile')} />}
    </>
  )
}

export default App