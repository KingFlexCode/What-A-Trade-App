import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function LandingPage() {
  const { isAuthenticated } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        /* Reset only inside landing page */
        .lp * { box-sizing: border-box; }
        .lp a { text-decoration: none; }
      `}</style>
      <div className="lp" id="lp-root">
        {/* We'll inject the landing page HTML here */}
      </div>
    </>
  )
}