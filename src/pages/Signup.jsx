import { useState } from 'react'
import { signUpWithEmail } from '../lib/supabase'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUpWithEmail(email, password, { username, name })
      alert('Check your email to confirm registration.')
      window.location.href = '/login'
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // OAuth removed as requested

  return (
    <main className="signup-page" data-node-id="91:502">
      <section className="signup-hero">
        <h1 className="signup-title">Welcome to PixBooth</h1>
        <div className="signup-subtitle">Your Ultimate Digital Photo Booth!</div>
        <p className="signup-description">Gabung ke PixBooth dan nikmati kemudahan layanan foto digital dari browser – untuk pengguna dan vendor!</p>
      </section>

      <section className="signup-card">
        <form onSubmit={onSubmit} className="signup-form">
          <div className="input-group">
            <input className="input" placeholder="Username" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} required data-node-id="91:520" />
          </div>
          <div className="input-group">
            <input className="input" placeholder="Nama" type="text" value={name} onChange={(e)=>setName(e.target.value)} required data-node-id="91:521" />
          </div>
          <div className="input-group">
            <input className="input" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required data-node-id="91:525" />
          </div>
          <div className="input-group">
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required data-node-id="91:526" />
          </div>
          <button className="signup-button" type="submit" disabled={loading} data-node-id="91:507">{loading ? 'Loading…' : 'Signup'}</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      <footer className="signup-footer">
        <div className="footer-card">
          <div className="footer-col">
            <div className="footer-title">Contact Us</div>
            <div className="footer-text">
              📧 Email: support@pixbooth.io<br />
              📞 Phone: +62 812-3456-7890<br />
              📍 Location: Jakarta, Indonesia
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-title">Follow Us</div>
            <div className="footer-text">
              🔗 Instagram: @pixbooth.io<br />
              🔗 TikTok: @pixbooth.io<br />
              🔗 Twitter/X: @pixbooth_io
            </div>
          </div>
        </div>
        <div className="footer-note">
          <strong>© 2025 PixBooth. All rights reserved.</strong><br />
          Bringing smiles, filters, and memories to your browser.
        </div>
      </footer>
    </main>
  );
}
