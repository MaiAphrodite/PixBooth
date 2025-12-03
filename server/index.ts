import { Elysia } from 'elysia'
import { createClient } from '@supabase/supabase-js'

const app = new Elysia()

// Expect env vars for secure operations
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ksrugselthfxjjibtgnp.supabase.co'
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

const supabaseAdmin = SUPABASE_SERVICE_ROLE ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE) : null

app.get('/', () => ({ ok: true }))

// Example: create signed URL for a private render path
app.post('/signed-url', async ({ body, set }) => {
  try {
    if (!supabaseAdmin) {
      set.status = 500
      return { error: 'Service role not configured' }
    }
    const { path } = body as { path: string }
    if (!path) {
      set.status = 400
      return { error: 'path required' }
    }
    const { data, error } = await supabaseAdmin.storage.from('renders').createSignedUrl(path, 3600)
    if (error) {
      set.status = 500
      return { error: error.message }
    }
    return { url: data?.signedUrl }
  } catch (e: any) {
    set.status = 500
    return { error: e?.message || 'internal error' }
  }
})

app.listen(8787)
console.log(`Elysia server running on http://localhost:8787`)