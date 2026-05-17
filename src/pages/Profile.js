import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SERIES = ['Breaking Bad', 'La Casa de Papel', 'Squid Game', 'Mercredi']

// Avatars de fallback si pas de photo uploadée
const FALLBACK_AVATARS = {
  'Breaking Bad': [
    { id: 'walter_white', initials: 'WW', name: 'Walter White', color: '#2d6a4f' },
    { id: 'heisenberg',   initials: 'HB', name: 'Heisenberg',   color: '#1a1a1a' },
    { id: 'jesse',        initials: 'JP', name: 'Jesse Pinkman', color: '#457b9d' },
    { id: 'gus',          initials: 'GF', name: 'Gus Fring',     color: '#e63946' },
    { id: 'hank',         initials: 'HS', name: 'Hank',          color: '#f4a261' },
    { id: 'skyler',       initials: 'SW', name: 'Skyler',        color: '#a8dadc' },
    { id: 'jane',         initials: 'JJ', name: 'Jane',          color: '#a8dadc' },                    
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
    { id: 'gi_hun',   initials: 'GH', name: 'Gi-hun',    color: '#e63946' },
    { id: 'sang_woo', initials: 'SW', name: 'Sang-woo',  color: '#2b2d42' },
    { id: 'ali',      initials: 'AL', name: 'Ali',       color: '#06d6a0' },
    { id: 'frontman', initials: 'FM', name: 'Frontman',  color: '#111' },
  ],
  'Mercredi': [
    { id: 'mercredi', initials: 'ME', name: 'Mercredi', color: '#1a1a2e' },
    { id: 'enid',     initials: 'EN', name: 'Enid',     color: '#9b5de5' },
    { id: 'xavier',   initials: 'XV', name: 'Xavier',   color: '#457b9d' },
  ],
}

// ---------- sous-composant : bulle d'avatar ----------
export function AvatarBubble({ profile, size = 38 }) {
  const fontSize = size * 0.38
  if (profile?.avatar_image_url) {
    return (
      <img
        src={profile.avatar_image_url}
        alt={profile.avatar_name || 'Avatar'}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,45,85,0.6)',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: profile?.avatar_color || '#1a1a2e',
      border: '2px solid rgba(255,45,85,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: '700', color: '#fff',
      fontFamily: "'Poppins', sans-serif",
    }}>
      {profile?.avatar_initials || '?'}
    </div>
  )
}

