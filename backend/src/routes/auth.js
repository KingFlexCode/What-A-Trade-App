// ── Auth Routes ───────────────────────────────────────────────
// POST /auth/signup  — create account
// POST /auth/login   — sign in, returns JWT cookie
// POST /auth/logout  — clear cookie
// GET  /auth/me      — get current user from token

require('dotenv').config()
const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const router   = express.Router()
const supabase = require('../lib/supabase')

const JWT_SECRET  = process.env.JWT_SECRET || 'dev-secret-change-me'
const IS_PROD     = process.env.NODE_ENV === 'production'

// Helper — sign a JWT
function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

// Helper — set JWT as httpOnly cookie
function setAuthCookie(res, token) {
  res.cookie('wt_token', token, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  })
}

// ── POST /auth/signup ─────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, plan = 'free' } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  try {
    // Check if email already exists
    if (supabase) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' })
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    let userId

    if (supabase) {
      // Create user in Supabase
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email:         email.toLowerCase(),
          password_hash: passwordHash,
          first_name:    firstName || '',
          last_name:     lastName  || '',
          plan,
        })
        .select()
        .single()

      if (error) throw error

      userId = user.id

      // Create default settings for new user
      await supabase.from('user_settings').insert({ user_id: userId })

      console.log(`[Auth] New user signed up: ${email}`)
    } else {
      // Dev fallback — no DB
      userId = 'dev-' + Date.now()
      console.log(`[Auth] Dev mode signup (no DB): ${email}`)
    }

    const token = signToken(userId)
    setAuthCookie(res, token)

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: userId, email, firstName, lastName, plan },
    })
  } catch (err) {
    console.error('[Auth] Signup error:', err.message)
    res.status(500).json({ error: 'Signup failed. Please try again.' })
  }
})

// ── POST /auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    let user

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (error || !data) {
        return res.status(401).json({ error: 'Invalid email or password.' })
      }

      const valid = await bcrypt.compare(password, data.password_hash)
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' })
      }

      user = data
      console.log(`[Auth] Login: ${email}`)
    } else {
      // Dev fallback
      user = { id: 'dev-user', email, first_name: 'Dev', last_name: 'User', plan: 'pro' }
      console.log(`[Auth] Dev mode login: ${email}`)
    }

    const token = signToken(user.id)
    setAuthCookie(res, token)

    res.json({
      message: 'Logged in',
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.first_name,
        lastName:  user.last_name,
        plan:      user.plan,
        initials:  `${(user.first_name||'W')[0]}${(user.last_name||'T')[0]}`.toUpperCase(),
      },
    })
  } catch (err) {
    console.error('[Auth] Login error:', err.message)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// ── POST /auth/logout ─────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('wt_token', { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax' })
  res.json({ message: 'Logged out' })
})

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const token = req.cookies?.wt_token

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  try {
    const { userId } = jwt.verify(token, JWT_SECRET)

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, plan, created_at')
        .eq('id', userId)
        .single()

      if (error || !user) return res.status(401).json({ error: 'User not found.' })

      return res.json({
        id:        user.id,
        email:     user.email,
        firstName: user.first_name,
        lastName:  user.last_name,
        plan:      user.plan,
        initials:  `${(user.first_name||'W')[0]}${(user.last_name||'T')[0]}`.toUpperCase(),
      })
    }

    // Dev fallback
    res.json({ id: userId, email: 'dev@whatatrade.io', firstName: 'Dev', lastName: 'User', plan: 'pro', initials: 'DU' })
  } catch {
    res.clearCookie('wt_token')
    res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
})

module.exports = router
