import React from 'react'

// ── Trader Pulse — Logo E ─────────────────────────────────────
// Clean wordmark with a subtle pulse wave underline.
// No icon block — the typography IS the brand.

export function LogoMark({ size = 32 }) {
  // Compact square favicon version of the wordmark for collapsed sidebar
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#378ADD" opacity="0.12" />
      {/* Mini pulse wave */}
      <polyline
        points="4,20 8,20 10,13 12,24 14,9 16,20 20,20 22,16 24,18 28,18"
        stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />
      <circle cx="28" cy="18" r="2" fill="#378ADD" />
    </svg>
  )
}

// Full horizontal wordmark — used in the sidebar
export function LogoFull({ collapsed = false }) {
  if (collapsed) return <LogoMark size={28} />

  return (
    <svg width="152" height="28" viewBox="0 0 152 28" fill="none" aria-label="WhatATrade!" role="img">
      <title>WhatATrade!</title>
      {/* Wordmark */}
      <text
        x="0" y="20"
        fontFamily="Outfit, ui-sans-serif, system-ui"
        fontSize="18" fontWeight="500"
        fill="var(--txt-0)"
      >
        Trader
      </text>
      <text
        x="64" y="20"
        fontFamily="Outfit, ui-sans-serif, system-ui"
        fontSize="18" fontWeight="300"
        fill="#378ADD"
      >
        Pulse
      </text>
      {/* Pulse underline — spans full wordmark width */}
      <polyline
        points="0,25 14,25 17,20 20,28 23,15 26,25 40,25 47,21 54,23 64,23 152,23"
        stroke="#378ADD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.55"
      />
      {/* Live dot */}
      <circle cx="54" cy="23" r="1.8" fill="#378ADD" opacity="0.8" />
    </svg>
  )
}

// Large centred version for auth / onboarding screens
export function LogoAuth() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="220" height="40" viewBox="0 0 220 40" fill="none" aria-label="WhatATrade!" role="img">
        <title>WhatATrade!</title>
        <text
          x="0" y="30"
          fontFamily="Outfit, ui-sans-serif, system-ui"
          fontSize="28" fontWeight="500"
          fill="var(--txt-0)"
        >
          Trader
        </text>
        <text
          x="96" y="30"
          fontFamily="Outfit, ui-sans-serif, system-ui"
          fontSize="28" fontWeight="300"
          fill="#378ADD"
        >
          Pulse
        </text>
        <polyline
          points="0,36 20,36 24,29 28,40 32,22 36,36 56,36 66,30 76,33 96,33 220,33"
          stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          fill="none" opacity="0.5"
        />
        <circle cx="76" cy="33" r="2.5" fill="#378ADD" opacity="0.8" />
      </svg>
      <span style={{
        fontSize: 11,
        color: 'var(--txt-2)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: 'Outfit, ui-sans-serif',
      }}>
        Trading Journal
      </span>
    </div>
  )
}

export default LogoFull
