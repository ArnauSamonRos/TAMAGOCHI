import { useEffect, useMemo, useRef, useState } from 'react'
import { blobatar } from 'blobatar'
import { unsure } from 'blobatar/expression'
import './App.css'

function randomSeed() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `seed-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function BlobFigure({ seed, expression, className }) {
  const markup = useMemo(
    () => blobatar(seed, { background: false, expression }),
    [seed, expression],
  )
  // eslint-disable-next-line react/no-danger
  return <div className={className} dangerouslySetInnerHTML={{ __html: markup }} />
}

const GRASS_PATCHES = [
  // corners
  { x: 70, y: 30, rx: 200, ry: 130, fill: '#9aa384', blades: [[10, -20, -10, 26], [200, -30, 12, 22], [90, 90, -18, 20]] },
  { x: 1530, y: 40, rx: 190, ry: 140, fill: '#93987a', blades: [[1420, -10, -14, 24], [1600, 10, 16, 20], [1500, 110, -10, 22]] },
  { x: 80, y: 870, rx: 210, ry: 130, fill: '#8d9674', blades: [[0, 830, -12, 26], [160, 800, 14, 22], [90, 940, -8, 20]] },
  { x: 1560, y: 850, rx: 180, ry: 130, fill: '#9aa384', blades: [[1470, 800, -10, 24], [1620, 810, 12, 20]] },
  // scattered mid patches
  { x: 560, y: 190, rx: 95, ry: 55, fill: '#93987a', blades: [[540, 160, -14, 22], [590, 155, 10, 18]] },
  { x: 320, y: 305, rx: 42, ry: 32, fill: '#8d9674', blades: [[315, 285, -8, 16]] },
  { x: 1280, y: 320, rx: 70, ry: 48, fill: '#9aa384', blades: [[1265, 295, -10, 18]] },
  { x: 1610, y: 390, rx: 45, ry: 38, fill: '#93987a', blades: [] },
  { x: 700, y: 525, rx: 32, ry: 24, fill: '#8d9674', blades: [] },
  { x: 930, y: 825, rx: 55, ry: 38, fill: '#9aa384', blades: [[915, 805, -8, 16]] },
]

const PEBBLES = [
  [330, 95], [1180, 85], [1135, 160], [1085, 190], [555, 735], [350, 705],
  [1400, 935], [1010, 785], [1040, 805], [620, 500], [680, 560], [1620, 350],
  [270, 275], [1260, 285],
]

const ROCKS = [
  { x: 155, y: 80, scale: 1.4 },
  { x: 95, y: 150, scale: 0.45 },
  { x: 1560, y: 95, scale: 1.5 },
  { x: 1615, y: 130, scale: 0.5 },
  { x: 305, y: 300, scale: 0.55 },
  { x: 1290, y: 315, scale: 0.6 },
  { x: 1010, y: 745, scale: 1.1 },
  { x: 70, y: 850, scale: 1.7 },
  { x: 195, y: 895, scale: 0.5 },
  { x: 1540, y: 620, scale: 1.35 },
]

function Rock({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="36" rx="40" ry="11" fill="rgba(50,50,46,0.16)" />
      <polygon points="-32,8 -35,-8 -10,-24 16,-19 32,-2 24,17 -6,23" fill="#a9aba5" />
      <polygon points="-32,8 -10,-24 -6,23" fill="#888a84" />
      <polygon points="16,-19 32,-2 24,17 -6,23" fill="#c2c4be" />
      <polygon points="-10,-24 16,-19 7,-5 -7,-3" fill="#dcddd7" />
    </g>
  )
}

function TerrainBackground() {
  return (
    <svg
      className="terrain-bg"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="organicEdge" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" />
        </filter>
      </defs>

      <rect x="0" y="0" width="1600" height="900" fill="#efece1" />

      {GRASS_PATCHES.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={p.fill} filter="url(#organicEdge)" />
          {p.blades.map(([bx, by, rot, h], j) => (
            <polygon
              key={j}
              points={`${bx - 2},${by} ${bx + 2},${by} ${bx},${by - h}`}
              fill="#5f6b4a"
              opacity="0.75"
              transform={`rotate(${rot} ${bx} ${by})`}
            />
          ))}
        </g>
      ))}

      {PEBBLES.map(([px, py], i) => (
        <ellipse key={i} cx={px} cy={py} rx="9" ry="6" fill="#b3b5ae" />
      ))}

      {ROCKS.map((r, i) => (
        <Rock key={i} {...r} />
      ))}
    </svg>
  )
}

const BALL_SIZE = 128
const EDGE_MARGIN = 16
const OBSTACLE_PADDING = 16
const HOP_MIN_DIST = 55
const HOP_MAX_DIST = 130
const HOP_HEIGHT = 32
const HOP_MS_PER_PX = 4.2
const HOP_DURATION_MIN = 360
const HOP_DURATION_MAX = 620
const IDLE_MIN = 120
const IDLE_MAX = 420
const MAX_TILT = 16

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function pushOutOfRect(x, y, rect) {
  if (!rect) return { x, y }
  const left = rect.left - OBSTACLE_PADDING
  const right = rect.right + OBSTACLE_PADDING
  const top = rect.top - OBSTACLE_PADDING
  const bottom = rect.bottom + OBSTACLE_PADDING
  const ballRight = x + BALL_SIZE
  const ballBottom = y + BALL_SIZE

  const overlaps = x < right && ballRight > left && y < bottom && ballBottom > top
  if (!overlaps) return { x, y }

  const penLeft = ballRight - left
  const penRight = right - x
  const penTop = ballBottom - top
  const penBottom = bottom - y
  const minPen = Math.min(penLeft, penRight, penTop, penBottom)

  if (minPen === penLeft) return { x: left - BALL_SIZE, y }
  if (minPen === penRight) return { x: right, y }
  if (minPen === penTop) return { x, y: top - BALL_SIZE }
  return { x, y: bottom }
}

function pickHopTarget(x, y) {
  const maxX = window.innerWidth - BALL_SIZE - EDGE_MARGIN
  const maxY = window.innerHeight - BALL_SIZE - EDGE_MARGIN
  const sidebarRect = document.querySelector('.sidebar')?.getBoundingClientRect()
  const composerRect = document.querySelector('.composer')?.getBoundingClientRect()
  const orbRect = document.querySelector('.orb-cluster')?.getBoundingClientRect()

  for (let attempt = 0; attempt < 8; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const dist = HOP_MIN_DIST + Math.random() * (HOP_MAX_DIST - HOP_MIN_DIST)
    let tx = clamp(x + Math.cos(angle) * dist, EDGE_MARGIN, maxX)
    let ty = clamp(y + Math.sin(angle) * dist, EDGE_MARGIN, maxY)

    const p1 = pushOutOfRect(tx, ty, sidebarRect)
    const p2 = pushOutOfRect(p1.x, p1.y, composerRect)
    const p3 = pushOutOfRect(p2.x, p2.y, orbRect)
    tx = clamp(p3.x, EDGE_MARGIN, maxX)
    ty = clamp(p3.y, EDGE_MARGIN, maxY)

    if (Math.hypot(tx - x, ty - y) > 8) {
      return { x: tx, y: ty }
    }
  }
  return { x, y }
}

function BouncingBall({ onClick, confused, seed }) {
  const wrapRef = useRef(null)
  const tiltRef = useRef(null)
  const ballRef = useRef(null)
  const bubbleRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const tilt = tiltRef.current
    const ball = ballRef.current
    const bubble = bubbleRef.current
    if (!wrap || !tilt || !ball) return

    let x = window.innerWidth / 2 - BALL_SIZE / 2
    let y = window.innerHeight / 2 - BALL_SIZE / 2
    let phase = 'idle'
    let phaseStart = performance.now()
    let idleDuration = 300
    let hopFrom = { x, y }
    let hopTo = { x, y }
    let hopDuration = 0
    let tiltDeg = 0
    let raf

    const tick = (now) => {
      const elapsed = now - phaseStart

      let bob = 0

      if (phase === 'idle') {
        bob = Math.sin(elapsed / 190) * 1.5
        if (elapsed >= idleDuration) {
          hopFrom = { x, y }
          hopTo = pickHopTarget(x, y)
          const dist = Math.hypot(hopTo.x - hopFrom.x, hopTo.y - hopFrom.y)
          hopDuration = clamp(dist * HOP_MS_PER_PX, HOP_DURATION_MIN, HOP_DURATION_MAX)
          tiltDeg = clamp(((hopTo.x - hopFrom.x) / dist || 0) * MAX_TILT, -MAX_TILT, MAX_TILT)
          phase = 'hop'
          phaseStart = now
        }
      } else {
        const t = clamp(elapsed / hopDuration, 0, 1)
        const horizT = easeInOutSine(t)
        x = hopFrom.x + (hopTo.x - hopFrom.x) * horizT
        y = hopFrom.y + (hopTo.y - hopFrom.y) * horizT - Math.sin(t * Math.PI) * HOP_HEIGHT

        if (t < 0.12) {
          ball.className = 'ball ball--crouch'
        } else if (t < 0.85) {
          ball.className = 'ball ball--stretch'
        } else {
          ball.className = 'ball'
        }

        if (t >= 1) {
          x = hopTo.x
          y = hopTo.y
          phase = 'idle'
          phaseStart = now
          idleDuration = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN)
          tiltDeg = 0
          ball.className = 'ball ball--land'
          setTimeout(() => {
            if (ball) ball.className = 'ball'
          }, 140)
        }
      }

      wrap.style.transform = `translate(${x}px, ${y + bob}px)`
      tilt.style.transform = `rotate(${tiltDeg}deg)`
      if (bubble) {
        bubble.style.transform = `translate(${x + BALL_SIZE / 2 - 16}px, ${y + bob - 40}px)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <div ref={bubbleRef} className="ball-bubble-wrap" aria-hidden="true">
        <div className={`ball-bubble ${confused ? 'ball-bubble--visible' : ''}`}>?</div>
      </div>
      <button
        ref={wrapRef}
        type="button"
        className="ball-wrap"
        onClick={onClick}
        aria-label="Ver estadísticas"
      >
        <div ref={tiltRef} className="ball-tilt">
          <div ref={ballRef} className="ball">
            <BlobFigure
              seed={seed}
              expression={confused ? unsure : undefined}
              className="blob-figure"
            />
          </div>
        </div>
      </button>
    </>
  )
}

