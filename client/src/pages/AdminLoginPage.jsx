import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/admin'
import { setToken } from '../auth/token'

function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { token } = await login(form.username, form.password)
      setToken(token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__card form" onSubmit={handleSubmit}>
        <h1 className="auth__title">Admin sign in</h1>

        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}

        <label className="form__field">
          <span>Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </label>

        <label className="form__field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default AdminLoginPage
