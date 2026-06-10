// ── Trades Routes — backed by Supabase ───────────────────────
const express     = require('express')
const router      = express.Router()
const { v4: uuid} = require('uuid')
const supabase    = require('../lib/supabase')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

// GET /trades
router.get('/', async (req, res) => {
  const { broker, symbol, direction, from, to } = req.query
  try {
    if (supabase) {
      let q = supabase.from('trades').select('*').eq('user_id', req.userId).order('trade_date', { ascending: false })
      if (broker)    q = q.eq('broker', broker)
      if (symbol)    q = q.eq('symbol', symbol.toUpperCase())
      if (direction) q = q.eq('direction', direction)
      if (from)      q = q.gte('trade_date', from)
      if (to)        q = q.lte('trade_date', to)
      const { data, error } = await q
      if (error) throw error
      return res.json({ count: data.length, trades: data })
    }
    res.json({ count: 0, trades: [] })
  } catch (err) {
    console.error('[Trades] List error:', err.message)
    res.status(500).json({ error: 'Failed to fetch trades.' })
  }
})

// POST /trades
router.post('/', async (req, res) => {
  const input = Array.isArray(req.body) ? req.body : [req.body]
  const rows = input.filter(t => t.symbol && t.entry_price).map(t => ({
    id: uuid(), user_id: req.userId,
    symbol: t.symbol?.toUpperCase()?.trim(),
    direction: t.direction || 'Long',
    quantity: parseFloat(t.quantity) || 0,
    entry_price: parseFloat(t.entry_price) || 0,
    exit_price: t.exit_price ? parseFloat(t.exit_price) : null,
    stop_loss: t.stop_loss ? parseFloat(t.stop_loss) : null,
    commission: parseFloat(t.commission) || 0,
    pnl: computePnl(t), rr: computeRR(t),
    setup: t.setup || null, instrument: t.instrument || 'Stock',
    broker: t.broker || 'manual', broker_order_id: t.broker_order_id || null,
    option_type: t.option_type || null, strike_price: t.strike_price || null, expiry_date: t.expiry_date || null,
    emotion: t.emotion || null, tags: t.tags || [], notes: t.notes || '',
    trade_date: t.trade_date || t.date || new Date().toISOString().slice(0, 10),
  }))
  try {
    if (supabase && rows.length) {
      const { data, error } = await supabase.from('trades').insert(rows).select()
      if (error) throw error
      return res.status(201).json({ added: data.length, trades: data })
    }
    res.status(201).json({ added: rows.length, trades: rows })
  } catch (err) {
    console.error('[Trades] Create error:', err.message)
    res.status(500).json({ error: 'Failed to save trades.' })
  }
})

// PATCH /trades/:id
router.patch('/:id', async (req, res) => {
  const allowed = ['setup','tags','emotion','notes','exit_price','exit_time','commission']
  const updates = {}
  for (const f of allowed) { if (req.body[f] !== undefined) updates[f] = req.body[f] }
  if (req.body.exit_price) { updates.pnl = computePnl(req.body); updates.rr = computeRR(req.body) }
  try {
    if (supabase) {
      const { data, error } = await supabase.from('trades').update(updates).eq('id', req.params.id).eq('user_id', req.userId).select().single()
      if (error) throw error
      return res.json(data)
    }
    res.json({ id: req.params.id, ...updates })
  } catch (err) {
    console.error('[Trades] Update error:', err.message)
    res.status(500).json({ error: 'Failed to update trade.' })
  }
})

// DELETE /trades/:id
router.delete('/:id', async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase.from('trades').delete().eq('id', req.params.id).eq('user_id', req.userId)
      if (error) throw error
    }
    res.json({ success: true })
  } catch (err) {
    console.error('[Trades] Delete error:', err.message)
    res.status(500).json({ error: 'Failed to delete trade.' })
  }
})

// GET /trades/summary
router.get('/summary', async (req, res) => {
  try {
    let trades = []
    if (supabase) {
      const { data, error } = await supabase.from('trades').select('pnl').eq('user_id', req.userId).not('exit_price', 'is', null)
      if (error) throw error
      trades = data
    }
    if (!trades.length) return res.json({ message: 'No closed trades yet.' })
    const wins = trades.filter(t => t.pnl > 0), losses = trades.filter(t => t.pnl <= 0)
    const netPnl = trades.reduce((s, t) => s + (t.pnl||0), 0)
    const avgWin  = wins.length   ? wins.reduce((s,t)=>s+t.pnl,0)/wins.length   : 0
    const avgLoss = losses.length ? losses.reduce((s,t)=>s+t.pnl,0)/losses.length : 0
    res.json({
      total: trades.length, wins: wins.length, losses: losses.length,
      winRate: (wins.length/trades.length*100).toFixed(1)+'%',
      netPnl: netPnl.toFixed(2), avgWin: avgWin.toFixed(2), avgLoss: avgLoss.toFixed(2),
      profitFactor: avgLoss ? Math.abs(avgWin/avgLoss).toFixed(2) : 'N/A',
    })
  } catch (err) {
    console.error('[Trades] Summary error:', err.message)
    res.status(500).json({ error: 'Failed to compute summary.' })
  }
})

function computePnl({ direction, quantity, entry_price, exit_price, commission=0 }) {
  const e=parseFloat(entry_price), x=parseFloat(exit_price), q=parseFloat(quantity), f=parseFloat(commission)||0
  if(!x||!e||!q) return null
  return parseFloat(((direction==='Long'?(x-e):(e-x))*q-f).toFixed(2))
}
function computeRR({ direction, entry_price, exit_price, stop_loss }) {
  const e=parseFloat(entry_price), x=parseFloat(exit_price), s=parseFloat(stop_loss)
  if(!x||!e||!s) return null
  const risk=Math.abs(e-s); if(!risk) return null
  return parseFloat((Math.abs(x-e)/risk).toFixed(2))
}

module.exports = router
