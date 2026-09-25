import { useState, type FormEvent } from 'react'
import { getSettings, type GreenApiCredentials } from '../api/greenApi'

interface LoginProps {
  onLogin: (creds: GreenApiCredentials) => void
}

export function Login({ onLogin }: LoginProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const creds = { idInstance, apiTokenInstance }
    try {
      await getSettings(creds)
      onLogin(creds)
    } catch {
      setError('Неверные данные, проверьте idInstance/apiTokenInstance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>MAX Chat</h1>
      <label htmlFor="idInstance">
        idInstance
        <input
          id="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          required
        />
      </label>
      <label htmlFor="apiTokenInstance">
        apiTokenInstance
        <input
          id="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          required
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading}>
        {loading ? 'Проверка...' : 'Войти'}
      </button>
    </form>
  )
}
