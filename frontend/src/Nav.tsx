import { useNavigate, useLocation } from 'react-router-dom'

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 5%', height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(0,0,8,0.82)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.055)',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    }}>
      <button onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0
      }}>
        <div style={{
          width: '28px', height: '28px',
          background: 'linear-gradient(135deg, #0f2fa8, #1f55ff)',
          borderRadius: '6px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff',
          flexShrink: 0
        }}>HR</div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.01em' }}>
          Projector
        </span>
      </button>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => navigate('/today')} style={{
          background: isActive('/today') ? 'rgba(80,140,255,0.12)' : 'transparent',
          border: `1px solid ${isActive('/today') ? 'rgba(80,140,255,0.4)' : 'rgba(80,140,255,0.2)'}`,
          color: isActive('/today') ? '#88bbff' : 'rgba(255,255,255,0.6)',
          padding: '7px 16px', borderRadius: '6px', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em',
          transition: 'all 0.15s'
        }}>
          Today's Candidates
        </button>
        <button onClick={() => navigate('/projector')} style={{
          background: isActive('/projector')
            ? 'linear-gradient(135deg, #1535bb, #2760ff)'
            : 'linear-gradient(135deg, #0f2fa8, #1f55ff)',
          border: 'none', color: '#fff', padding: '7px 16px',
          borderRadius: '6px', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', letterSpacing: '0.01em',
          boxShadow: '0 0 24px rgba(20,70,255,0.25)',
          transition: 'all 0.15s'
        }}>
          Projector →
        </button>
      </div>
    </nav>
  )
}
