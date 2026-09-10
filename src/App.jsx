import { useEffect, useRef, useState } from 'react'
import './App.css'

const BALL_SIZE = 64
const EDGE_MARGIN = 16
const OBSTACLE_PADDING = 16
const SPEED = 2.6
const WANDER = 0.045

function bounceOffRect(x, y, vx, vy, rect) {
  if (!rect) return { x, y, vx, vy }
  const left = rect.left - OBSTACLE_PADDING
  const right = rect.right + OBSTACLE_PADDING
  const top = rect.top - OBSTACLE_PADDING
  const bottom = rect.bottom + OBSTACLE_PADDING
  const ballRight = x + BALL_SIZE
  const ballBottom = y + BALL_SIZE

  const overlaps = x < right && ballRight > left && y < bottom && ballBottom > top
  if (!overlaps) return { x, y, vx, vy, hit: false }

  const penLeft = ballRight - left
  const penRight = right - x
  const penTop = ballBottom - top
  const penBottom = bottom - y
  const minPen = Math.min(penLeft, penRight, penTop, penBottom)

  if (minPen === penLeft) {
    x = left - BALL_SIZE
    vx = -Math.abs(vx)
  } else if (minPen === penRight) {
    x = right
    vx = Math.abs(vx)
  } else if (minPen === penTop) {
    y = top - BALL_SIZE
    vy = -Math.abs(vy)
  } else {
    y = bottom
    vy = Math.abs(vy)
  }

  return { x, y, vx, vy, hit: true }
}

function BouncingBall({ onClick }) {
  const wrapRef = useRef(null)
  const ballRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const ball = ballRef.current
    if (!wrap || !ball) return

    let x = window.innerWidth / 2 - BALL_SIZE / 2
    let y = window.innerHeight / 2 - BALL_SIZE / 2
    const startAngle = Math.random() * Math.PI * 2
    let vx = Math.cos(startAngle) * SPEED
    let vy = Math.sin(startAngle) * SPEED
    let squashTimeout
    let raf

    const tick = () => {
      // gentle random wander so the path never looks mechanical
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * WANDER
      vx = Math.cos(angle) * SPEED
      vy = Math.sin(angle) * SPEED

      x += vx
      y += vy

      const minX = EDGE_MARGIN
      const maxX = window.innerWidth - BALL_SIZE - EDGE_MARGIN
      const minY = EDGE_MARGIN
      const maxY = window.innerHeight - BALL_SIZE - EDGE_MARGIN

      let hitWall = false
      if (x <= minX) {
        x = minX
        vx = Math.abs(vx)
        hitWall = true
      } else if (x >= maxX) {
        x = maxX
        vx = -Math.abs(vx)
        hitWall = true
      }
      if (y <= minY) {
        y = minY
        vy = Math.abs(vy)
        hitWall = true
      } else if (y >= maxY) {
        y = maxY
        vy = -Math.abs(vy)
        hitWall = true
      }

      const sidebarRect = document.querySelector('.sidebar')?.getBoundingClientRect()
      const composerRect = document.querySelector('.composer')?.getBoundingClientRect()

      let result = bounceOffRect(x, y, vx, vy, sidebarRect)
      let hitObstacle = result.hit
      x = result.x
      y = result.y
      vx = result.vx
      vy = result.vy

      result = bounceOffRect(x, y, vx, vy, composerRect)
      hitObstacle = hitObstacle || result.hit
      x = result.x
      y = result.y
      vx = result.vx
      vy = result.vy

      if (hitWall || hitObstacle) {
        ball.classList.add('ball--squash')
        clearTimeout(squashTimeout)
        squashTimeout = setTimeout(() => ball.classList.remove('ball--squash'), 160)
      }

      const tilt = Math.max(-10, Math.min(10, vx * 2.2))
      wrap.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(squashTimeout)
    }
  }, [])

  return (
    <button
      ref={wrapRef}
      type="button"
      className="ball-wrap"
      onClick={onClick}
      aria-label="Ver estadísticas de Paco Fiestas"
    >
      <div ref={ballRef} className="ball">
        <span className="ball-eye">
          <span className="ball-pupil" />
        </span>
        <span className="ball-eye">
          <span className="ball-pupil" />
        </span>
      </div>
    </button>
  )
}

