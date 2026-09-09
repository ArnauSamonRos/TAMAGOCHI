import { useState } from 'react'
import './App.css'

const stats = [
  { label: 'Vida', value: 86, tone: 'life' },
  { label: 'Gana / Sed', value: 54, tone: 'hunger' },
  { label: 'Energía', value: 32, tone: 'energy', caption: 'Consumo de tokens' },
  { label: 'Inteligencia', value: 68, tone: 'mind', caption: '12 inteligencias' },
  { label: 'Salud mental', value: 45, tone: 'sanity', caption: 'Aburrimiento, ansiedad…' },
]

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
        {stats.map((stat) => (
          <StatBar key={stat.label} {...stat} />
        ))}
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
