import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSession, signOut } from '../lib/supabase';

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        setUser(session?.user || null);
      } catch {}
    })();
  }, []);

  const displayName = user?.user_metadata?.name || user?.user_metadata?.username || (user?.email ? user.email.split('@')[0] : null);

  const onLogout = async () => {
    try { await signOut(); window.location.href = '/'; } catch {}
  };

  return (
    <header className="header" data-name="header">
      <div className="logo">
        <Link to="/" aria-label="PixBooth Home" className="logo-link">
          <svg width="57" height="30" viewBox="0 0 57 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M9.552 5.384C9.552 6.03467 9.40267 6.632 9.104 7.176C8.80533 7.70933 8.34667 8.14133 7.728 8.472C7.10933 8.80267 6.34133 8.968 5.424 8.968H3.728V13H0.992V1.768H5.424C6.32 1.768 7.07733 1.92267 7.696 2.232C8.31467 2.54133 8.77867 2.968 9.088 3.512C9.39733 4.056 9.552 4.68 9.552 5.384ZM5.216 6.792C5.73867 6.792 6.128 6.66933 6.384 6.424C6.64 6.17867 6.768 5.832 6.768 5.384C6.768 4.936 6.64 4.58933 6.384 4.344C6.128 4.09867 5.73867 3.976 5.216 3.976H3.728V6.792H5.216ZM13.7124 1.768V13H10.9764V1.768H13.7124ZM22.5751 13L20.2871 9.56L18.2711 13H15.1671L18.7671 7.288L15.0871 1.768H18.2711L20.5271 5.16L22.5111 1.768H25.6151L22.0471 7.432L25.7591 13H22.5751ZM7.792 22.24C8.44267 22.3787 8.96533 22.704 9.36 23.216C9.75467 23.7173 9.952 24.2933 9.952 24.944C9.952 25.8827 9.62133 26.6293 8.96 27.184C8.30933 27.728 7.39733 28 6.224 28H0.992V16.768H6.048C7.18933 16.768 8.08 17.0293 8.72 17.552C9.37067 18.0747 9.696 18.784 9.696 19.68C9.696 20.3413 9.52 20.8907 9.168 21.328C8.82667 21.7653 8.368 22.0693 7.792 22.24ZM3.728 21.312H5.52C5.968 21.312 6.30933 21.216 6.544 21.024C6.78933 20.8213 6.912 20.528 6.912 20.144C6.912 19.76 6.78933 19.4667 6.544 19.264C6.30933 19.0613 5.968 18.96 5.52 18.96H3.728V21.312ZM5.744 25.792C6.20267 25.792 6.55467 25.6907 6.8 25.488C7.056 25.2747 7.184 24.9707 7.184 24.576C7.184 24.1813 7.05067 23.872 6.784 23.648C6.528 23.424 6.17067 23.312 5.712 23.312H3.728V25.792H5.744ZM16.8509 28.112C15.7949 28.112 14.8242 27.8667 13.9389 27.376C13.0642 26.8853 12.3655 26.2027 11.8429 25.328C11.3309 24.4427 11.0749 23.4507 11.0749 22.352C11.0749 21.2533 11.3309 20.2667 11.8429 19.392C12.3655 18.5173 13.0642 17.8347 13.9389 17.344C14.8242 16.8533 15.7949 16.608 16.8509 16.608C17.9069 16.608 18.8722 16.8533 19.7469 17.344C20.6322 17.8347 21.3255 18.5173 21.8269 19.392C22.3389 20.2667 22.5949 21.2533 22.5949 22.352C22.5949 23.4507 22.3389 24.4427 21.8269 25.328C21.3149 26.2027 20.6215 26.8853 19.7469 27.376C18.8722 27.8667 17.9069 28.112 16.8509 28.112ZM16.8509 25.616C17.7469 25.616 18.4615 25.3173 18.9949 24.72C19.5389 24.1227 19.8109 23.3333 19.8109 22.352C19.8109 21.36 19.5389 20.5707 18.9949 19.984C18.4615 19.3867 17.7469 19.088 16.8509 19.088C15.9442 19.088 15.2189 19.3813 14.6749 19.968C14.1415 20.5547 13.8749 21.3493 13.8749 22.352C13.8749 23.344 14.1415 24.1387 14.6749 24.736C15.2189 25.3227 15.9442 25.616 16.8509 25.616ZM29.429 28.112C28.373 28.112 27.4023 27.8667 26.517 27.376C25.6423 26.8853 24.9437 26.2027 24.421 25.328C23.909 24.4427 23.653 23.4507 23.653 22.352C23.653 21.2533 23.909 20.2667 24.421 19.392C24.9437 18.5173 25.6423 17.8347 26.517 17.344C27.4023 16.8533 28.373 16.608 29.429 16.608C30.485 16.608 31.4503 16.8533 32.325 17.344C33.2103 17.8347 33.9037 18.5173 34.405 19.392C34.917 20.2667 35.173 21.2533 35.173 22.352C35.173 23.4507 34.917 24.4427 34.405 25.328C33.893 26.2027 33.1997 26.8853 32.325 27.376C31.4503 27.8667 30.485 28.112 29.429 28.112ZM29.429 25.616C30.325 25.616 31.0397 25.3173 31.573 24.72C32.117 24.1227 32.389 23.3333 32.389 22.352C32.389 21.36 32.117 20.5707 31.573 19.984C31.0397 19.3867 30.325 19.088 29.429 19.088C28.5223 19.088 27.797 19.3813 27.253 19.968C26.7197 20.5547 26.453 21.3493 26.453 22.352C26.453 23.344 26.7197 24.1387 27.253 24.736C27.797 25.3227 28.5223 25.616 29.429 25.616ZM44.7751 16.768V18.96H41.7991V28H39.0631V18.96H36.0871V16.768H44.7751ZM55.8763 16.768V28H53.1403V23.376H48.8843V28H46.1483V16.768H48.8843V21.168H53.1403V16.768H55.8763Z" fill="#CC857F" />
            <line x1="29" y1="8" x2="56" y2="8" stroke="#CC857F" strokeWidth="4" />
          </svg>
        </Link>
      </div>
      <nav className="nav" aria-label="Primary">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/how">How It Works?</Link>
        <Link className="nav-link" to="/gallery">Gallery</Link>
        <Link className="nav-link" to="/event">Event</Link>
        <Link className="nav-link" to="/vendor">Vendor</Link>
      </nav>
      <div className="auth">
        {!user ? (
          <>
            <Link to="/signup" className="btn ghost">Sign Up</Link>
            <Link to="/login" className="btn primary">Log In</Link>
          </>
        ) : (
          <div className="user" style={{ position: 'relative' }}>
            <button className="btn ghost" onClick={() => setOpen(v=>!v)} aria-haspopup="menu" aria-expanded={open}>
              {displayName || 'Account'}
            </button>
            {open && (
              <div className="user-menu" role="menu" style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'#fff', border:'1px solid #eee', borderRadius:10, boxShadow:'0 6px 18px rgba(0,0,0,.15)', padding:8, minWidth:160 }}>
                <div style={{ padding:'6px 10px', color:'var(--text-dark)', fontWeight:600 }} role="menuitem">{displayName || user.email}</div>
                <Link to="/gallery" className="nav-link" role="menuitem" style={{ display:'block', padding:'6px 10px' }}>My Gallery</Link>
                <Link to="/event" className="nav-link" role="menuitem" style={{ display:'block', padding:'6px 10px' }}>My Events</Link>
                <button onClick={onLogout} className="btn" role="menuitem" style={{ width:'100%', marginTop:6 }}>Log Out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
