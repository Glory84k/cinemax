import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const avatars = {
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

export default function Profile({ user, profile, onBack, onLogout, onAvatarUpdated }) {
  const [activeSerie, setActiveSerie] = useState('Breaking Bad')
  const [selected, setSelected] = useState(null)
  const [avatarOptions, setAvatarOptions] = useState({})
  const [msg, setMsg] = useState('')
  const series = Object.keys(avatars)

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
    return avatars[serie] || []
  }

  const handleSave = async () => {
    if (!selected) return
    await onAvatarUpdated(selected)
    setMsg('✅ Avatar mis à jour !')
    setTimeout(() => setMsg(''), 2000)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#1a1a2e', border: '1px solid #2a2a3e',
    borderRadius: '8px', color: '#fff', fontFamily: "'Poppins', sans-serif", fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', marginBottom: '10px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Poppins', sans-serif", padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: 0 }}>
            👤 Mon <span style={{ color: '#ff2d55' }}>Profil</span>
          </h1>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,45,85,0.35)', borderRadius: '10px', color: '#ff2d55', padding: '7px 16px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
            ← Retour
          </button>
        </div>

        {/* Infos compte */}
        <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #1a1a2e' }}>
          <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>📧 Compte</h2>
          <input style={inputStyle} value={user?.email} disabled />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            {profile?.avatar_image_url
              ? <img src={profile.avatar_image_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff2d55' }} />
              : <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: profile?.avatar_color || '#333', border: '2px solid #ff2d55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff' }}>
                  {profile?.avatar_initials || '?'}
                </div>
            }
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0 }}>{profile?.avatar_name || 'Aucun avatar'}</p>
              <p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0' }}>Avatar actuel</p>
            </div>
          </div>
        </div>

        {/* Changer avatar */}
        <div style={{ background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #1a1a2e' }}>
          <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>🎭 Changer d'avatar</h2>

          {/* Tabs séries */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {series.map(s => (
              <button key={s} onClick={() => setActiveSerie(s)}
                style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeSerie === s ? '#ff2d55' : '#1e1e2e', color: '#fff', fontSize: '12px', fontFamily: "'Poppins', sans-serif' " }}>
                {s}
              </button>
            ))}
          </div>

          {/* Grille avatars */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {getAvatars(activeSerie).map(avatar => (
              <div key={avatar.id} onClick={() => setSelected(avatar)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                  border: selected?.id === avatar.id ? '3px solid #ff2d55' : '3px solid transparent',
                  transform: selected?.id === avatar.id ? 'scale(1.12)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: selected?.id === avatar.id ? '0 0 20px #ff2d5566' : 'none',
                  background: avatar.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {avatar.image_url
                    ? <img src={avatar.image_url} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{avatar.initials}</span>
                  }
                </div>
                <span style={{ color: selected?.id === avatar.id ? '#ff2d55' : '#aaa', fontSize: '10px', textAlign: 'center', maxWidth: '70px' }}>{avatar.name}</span>
              </div>
            ))}
          </div>

          {msg && <p style={{ color: '#4caf50', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>{msg}</p>}

          <button onClick={handleSave} disabled={!selected}
            style={{ width: '100%', padding: '13px', background: selected ? 'linear-gradient(135deg, #ff2d55, #ff6b35)' : '#1e1e2e', border: 'none', borderRadius: '12px', color: selected ? '#fff' : '#555', fontWeight: '700', cursor: selected ? 'pointer' : 'not-allowed', fontSize: '15px', fontFamily: "'Poppins', sans-serif" }}>
            {selected ? `✓ Choisir ${selected.name}` : 'Sélectionne un avatar'}
          </button>
        </div>

        {/* Déconnexion */}
        <button onClick={onLogout}
          style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid rgba(255,45,85,0.35)', borderRadius: '12px', color: '#ff2d55', fontWeight: '600', cursor: 'pointer', fontSize: '14px', fontFamily: "'Poppins', sans-serif" }}>
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}