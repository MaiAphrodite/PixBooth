import { useEffect, useState } from 'react'
import { getSession } from '../lib/supabase'

export default function Thankyou() {
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession()
        const user = session?.user
        const name = user?.user_metadata?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || ''
        setDisplayName(name ? `, ${capitalize(name)}` : '!')
      } catch {
        setDisplayName('!')
      }
    })()
  }, [])

  return (
    <main className="signup-page" data-node-id="91:573">
      <section className="signup-hero">
        <h1 className="signup-title">Welcome to PixBooth{displayName}</h1>
        <p className="signup-description" style={{maxWidth:720, marginTop:12}}>
          Akun Anda telah berhasil dibuat.<br />
          Kami sangat senang Anda bergabung dengan platform kami.
        </p>
        <button className="signup-button" style={{width:92}} onClick={() => { window.location.href = '/login' }} data-node-id="91:595">Login</button>
        <div style={{ marginTop: 24 }} className="signup-description" data-node-id="91:594">
          Butuh bantuan?<br />
          Hubungi tim kami di <a href="mailto:support@pixbooth.id" style={{ textDecoration: 'underline' }}>support@pixbooth.id</a><br />
          atau klik <strong>Pusat Bantuan.</strong>
        </div>
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
  )
}

function capitalize(s){
  try { return s.charAt(0).toUpperCase() + s.slice(1) } catch { return s }
}
