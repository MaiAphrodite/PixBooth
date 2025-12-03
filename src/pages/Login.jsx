import { useState } from 'react'
import { signInWithEmail } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Native Supabase auth uses email/password
      await signInWithEmail(email, password)
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="signup-page" data-node-id="91:431">
      <section className="signup-hero">
        <h1 className="signup-title">Welcome to PixBooth</h1>
        <div className="signup-subtitle">Your Ultimate Digital Photo Booth!</div>
        <p className="signup-description">Masuk ke akun PixBooth Anda untuk mengakses dashboard, event, dan galeri.</p>
      </section>

      <section className="signup-card">
        <form onSubmit={onSubmit} className="signup-form">
          <div className="input-group">
            <input className="input" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required data-node-id="91:470" />
          </div>
          <div className="input-group">
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required data-node-id="91:474" />
          </div>
          <button className="signup-button" type="submit" disabled={loading} data-node-id="91:472">{loading ? 'Loading…' : 'Login'}</button>
        </form>
        <div style={{marginTop:8, textAlign:'center'}}>
          <span style={{ color: 'var(--brand)', fontStyle: 'italic' }}>Belum punya akun?</span>{' '}
          <a href="/signup" style={{ color: 'var(--brand)', fontStyle: 'italic', textDecoration: 'underline' }}>Daftar sekarang!</a>
        </div>
        <div style={{marginTop:6, textAlign:'center'}}>
          <a href="#" style={{ color: 'var(--brand)', fontStyle: 'italic' }}>Lupa kata sandi</a>
        </div>
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
