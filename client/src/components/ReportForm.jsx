import { useState } from 'react'
import { submitReport } from '../api/reports'
import { CONCERN_TYPES, DISCLAIMER } from '../config'

const EMPTY_FORM = {
  address: '',
  concern_type: '',
  description: '',
  region: '',
  website: '',
}

function ReportForm({ onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    try {
      await submitReport(form)
      setForm(EMPTY_FORM)
      setStatus('submitted')
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (status === 'submitted') {
    return (
      <div className="form__confirmation" role="status">
        <h2>Thank you — your report was submitted.</h2>
        <p>
          It is <strong>pending review</strong> and will appear on the map once approved. It will be
          shown as an unverified resident submission.
        </p>
        <button type="button" onClick={() => setStatus('idle')}>
          Submit another report
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate={false}>
      <p className="form__notice">{DISCLAIMER}s are reviewed before appearing on the map.</p>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <label className="form__field">
        <span>Address</span>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          placeholder="1234 Data Center Way, Ashburn, VA"
        />
      </label>

      <label className="form__field">
        <span>Concern type</span>
        <select name="concern_type" value={form.concern_type} onChange={handleChange} required>
          <option value="">Select a concern…</option>
          {CONCERN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>

      <label className="form__field">
        <span>Description</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          placeholder="What have you noticed?"
        />
      </label>

      <label className="form__field">
        <span>
          Region <em>(optional)</em>
        </span>
        <input
          name="region"
          value={form.region}
          onChange={handleChange}
          placeholder="Loudoun County, VA"
        />
      </label>

      {/* Honeypot: hidden from people, so anything filling it is a bot. The backend
          silently discards submissions where `website` is non-empty. */}
      <div className="form__honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          value={form.website}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting…' : 'Submit report'}
      </button>
    </form>
  )
}

export default ReportForm
