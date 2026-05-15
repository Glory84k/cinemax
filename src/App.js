import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Connecté avec succès !')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Inscription réussie ! Vérifie ton email.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', position: 'relative' }}>
      <div className="wave-container">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
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