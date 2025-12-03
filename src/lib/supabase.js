import { createClient } from '@supabase/supabase-js'

// Prefer env vars for deployments; fallback to provided values for local dev
const SUPABASE_URL = (import.meta?.env?.VITE_SUPABASE_URL) || 'https://ksrugselthfxjjibtgnp.supabase.co'
const SUPABASE_ANON_KEY = (import.meta?.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcnVnc2VsdGhmeGpqaWJ0Z25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTE4NTgsImV4cCI6MjA4MDI2Nzg1OH0.NpxUEw-Dz8v31v5LCvZJTAl4ef9x5ZfFKXwl94yFnTA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data.user
}

export async function signInWithProvider(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Resolve email for a given username from public 'profiles' table
// Expects a row with columns: username, email
export async function resolveEmailForUsername(usernameOrEmail) {
  if (!usernameOrEmail) return null
  if (usernameOrEmail.includes('@')) return usernameOrEmail
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', usernameOrEmail)
    .maybeSingle()
  if (error) throw error
  return data?.email || null
}