// ---------- page profil principale ----------
export default function Profile({ user, profile, onBack, onLogout, onAvatarUpdated }) {
  const [tab, setTab] = useState('info')           // 'info' | 'avatar'
  const [activeSerie, setActiveSerie] = useState('Breaking Bad')
  const [avatarOptions, setAvatarOptions] = useState({})
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [watchCount, setWatchCount] = useState(0)
  const [favCount, setFavCount] = useState(0)

  // Charger avatars depuis Supabase + stats
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('avatar_options').select('*')
      if (data?.length) {
        const grouped = {}
        data.forEach(a => {
          if (!grouped[a.serie]) grouped[a.serie] = []
          grouped[a.serie].push(a)
        })
        setAvatarOptions(grouped)
      }
      // Stats (optionnel, pas bloquant si tables absentes)
      try {
        const [{ count: wc }, { count: fc }] = await Promise.all([
          supabase.from('watch_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ])
        setWatchCount(wc || 0)
        setFavCount(fc || 0)
      } catch (_) {}
    }
    load()
  }, [user.id])

  const getAvatars = (serie) => {
    if (avatarOptions[serie]?.length) {
      return avatarOptions[serie].map(a => ({
        id: a.character_id,
        name: a.character_name,
        image_url: a.image_url,
        initials: a.character_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        color: '#1a1a2e',
      }))
    }
    return FALLBACK_AVATARS[serie] || []
  }

  const handleSaveAvatar = async () => {
    if (!selected) return
    setSaving(true)
    setMsg('')
    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_id:        selected.id,
      avatar_name:      selected.name,
      avatar_color:     selected.color || '#1a1a2e',
      avatar_initials:  selected.initials,
      avatar_image_url: selected.image_url || null,
    }, { onConflict: 'id' })
    setMsg('✅ Avatar mis à jour !')
    setSaving(false)
    if (onAvatarUpdated) onAvatarUpdated(selected)
    setTimeout(() => setMsg(''), 2500)
  }

  // ---- styles réutilisables ----
  const tabBtn = (active) => ({
    padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
    background: active ? '#ff2d55' : '#1a1a2e',
    color: active ? '#fff' : '#888',
    fontFamily: "'Poppins', sans-serif", fontSize: '13px', fontWeight: '600',
    transition: 'all 0.2s',
  })

  const statCard = (label, value, icon) => (
    <div style={{
      background: '#1a1a2e', borderRadius: '12px', padding: '1.2rem',
      textAlign: 'center', flex: 1, border: '1px solid #2a2a3e',
    }}>
      <div style={{ fontSize: '28px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ color: '#fff', fontSize: '22px', fontWeight: '800' }}>{value}</div>
      <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>{label}</div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      fontFamily: "'Poppins', sans-serif", paddingTop: '80px',
    }}>
      {/* Navbar identique à Home */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: '22px', fontWeight: '800',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Cine<span style={{ color: '#ff2d55' }}>max</span>
        </button>
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: '1px solid #333', borderRadius: '8px',
            color: '#aaa', padding: '6px 14px', cursor: 'pointer',
            fontSize: '12px', fontFamily: "'Poppins', sans-serif",
          }}
        >
          ← Retour
        </button>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>

        {/* Carte profil hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0f0f1a, #1a0a10)',
          borderRadius: '20px', padding: '2rem',
          border: '1px solid rgba(255,45,85,0.2)',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow décoratif */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,45,85,0.15), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <AvatarBubble profile={profile} size={80} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>
              {profile?.avatar_name || 'Utilisateur'}
            </h2>
            <p style={{
              color: '#666', fontSize: '12px', margin: '0 0 10px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.email}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,45,85,0.12)', borderRadius: '20px',
              padding: '3px 10px', border: '1px solid rgba(255,45,85,0.2)',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff2d55' }} />
              <span style={{ color: '#ff2d55', fontSize: '11px', fontWeight: '600' }}>Membre actif</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'transparent', border: '1px solid #ff2d5540',
              borderRadius: '8px', color: '#ff2d55', padding: '8px 14px',
              cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
          {statCard('Films vus', watchCount, '🎬')}
          {statCard('Favoris', favCount, '❤️')}
          {statCard('Personnage', profile?.avatar_name?.split(' ')[0] || '—', '🎭')}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          <button style={tabBtn(tab === 'info')}   onClick={() => setTab('info')}>👤 Infos</button>
          <button style={tabBtn(tab === 'avatar')} onClick={() => setTab('avatar')}>🎭 Changer d'avatar</button>
        </div>

        {/* Tab : infos */}
        {tab === 'info' && (
          <div style={{
            background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem',
            border: '1px solid #1a1a2e',
          }}>
            <h3 style={{ color: '#fff', fontSize: '15px', margin: '0 0 1.2rem', fontWeight: '700' }}>
              Informations du compte
            </h3>

            {[
              { label: 'Email',      value: user?.email,               icon: '📧' },
              { label: 'Personnage', value: profile?.avatar_name || '—', icon: '🎭' },
              { label: 'Membre depuis', value: user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : '—', icon: '📅' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0', borderBottom: '1px solid #1a1a2e',
              }}>
                <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>{icon}</span>
                <div>
                  <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: '13px', margin: '2px 0 0', wordBreak: 'break-all' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab : changer avatar */}
        {tab === 'avatar' && (
          <div style={{
            background: '#0f0f1a', borderRadius: '16px', padding: '1.5rem',
            border: '1px solid #1a1a2e',
          }}>
            <h3 style={{ color: '#fff', fontSize: '15px', margin: '0 0 1.2rem', fontWeight: '700' }}>
              Choisis ton personnage
            </h3>

            {/* Sélecteur de série */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {SERIES.map(s => (
                <button key={s} onClick={() => setActiveSerie(s)} style={{
                  padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  background: activeSerie === s ? '#ff2d55' : '#1a1a2e',
                  color: activeSerie === s ? '#fff' : '#888',
                  fontSize: '12px', fontFamily: "'Poppins', sans-serif", fontWeight: '600',
                  transition: 'all 0.2s',
                }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Grille avatars */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {getAvatars(activeSerie).map(avatar => {
                const isSelected = selected?.id === avatar.id
                const isCurrent  = !selected && profile?.avatar_id === avatar.id
                const highlight  = isSelected || isCurrent
                return (
                  <div key={avatar.id} onClick={() => setSelected(avatar)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '6px', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                      background: avatar.color,
                      border: highlight ? '3px solid #ff2d55' : '3px solid transparent',
                      transform: highlight ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                      boxShadow: highlight ? '0 0 18px rgba(255,45,85,0.4)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {avatar.image_url
                        ? <img src={avatar.image_url} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>{avatar.initials}</span>
                      }
                    </div>
                    <span style={{
                      color: highlight ? '#ff2d55' : '#666',
                      fontSize: '10px', textAlign: 'center', maxWidth: '70px',
                      transition: 'color 0.2s',
                    }}>
                      {avatar.name}
                    </span>
                    {isCurrent && !isSelected && (
                      <span style={{ color: '#555', fontSize: '9px' }}>actuel</span>
                    )}
                  </div>
                )
              })}
            </div>

            {msg && (
              <p style={{
                color: msg.startsWith('✅') ? '#4caf50' : '#ff4444',
                fontSize: '13px', textAlign: 'center', marginBottom: '12px',
              }}>
                {msg}
              </p>
            )}

            <button
              onClick={handleSaveAvatar}
              disabled={saving || !selected}
              style={{
                width: '100%', padding: '13px',
                background: selected
                  ? 'linear-gradient(135deg, #ff2d55, #ff6b35)'
                  : '#1a1a2e',
                border: 'none', borderRadius: '12px',
                color: selected ? '#fff' : '#444',
                fontWeight: '700', cursor: selected ? 'pointer' : 'not-allowed',
                fontSize: '14px', fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Sauvegarde...' : selected ? `✓ Choisir ${selected.name}` : 'Sélectionne un personnage'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}