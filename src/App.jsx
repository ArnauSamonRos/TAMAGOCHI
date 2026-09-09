import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')
  }

  return (
    <div className="app">
      <form className="composer" onSubmit={handleSubmit}>
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
            <path
              d="M4 12L20 4L13 20L11 13L4 12Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default App