const stats = [
  { label: 'Vida', value: 86, tone: 'life' },
  { label: 'Gana / Sed', value: 54, tone: 'hunger' },
  { label: 'Energía', value: 32, tone: 'energy' },
  { label: 'Salud mental', value: 45, tone: 'sanity' },
]

const intelligences = [
  { label: 'Lingüística', value: 72 },
  { label: 'Lógico-matemática', value: 81 },
  { label: 'Espacial', value: 58 },
  { label: 'Musical', value: 40 },
  { label: 'Corporal-cinestésica', value: 35 },
  { label: 'Intrapersonal', value: 66 },
  { label: 'Interpersonal', value: 74 },
  { label: 'Naturalista', value: 50 },
  { label: 'Emocional', value: 69 },
  { label: 'Creativa', value: 77 },
  { label: 'Colaborativa', value: 63 },
  { label: 'Existencial', value: 45 },
]

const intelligenceAverage = Math.round(
  intelligences.reduce((sum, i) => sum + i.value, 0) / intelligences.length,
)

function StatBar({ label, value, tone, caption }) {
  return (
    <div className="stat">
      <div className="stat-head">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-track">
        <div
          className={`stat-fill stat-fill--${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {caption && <p className="stat-caption">{caption}</p>}
    </div>
  )
}

function IntelligenceStat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="stat">
      <button
        type="button"
        className="stat-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="stat-head">
          <span className="stat-label">Inteligencia</span>
          <span className="stat-value">{intelligenceAverage}</span>
        </div>
        <div className="stat-track">
          <div
            className="stat-fill stat-fill--mind"
            style={{ width: `${intelligenceAverage}%` }}
          />
        </div>
        <p className="stat-caption stat-caption--toggle">
          <svg
            className={`stat-chevron ${open ? 'stat-chevron--open' : ''}`}
            viewBox="0 0 24 24"
            width="12"
            height="12"
            aria-hidden="true"
          >
            <path
              d="M6 9L12 15L18 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </button>

      <div className={`intel-list ${open ? 'intel-list--open' : ''}`}>
        <div className="intel-list-inner">
          {intelligences.map((intel) => (
            <div className="intel-item" key={intel.label}>
              <div className="stat-head">
                <span className="intel-label">{intel.label}</span>
                <span className="intel-value">{intel.value}</span>
              </div>
              <div className="stat-track stat-track--sm">
                <div
                  className="stat-fill stat-fill--mind"
                  style={{ width: `${intel.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Sidebar({ expanded, onToggle }) {
  return (
    <aside className={`sidebar ${expanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}>
      <button
        type="button"
        className="sidebar-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="sidebar-avatar" aria-hidden="true">
          <span className="sidebar-avatar-eye" />
          <span className="sidebar-avatar-eye" />
        </div>
        <h1 className="sidebar-name">Paco Fiestas</h1>
      </button>

      <div className={`sidebar-stats-wrap ${expanded ? 'sidebar-stats-wrap--open' : ''}`}>
        <div className="sidebar-stats">
          <p className="sidebar-section-label">Estadísticas</p>
          <StatBar {...stats[0]} />
          <StatBar {...stats[1]} />
          <StatBar {...stats[2]} />
          <StatBar {...stats[3]} />
          <IntelligenceStat />
        </div>
      </div>
    </aside>
  )
}

function App() {
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')
  }

  useEffect(() => {
    if (!expanded) return

    const handlePointerDown = (e) => {
      if (!e.target.closest('.sidebar')) {
        setExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [expanded])

  return (
    <div className="app">
      <Sidebar expanded={expanded} onToggle={() => setExpanded((e) => !e)} />

      <BouncingBall onClick={() => setExpanded(true)} />

      <div className="composer-dock">
        <form className="composer" onSubmit={handleSubmit}>
          <svg
            className="composer-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="composer-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje"
            aria-label="Mensaje"
          />
          <button
            className="composer-send"
            type="submit"
            aria-label="Enviar"
            disabled={!message.trim()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 12L20 4L13 20L11 13L4 12Z" fill="currentColor" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
