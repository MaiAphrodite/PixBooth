import { supabase } from './supabase'

// Uploads a Blob/File to the 'ImageStore' bucket.
// Returns public URL if bucket is public; otherwise returns the file path.
export async function uploadRender(userId, file, options = {}) {
  const ext = options.extension || 'png'
  const folder = options.folder || 'user'
  const filename = `${userId}/${folder}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage.from('ImageStore').upload(filename, file, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  })
  if (error) throw error

  // Try to get public URL (works if bucket is public)
  const { data: publicData } = supabase.storage.from('ImageStore').getPublicUrl(data.path)
  return publicData?.publicUrl || data.path
}

export function getPublicUrl(path) {
  const { data } = supabase.storage.from('ImageStore').getPublicUrl(path)
  return data?.publicUrl
}

// Request signed URL from our Elysia server (requires service role configured server-side)
const SERVER_URL = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || 'http://localhost:8787'
export async function getSignedUrl(path, expiresIn = 3600) {
  try {
    const res = await fetch(`${SERVER_URL}/signed-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, expiresIn })
    })
    if (!res.ok) throw new Error(`Server error: ${res.status}`)
    const json = await res.json()
    return json.url || null
  } catch (e) {
    console.error('Signed URL request failed', e)
    return null
  }
}
