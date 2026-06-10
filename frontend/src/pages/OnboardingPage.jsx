import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useStore } from '../store/useStore'
import { LogoAuth } from '../components/ui/Logo'
import { Button } from '../components/ui'

const BROKERS = [
  { id:'thinkorswim', label:'thinkorswim', method:'Auto-sync', color:'#7b6eff', bg:'#4e2eff22' },
  { id:'webull',      label:'Webull',      method:'Auto-sync', color:'#00b4d8', bg:'#00b4d822' },
  { id:'robinhood',   label:'Robinhood',   method:'CSV import',color:'#00c805', bg:'#00c80522' },
  { id:'sofi',        label:'SoFi Invest', method:'CSV import',color:'#ff7f50', bg:'#ff572222' },
]

function Step1({ data, setData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Trading experience</label>
        <select value={data.experience} onChange={(e) => setData({...data, experience: e.target.value})}>
          <option>Beginner (&lt; 1 year)</option>
          <option>Intermediate (1–3 years)</option>
          <option>Advanced (3+ years)</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Primary market</label>
        <select value={data.market} onChange={(e) => setData({...data, market: e.target.value})}>
          <option>US Equities</option><option>Options</option><option>Futures</option><option>Forex</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Account balance ($)</label>
        <input type="number" placeholder="e.g. 25000" value={data.balance} onChange={(e) => setData({...data, balance: e.target.value})} />
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Daily loss limit ($)</label>
        <input type="number" placeholder="e.g. 500" value={data.dailyLimit} onChange={(e) => setData({...data, dailyLimit: e.target.value})} />
      </div>
    </div>
  )
}

function Step2({ linked, setLinked }) {
  function toggle(id) {
    setLinked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {BROKERS.map((b) => {
        const isLinked = linked.includes(b.id)
        return (
          <div key={b.id} onClick={() => toggle(b.id)}
            className={clsx(
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              isLinked ? 'border-[var(--green-border)] bg-[var(--green-dim)]' : 'border-[var(--border)] hover:border-[var(--border-2)]'
            )}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0 font-mono"
              style={{ background: b.bg, color: b.color }}>
              {b.id === 'thinkorswim' ? 'ToS' : b.id === 'sofi' ? 'SF' : b.label.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-[var(--txt-0)] truncate">{b.label}</div>
              <div className="text-[10.5px] text-[var(--txt-2)]">{b.method}</div>
            </div>
            {isLinked
              ? <i className="ti ti-circle-check text-[14px] text-[var(--green)] flex-shrink-0" />
              : <i className="ti ti-circle-plus text-[14px] text-[var(--txt-2)] flex-shrink-0" />}
          </div>
        )
      })}
    </div>
  )
}

function Step3({ goals, setGoals }) {
  function set(k) { return (e) => setGoals((p) => ({ ...p, [k]: e.target.value })) }
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Monthly P&L target ($)</label>
        <input type="number" placeholder="e.g. 5000" value={goals.pnlTarget} onChange={set('pnlTarget')} />
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Target win rate (%)</label>
        <input type="number" placeholder="e.g. 60" value={goals.winRate} onChange={set('winRate')} />
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Max trades per month</label>
        <input type="number" placeholder="e.g. 25" value={goals.maxTrades} onChange={set('maxTrades')} />
      </div>
      <div>
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Target profit factor</label>
        <input type="number" placeholder="e.g. 2.0" step="0.1" value={goals.profitFactor} onChange={set('profitFactor')} />
      </div>
      <div className="col-span-2">
        <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Primary setup to focus on</label>
        <select value={goals.setup} onChange={set('setup')}>
          <option>Breakout</option><option>Mean reversion</option><option>VWAP bounce</option><option>Trend follow</option>
        </select>
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">🚀</div>
      <div className="text-[13px] text-[var(--txt-1)] leading-relaxed">
        Your journal is configured and ready.<br/>
        thinkorswim and Webull are syncing.<br/>
        Head to the dashboard to see your performance.
      </div>
    </div>
  )
}

const STEPS = [
  { title: 'Set up your profile',   sub: 'Tell us about your trading so we can personalise your journal.' },
  { title: 'Connect your brokers',  sub: 'Auto-sync from thinkorswim and Webull. Robinhood and SoFi use CSV.' },
  { title: 'Set your goals',        sub: 'Define what success looks like this month. Update anytime.' },
  { title: "You're all set!",       sub: 'Everything is configured and ready to go.' },
]

export default function OnboardingPage() {
  const [step,    setStep]    = useState(0)
  const [profile, setProfile] = useState({ experience: 'Intermediate (1–3 years)', market: 'US Equities', balance: '', dailyLimit: '' })
  const [linked,  setLinked]  = useState(['thinkorswim','webull'])
  const [goals,   setGoals]   = useState({ pnlTarget: '', winRate: '', maxTrades: '', profitFactor: '', setup: 'Breakout' })
  const { completeOnboarding } = useStore()
  const navigate = useNavigate()

  function next() {
    if (step < STEPS.length - 1) { setStep(step + 1); return }
    completeOnboarding()
    navigate('/')
  }
  function back() { if (step > 0) setStep(step - 1) }

  const stepContent = [
    <Step1 data={profile} setData={setProfile} />,
    <Step2 linked={linked} setLinked={setLinked} />,
    <Step3 goals={goals} setGoals={setGoals} />,
    <Step4 />,
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--bg-2)] border border-[var(--border-2)] rounded-2xl p-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-7">
          {STEPS.map((_, i) => (
            <div key={i} className={clsx(
              'flex-1 h-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-[var(--green)]' : i === step ? 'bg-[var(--accent)]' : 'bg-[var(--bg-4)]'
            )} />
          ))}
        </div>

        <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-2">
          Step {step + 1} of {STEPS.length}
        </div>
        <h2 className="text-[17px] font-semibold text-[var(--txt-0)] mb-1">{STEPS[step].title}</h2>
        <p className="text-[12.5px] text-[var(--txt-2)] mb-5 leading-relaxed">{STEPS[step].sub}</p>

        <div className="min-h-[180px]">{stepContent[step]}</div>

        <div className="flex justify-between mt-6">
          <Button variant="ghost" size="sm" onClick={back} className={step === 0 ? 'invisible' : ''}>
            <i className="ti ti-arrow-left text-[12px]" /> Back
          </Button>
          <Button variant="accent" size="sm" onClick={next}>
            {step === STEPS.length - 1 ? 'Go to dashboard' : 'Continue'}
            {step < STEPS.length - 1 && <i className="ti ti-arrow-right text-[12px]" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
