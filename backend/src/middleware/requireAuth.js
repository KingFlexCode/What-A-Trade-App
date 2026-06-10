// ── Auth Middleware ───────────────────────────────────────────
// Add to any route that requires authentication:
//   router.get('/protected', requireAuth, handler)

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function requireAuth(req, res, next) {
  const token = req.cookies?.wt_token

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  try {
    const payload  = jwt.verify(token, JWT_SECRET)
    req.userId     = payload.userId
    next()
  } catch {
    res.clearCookie('wt_token')
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
}

module.exports = requireAuth