const stats = [
  { label: 'Energía', value: 32, tone: 'energy', icon: '⚡' },
  { label: 'Salud mental', value: 45, tone: 'sanity', icon: '🧠' },
]

const orbStats = [
  { label: 'Vida', value: 86, tone: 'life' },
  { label: 'Hambre', value: 54, tone: 'hunger' },
  { label: 'Sed', value: 68, tone: 'thirst' },
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

function StatBar({ label, value, tone, icon, caption }) {
  return (
    <div className="stat">
      <div className={`stat-icon stat-icon--${tone}`} aria-hidden="true">
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-head">
          <span className="stat-label">{label}</span>
          <span className={`stat-value stat-value--${tone}`}>{value}</span>
        </div>
        <div className="stat-track">
          <div
            className={`stat-fill stat-fill--${tone}`}
            style={{ width: `${value}%` }}
          />
        </div>
        {caption && <p className="stat-caption">{caption}</p>}
      </div>
    </div>
  )
}

function IntelligenceStat() {
  const [open, setOpen] = useState(false)

  return (
    <div className="stat">
      <div className="stat-icon stat-icon--mind" aria-hidden="true">
        🧩
      </div>
      <div className="stat-body">
        <button
          type="button"
          className="stat-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className="stat-head">
            <span className="stat-label">
              Inteligencia
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
            </span>
            <span className="stat-value stat-value--mind">{intelligenceAverage}</span>
          </div>
          <div className="stat-track">
            <div
              className="stat-fill stat-fill--mind"
              style={{ width: `${intelligenceAverage}%` }}
            />
          </div>
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
    </div>
  )
}

function Orb({ label, value, tone }) {
  return (
    <div className={`orb orb--${tone}`} aria-label={`${label}: ${value}%`}>
      <div className="orb-clip">
        <div className="orb-fill" style={{ height: `${value}%` }}>
          <span className="orb-wave-strip orb-wave-strip--1" />
          <span className="orb-wave-strip orb-wave-strip--2" />
        </div>
        <span className="orb-sheen" aria-hidden="true" />
        <span className="orb-percent">{value}%</span>
      </div>
    </div>
  )
}

function OrbCluster() {
  return (
    <div className="orb-cluster">
      {orbStats.map((orb) => (
        <Orb key={orb.label} {...orb} />
      ))}
    </div>
  )
}

function Sidebar({ expanded, onToggle, name, seed }) {
  return (
    <aside className={`sidebar ${expanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}>
      <button
        type="button"
        className="sidebar-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="sidebar-avatar" aria-hidden="true">
          <BlobFigure seed={seed} className="blob-figure" />
        </div>
        <h1 className="sidebar-name">{name}</h1>
        <svg
          className="sidebar-chevron"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            d="M9 6L15 12L9 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className={`sidebar-stats-wrap ${expanded ? 'sidebar-stats-wrap--open' : ''}`}>
        <div className="sidebar-stats">
          <p className="sidebar-section-label">Estadísticas</p>
          <StatBar {...stats[0]} />
          <StatBar {...stats[1]} />
          <IntelligenceStat />
        </div>
      </div>
    </aside>
  )
}

const HATCH_CLICKS = 10
const SPECKLE_TONES = ['life', 'hunger', 'energy', 'mind', 'sanity']
const SPECKLES = [
  { top: '28%', left: '32%', size: 7, tone: 0 },
  { top: '48%', left: '64%', size: 6, tone: 3 },
  { top: '62%', left: '38%', size: 5, tone: 2 },
  { top: '38%', left: '54%', size: 4, tone: 4 },
  { top: '58%', left: '58%', size: 5, tone: 1 },
]

function EggNest({ onHatch }) {
  const [clicks, setClicks] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [hatching, setHatching] = useState(false)

  const handleClick = () => {
    if (hatching) return
    const next = clicks + 1
    setClicks(next)
    setShakeKey((k) => k + 1)

    if (next >= HATCH_CLICKS) {
      setHatching(true)
      setTimeout(onHatch, 550)
    }
  }

  return (
    <div className="egg-scene">
      <svg className="nest" viewBox="0 0 200 90" aria-hidden="true">
        <ellipse cx="100" cy="60" rx="95" ry="26" fill="url(#nestBase)" />
        <ellipse cx="100" cy="48" rx="78" ry="22" fill="url(#nestRim)" />
        <defs>
          <linearGradient id="nestBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9bd93" />
            <stop offset="100%" stopColor="#c7a374" />
          </linearGradient>
          <linearGradient id="nestRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0dcb8" />
            <stop offset="100%" stopColor="#dcbe8f" />
          </linearGradient>
        </defs>
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse
            key={i}
            cx={100 + Math.cos((i / 16) * Math.PI * 2) * 76}
            cy={50 + Math.sin((i / 16) * Math.PI * 2) * 20}
            rx="14"
            ry="3.4"
            fill="#b8935f"
            opacity="0.55"
            transform={`rotate(${(i / 16) * 360} ${
              100 + Math.cos((i / 16) * Math.PI * 2) * 76
            } ${50 + Math.sin((i / 16) * Math.PI * 2) * 20})`}
          />
        ))}
      </svg>

      <button
        type="button"
        className="egg-button"
        onClick={handleClick}
        aria-label="Toca el huevo para incubarlo"
      >
        <div key={shakeKey} className={`egg ${hatching ? 'egg--hatch' : 'egg--shake'}`}>
          {SPECKLES.map((s, i) => (
            <span
              key={i}
              className={`egg-speckle egg-speckle--${SPECKLE_TONES[s.tone]}`}
              style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
            />
          ))}
          {clicks >= 3 && <span className="egg-crack egg-crack--1" />}
          {clicks >= 6 && <span className="egg-crack egg-crack--2" />}
          {clicks >= 9 && <span className="egg-crack egg-crack--3" />}
        </div>
      </button>

      <div className="egg-progress" aria-hidden="true">
        {Array.from({ length: HATCH_CLICKS }).map((_, i) => (
          <span key={i} className={`egg-dot ${i < clicks ? 'egg-dot--filled' : ''}`} />
        ))}
      </div>
      <p className="egg-hint">Toca el huevo para incubarlo</p>
    </div>
  )
}

function NamingModal({ onConfirm, seed }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  return (
    <div className="naming-overlay">
      <form className="naming-card" onSubmit={handleSubmit}>
        <div className="naming-avatar" aria-hidden="true">
          <BlobFigure seed={seed} className="blob-figure" />
        </div>
        <h2 className="naming-title">¡Ha nacido!</h2>
        <p className="naming-subtitle">Ponle un nombre a tu nueva mascota</p>
        <input
          className="naming-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          maxLength={24}
          autoFocus
        />
        <button className="naming-submit" type="submit" disabled={!name.trim()}>
          ¡Listo!
        </button>
      </form>
    </div>
  )
}

function App() {
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)

  const [stage, setStage] = useState(() => localStorage.getItem('tamagochi:stage') || 'egg')
  const [creatureName, setCreatureName] = useState(
    () => localStorage.getItem('tamagochi:name') || '',
  )
  const [creatureSeed, setCreatureSeed] = useState(
    () => localStorage.getItem('tamagochi:seed') || '',
  )

  const handleHatch = () => {
    const seed = randomSeed()
    setCreatureSeed(seed)
    setStage('naming')
    localStorage.setItem('tamagochi:seed', seed)
    localStorage.setItem('tamagochi:stage', 'naming')
  }

  const handleReset = () => {
    localStorage.removeItem('tamagochi:stage')
    localStorage.removeItem('tamagochi:name')
    localStorage.removeItem('tamagochi:seed')
    window.location.reload()
  }

  const handleNameConfirm = (name) => {
    setCreatureName(name)
    setStage('alive')
    localStorage.setItem('tamagochi:name', name)
    localStorage.setItem('tamagochi:stage', 'alive')
  }

  const [reacting, setReacting] = useState(false)
  const reactTimeoutRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')

    setReacting(true)
    clearTimeout(reactTimeoutRef.current)
    reactTimeoutRef.current = setTimeout(() => setReacting(false), 3000)
  }

  useEffect(() => () => clearTimeout(reactTimeoutRef.current), [])

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

  const hasCreature = stage === 'alive'

  return (
    <div className="app">
      <TerrainBackground />

      <button
        type="button"
        className="reset-button"
        onClick={handleReset}
        aria-label="Reiniciar (volver al huevo)"
        title="Reiniciar (volver al huevo)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {hasCreature && (
        <Sidebar
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
          name={creatureName}
          seed={creatureSeed}
        />
      )}

      {hasCreature && <OrbCluster />}

      {stage === 'egg' && <EggNest onHatch={handleHatch} />}
      {stage === 'naming' && (
        <NamingModal onConfirm={handleNameConfirm} seed={creatureSeed} />
      )}

      {hasCreature && (
        <BouncingBall
          onClick={() => setExpanded(true)}
          confused={reacting}
          seed={creatureSeed}
        />
      )}

      {hasCreature && (
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
      )}
    </div>
  )
}

export default App
