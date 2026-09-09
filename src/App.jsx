import { useState } from 'react'
import './App.css'

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

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-avatar" aria-hidden="true">
          🐣
        </div>
        <h1 className="sidebar-name">Paco Fiestas</h1>
      </div>

      <div className="sidebar-stats">
        <StatBar {...stats[0]} />
        <StatBar {...stats[1]} />
        <StatBar {...stats[2]} />
        <IntelligenceStat />
        <StatBar {...stats[3]} />
      </div>
    </aside>
  )
}

function App() {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')
  }

  return (
    <div className="app">
      <Sidebar />

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
