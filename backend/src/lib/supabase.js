// ── Supabase client ───────────────────────────────────────────
// Single shared instance used across all routes.
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL         = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('⚠️  Supabase credentials not set — database features disabled.')
  console.warn('   Add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file.')
}

// Use the service role key on the backend so we bypass RLS for server operations.
// NEVER expose this key to the frontend.
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

module.exports = supabase
