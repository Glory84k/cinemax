import { useState } from 'react'
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
      { id: "moscow", initials: "MS", name: "Moscow", color: "#8d99ae" },
      { id: "helsinki", initials: "HK", name: "Helsinki", color: "#3a0ca3" },
    ],
    "Squid Game": [
      { id: "gi_hun", initials: "GH", name: "Gi-hun", color: "#e63946" },
      { id: "sang_woo", initials: "SW", name: "Sang-woo", color: "#2b2d42" },
      { id: "sae_byeok", initials: "SB", name: "Sae-byeok", color: "#457b9d" },
      { id: "frontman", initials: "FM", name: "Frontman", color: "#000000" },
      { id: "ali", initials: "AL", name: "Ali", color: "#06d6a0" },
      { id: "deok_su", initials: "DS", name: "Deok-su", color: "#f4a261" },
    ],
    "Mercredi": [
      { id: "mercredi", initials: "ME", name: "Mercredi", color: "#1a1a2e" },
      { id: "enid", initials: "EN", name: "Enid", color: "#9b5de5" },
      { id: "xavier", initials: "XV", name: "Xavier", color: "#457b9d" },
      { id: "bianca", initials: "BI", name: "Bianca", color: "#e63946" },
      { id: "thing", initials: "TH", name: "Thing", color: "#2d6a4f" },
      { id: "gomez", initials: "GO", name: "Gomez", color: "#343a40" },
    ],
  }
}

function AvatarPicker({ onSelect }) {
  const [activeTab, setActiveTab] = useState('Netflix')
  const [activeSerie, setActiveSerie] = useState('Breaking Bad')
  const [selected, setSelected] = useState(null)

  const series = Object.keys(avatars[activeTab])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#111', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Choisis ton avatar</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['Netflix', 'HBO', 'Prime Video', 'Disney+'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab('Netflix'); setActiveSerie('Breaking Bad') }}
              style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: tab === 'Netflix' ? '#e50914' : '#333', color: '#fff', fontWeight: tab === activeTab ? 'bold' : 'normal' }}>
              {tab}
            </button>
          ))}
        </div>

        {series.map(serie => (
          <div key={serie} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '1rem' }}>{serie}</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {avatars[activeTab][serie].map(avatar => (
                <div key={avatar.id} onClick={() => setSelected(avatar)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: avatar.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 'bold', color: '#fff',
                    border: selected?.id === avatar.id ? '3px solid #e5a732' : '3px solid transparent',
                    transition: 'border 0.2s'
                  }}>
                    {avatar.initials}
                  </div>
                  <span style={{ color: '#aaa', fontSize: '11px', textAlign: 'center', maxWidth: '70px' }}>{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={() => selected && onSelect(selected)}
          style={{ width: '100%', padding: '12px', background: selected ? '#e5a732' : '#333', border: 'none', borderRadius: '8px', color: selected ? '#000' : '#666', fontWeight: 'bold', cursor: selected ? 'pointer' : 'not-allowed', marginTop: '1rem', fontSize: '16px' }}>
          Confirmer ce personnage
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

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Connecté avec succès !')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setMessage(error.message); return }
      setPendingUser(data.user)
      setShowAvatarPicker(true)
    }
  }

  const handleAvatarSelect = async (avatar) => {
    await supabase.from('profiles').upsert({
      id: pendingUser.id,
      avatar_id: avatar.id,
      avatar_name: avatar.name,
      avatar_color: avatar.color,
      avatar_initials: avatar.initials,
    })
    setShowAvatarPicker(false)
    setMessage(`Bienvenue ! Avatar "${avatar.name}" sélectionné ✓`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', position: 'relative' }}>
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {showAvatarPicker && <AvatarPicker onSelect={handleAvatarSelect} />}

      <div style={{ background: '#1a1a2e', padding: '2rem', borderRadius: '12px', width: '360px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: '#e5a732', textAlign: 'center', marginBottom: '2rem' }}>🎬 Cinemax</h1>
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '10px', background: isLogin ? '#e5a732' : 'transparent', color: isLogin ? '#000' : '#fff', border: '1px solid #e5a732', borderRadius: '6px 0 0 6px', cursor: 'pointer' }}>Connexion</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', background: !isLogin ? '#e5a732' : 'transparent', color: !isLogin ? '#000' : '#fff', border: '1px solid #e5a732', borderRadius: '0 6px 6px 0', cursor: 'pointer' }}>Inscription</button>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '1rem', background: '#0a0a0f', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '1rem', background: '#0a0a0f', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
        <button onClick={handleAuth} style={{ width: '100%', padding: '12px', background: '#e5a732', border: 'none', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
        {message && <p style={{ color: '#e5a732', textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  )
}

export default App