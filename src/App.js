import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

const avatars = {
  Netflix: {
    "Breaking Bad": [
      { id: "walter_white", initials: "WW", name: "Walter White", color: "#2d6a4f" },
      { id: "heisenberg", initials: "HB", name: "Heisenberg", color: "#1a1a1a" },
      { id: "jesse", initials: "JP", name: "Jesse Pinkman", color: "#457b9d" },
      { id: "gus", initials: "GF", name: "Gus Fring", color: "#e63946" },
      { id: "hank", initials: "HS", name: "Hank", color: "#f4a261" },
      { id: "walter_jr", initials: "WJ", name: "Walter Jr.", color: "#6d6875" },
      { id: "skyler", initials: "SW", name: "Skyler", color: "#a8dadc" },
      { id: "marie", initials: "MH", name: "Marie Schrader", color: "#9b5de5" },
    ],
    "La Casa de Papel": [
      { id: "professor", initials: "PR", name: "Le Professeur", color: "#e63946" },
      { id: "tokyo", initials: "TK", name: "Tokyo", color: "#ff6b6b" },
      { id: "berlin", initials: "BL", name: "Berlin", color: "#343a40" },
      { id: "nairobi", initials: "NB", name: "Nairobi", color: "#f9c74f" },
      { id: "denver", initials: "DV", name: "Denver", color: "#4cc9f0" },
      { id: "rio", initials: "RO", name: "Rio", color: "#06d6a0" },
    ],
    "Squid Game": [
      { id: "gi_hun", initials: "GH", name: "Gi-hun", color: "#e63946" },
      { id: "sang_woo", initials: "SW", name: "Sang-woo", color: "#2b2d42" },
      { id: "sae_byeok", initials: "SB", name: "Sae-byeok", color: "#457b9d" },
      { id: "frontman", initials: "FM", name: "Frontman", color: "#111" },
      { id: "ali", initials: "AL", name: "Ali", color: "#06d6a0" },
      { id: "deok_su", initials: "DS", name: "Deok-su", color: "#f4a261" },
    ],
    "Mercredi": [
      { id: "mercredi", initials: "ME", name: "Mercredi", color: "#1a1a2e" },
      { id: "enid", initials: "EN", name: "Enid", color: "#9b5de5" },
      { id: "xavier", initials: "XV", name: "Xavier", color: "#457b9d" },
      { id: "bianca", initials: "BI", name: "Bianca", color: "#e63946" },
      { id: "thing", initials: "TH", name: "Thing", color: "#2d6a4f" },
    ],
  }
}

function AvatarPicker({ onSelect }) {
  const [activeSerie, setActiveSerie] = useState('Breaking Bad')
  const [selected, setSelected] = useState(null)
  const series = Object.keys(avatars.Netflix)

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
          {avatars.Netflix[activeSerie].map(avatar => (
            <div key={avatar.id} onClick={() => setSelected(avatar)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: avatar.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: '700', color: '#fff',
                border: selected?.id === avatar.id ? '3px solid #ff2d55' : '3px solid transparent',
                transform: selected?.id === avatar.id ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.2s', boxShadow: selected?.id === avatar.id ? '0 0 20px #ff2d5566' : 'none'
              }}>
                {avatar.initials}
              </div>
              <span style={{ color: selected?.id === avatar.id ? '#ff2d55' : '#aaa', fontSize: '11px', textAlign: 'center', maxWidth: '75px', fontWeight: selected?.id === avatar.id ? '600' : '400' }}>{avatar.name}</span>
            </div>
          ))}
        </div>

        <button onClick={() => selected && onSelect(selected)}
          style={{ width: '100%', padding: '14px', background: selected ? 'linear-gradient(135deg, #ff2d55, #ff6b35)' : '#1e1e2e', border: 'none', borderRadius: '12px', color: selected ? '#fff' : '#555', fontWeight: '700', cursor: selected ? 'pointer' : 'not-allowed', marginTop: '2rem', fontSize: '16px', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px' }}>
          {selected ? `✓ Choisir ${selected.name}` : 'Sélectionne un personnage'}
        </button>
      </div>
    </div>
  )
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
      if (data.user) {
        setPendingUser(data.user)
        setShowAvatarPicker(true)
      }
    }
  }

  const handleAvatarSelect = async (avatar) => {
    const userId = pendingUser?.id || user?.id
    await supabase.from('profiles').upsert({
      id: userId,
      avatar_id: avatar.id,
      avatar_name: avatar.name,
      avatar_color: avatar.color,
      avatar_initials: avatar.initials,
    })
    setShowAvatarPicker(false)
    setMessage(`✅ Bienvenue ! Avatar "${avatar.name}" sauvegardé.`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#ff2d55', fontSize: '24px', fontFamily: "'Poppins', sans-serif" }}>
      🎬 Chargement...
    </div>
  )

  if (user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif" }}>
      <div className="wave-container"><div className="wave wave1"></div><div className="wave wave2"></div><div className="wave wave3"></div></div>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h1 style={{ color: '#ff2d55', fontSize: '32px', marginBottom: '0.5rem' }}>🎬 Cinemax</h1>
        <p style={{ color: '#fff', fontSize: '18px', marginBottom: '0.5rem' }}>Connecté en tant que</p>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '2rem' }}>{user.email}</p>
        <p style={{ color: '#ff6b35', fontSize: '15px', marginBottom: '2rem' }}>🚀 La page d'accueil arrive bientôt !</p>
        <button onClick={handleLogout} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #ff2d55', borderRadius: '8px', color: '#ff2d55', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: '14px' }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif", position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
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
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '10px', background: isLogin ? '#ff2d55' : 'transparent', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Poppins', sans-serif", fontSize: '14px', transition: 'all 0.2s' }}>Connexion</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', background: !isLogin ? '#ff2d55' : 'transparent', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Poppins', sans-serif", fontSize: '14px', transition: 'all 0.2s' }}>Inscription</button>
        </div>

        <input type="email" placeholder="📧 Ton email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '14px 16px', marginBottom: '12px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#fff', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", fontSize: '14px', outline: 'none' }} />
        <input type="password" placeholder="🔒 Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          style={{ width: '100%', padding: '14px 16px', marginBottom: '16px', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '12px', color: '#fff', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", fontSize: '14px', outline: 'none' }} />

        <button onClick={handleAuth}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff2d55, #ff6b35)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '16px', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px', boxShadow: '0 4px 20px rgba(255,45,85,0.4)' }}>
          {isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'}
        </button>

        {message && <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: message.startsWith('❌') ? '#ff4444' : '#4caf50' }}>{message}</p>}
      </div>
    </div>
  )
}

export default App