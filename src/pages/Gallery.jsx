import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSession } from '../lib/supabase'
import { getPublicUrl } from '../lib/storage'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const session = await getSession()
        const uid = session?.user?.id
        if (!uid) { setError('Silakan login untuk melihat galeri.'); setLoading(false); return }

        const storage = supabase.storage.from('ImageStore')

        // List top-level under uid to find folders (e.g., layout-single)
        const { data: roots, error: errRoot } = await storage.list(`${uid}`, { limit: 100 })
        if (errRoot) throw errRoot

        const files = []
        for (const entry of roots || []) {
          if (entry.id) {
            // File directly under uid
            files.push({ name: entry.name, path: `${uid}/${entry.name}` })
          } else {
            // Directory: list files inside
            const folder = entry.name
            const { data: children, error: errChild } = await storage.list(`${uid}/${folder}`, { limit: 100 })
            if (errChild) continue
            for (const child of children || []) {
              if (child.id) {
                files.push({ name: child.name, path: `${uid}/${folder}/${child.name}` })
              }
            }
          }
        }

        const enriched = files
          .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name))
          .map(f => ({ ...f, url: getPublicUrl(f.path) }))
        setItems(enriched)
      } catch (e) {
        setError(e?.message || 'Gagal memuat galeri')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onDelete = async (path) => {
    try {
      const { error } = await supabase.storage.from('ImageStore').remove([path])
      if (error) throw error
      setItems(prev => prev.filter(i => i.path !== path))
    } catch (e) {
      alert(e?.message || 'Gagal menghapus gambar')
    }
  }

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Link disalin ke clipboard'); } catch {}
  }

  return (
    <main className="layout-section" aria-label="Your Gallery">
      <div className="layout-title">Galeri Saya</div>
      <div className="layout-desc">Simpan dan kelola hasil render fotomu di sini.</div>
      {loading && <div style={{textAlign:'center'}}>Memuat…</div>}
      {error && <div className="booth-error" style={{maxWidth:600, margin:'0 auto'}}>{error}</div>}
      {!loading && !error && (
        <div style={{maxWidth:1180, margin:'0 auto', padding:'0 32px'}}>
          {items.length === 0 ? (
            <div style={{textAlign:'center', color:'var(--text)'}}>Belum ada gambar. Coba simpan dari Editor.</div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16}}>
              {items.map(i => (
                <div key={i.path} className="shot">
                  <img src={i.url} alt={i.name} />
                  <div className="booth-collage-actions" style={{display:'flex', gap:8}}>
                    <button onClick={() => copy(i.url)} className="choose-btn">Copy Link</button>
                    <button onClick={() => onDelete(i.path)} className="choose-btn" style={{background:'var(--brand)'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
