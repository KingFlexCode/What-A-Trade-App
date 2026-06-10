import React from 'react'

// WhatATrade! — Logo Concept C
// Dark icon: blue pulse-wave chart line, green dot = the exclamation point.
// Wordmark: "What" bold + "A" blue accent + "Trade" light + green "!"

export function LogoMark({ size = 32 }) {
  const s = size
  const pts = [
    [0.14,0.78],[0.27,0.78],[0.34,0.59],[0.41,0.86],
    [0.48,0.41],[0.55,0.65],[0.62,0.65],[0.72,0.53],
    [0.81,0.60],[0.88,0.60],
  ].map(([x,y]) => `${(x*s).toFixed(1)},${(y*s).toFixed(1)}`).join(' ')
  const dotX = (0.88*s).toFixed(1)
  const dotY = (0.60*s).toFixed(1)
  const dotR = (s*0.07).toFixed(1)
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" aria-hidden="true">
      <rect width={s} height={s} rx={s*0.22} fill="#0e1017"/>
      <polyline points={pts} stroke="#378ADD" strokeWidth={s*0.078} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={dotX} cy={dotY} r={dotR} fill="#22d87a"/>
    </svg>
  )
}

// Sidebar full logo — icon + wordmark
export function LogoFull({ collapsed = false }) {
  if (collapsed) return <LogoMark size={30}/>
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
      <LogoMark size={32}/>
      <svg width="136" height="22" viewBox="0 0 136 22" fill="none" aria-label="WhatATrade!" role="img" style={{flexShrink:0}}>
        <text x="0"   y="17" fontFamily="Outfit,ui-sans-serif" fontSize="16" fontWeight="600" fill="var(--txt-0,#f0f2ff)">What</text>
        <text x="48"  y="17" fontFamily="Outfit,ui-sans-serif" fontSize="16" fontWeight="400" fill="#378ADD">A</text>
        <text x="60"  y="17" fontFamily="Outfit,ui-sans-serif" fontSize="16" fontWeight="300" fill="var(--txt-0,#f0f2ff)">Trade</text>
        <text x="110" y="17" fontFamily="Outfit,ui-sans-serif" fontSize="18" fontWeight="700" fill="#22d87a">!</text>
      </svg>
    </div>
  )
}

// Large centred version for login / signup / onboarding
export function LogoAuth() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
      <LogoMark size={52}/>
      <svg width="210" height="36" viewBox="0 0 210 36" fill="none" aria-label="WhatATrade!" role="img">
        <text x="0"   y="28" fontFamily="Outfit,ui-sans-serif" fontSize="26" fontWeight="600" fill="var(--txt-0,#f0f2ff)">What</text>
        <text x="78"  y="28" fontFamily="Outfit,ui-sans-serif" fontSize="26" fontWeight="400" fill="#378ADD">A</text>
        <text x="97"  y="28" fontFamily="Outfit,ui-sans-serif" fontSize="26" fontWeight="300" fill="var(--txt-0,#f0f2ff)">Trade</text>
        <text x="183" y="28" fontFamily="Outfit,ui-sans-serif" fontSize="30" fontWeight="700" fill="#22d87a">!</text>
      </svg>
      <span style={{fontSize:10,color:'var(--txt-2,#5c6285)',letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:'Outfit,ui-sans-serif'}}>
        Trading Journal
      </span>
    </div>
  )
}

export default LogoFull
