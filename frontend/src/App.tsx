import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const judgeRef = useRef<HTMLImageElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      drift: Math.random() * 0.002 + 0.001
    }))

    let ballT = 0
    const trail: { x: number; y: number }[] = []
    let raf: number

    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const a = 0.15 + 0.5 * Math.abs(Math.sin(Date.now() * s.drift))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,210,255,${a})`
        ctx.fill()
      })
      ballT = (ballT + 0.0025) % 1
      const bx = canvas.width * 0.3 + ballT * canvas.width * 0.65
      const by = canvas.height * 0.75 - Math.sin(ballT * Math.PI) * canvas.height * 0.58
      trail.push({ x: bx, y: by })
      if (trail.length > 40) trail.shift()
      trail.forEach((p, i) => {
        const ratio = i / trail.length
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4.5 * ratio, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(50,120,255,${ratio * 0.6})`
        ctx.fill()
      })
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 14)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.4, 'rgba(160,210,255,0.8)')
      grad.addColorStop(1, 'rgba(30,80,255,0)')
      ctx.beginPath()
      ctx.arc(bx, by, 14, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.beginPath()
      ctx.arc(bx, by, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.shadowBlur = 24
      ctx.shadowColor = '#4499ff'
      ctx.fill()
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(drawFrame)
    }
    drawFrame()

    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(judgeRef.current,
      { x: -200, opacity: 0, scale: 1.1 },
      { x: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'power4.out' }
    )
    .fromTo(titleRef.current,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }, '-=1.0'
    )
    .fromTo(subtitleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.6'
    )
    .fromTo(ctaRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4'
    )

    gsap.to(judgeRef.current, {
      y: -14, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2
    })

    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: self => {
        const p = self.progress
        gsap.set(judgeRef.current, { x: p * -100, scale: 1 + p * 0.06 })
        gsap.set(titleRef.current, { y: p * -80, opacity: 1 - p * 1.5 })
        gsap.set(subtitleRef.current, { y: p * -60, opacity: 1 - p * 2 })
        gsap.set(ctaRef.current, { y: p * -40, opacity: 1 - p * 2.5 })
      }
    })

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div ref={wrapperRef} style={{ height: '200vh', background: '#00000a' }}>
      <div style={{
        position: 'sticky', top: 0,
        width: '100vw', height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif"
      }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 30% 80%, rgba(10,40,150,0.3) 0%, transparent 60%)'
        }} />

        <div style={{
          position: 'absolute', bottom: 0, left: '-1%',
          zIndex: 3, height: '100vh',
          display: 'flex', alignItems: 'flex-end'
        }}>
          <img
            ref={judgeRef}
            src="/judge.png"
            alt="batter"
            style={{
              height: '96vh',
              objectFit: 'contain',
              objectPosition: 'bottom',
              filter: 'drop-shadow(0 0 50px rgba(20,60,255,0.6)) brightness(1.02) contrast(1.05)',
              opacity: 0,
              maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>

        <div style={{
          position: 'absolute', top: '50%', right: '5%',
          transform: 'translateY(-50%)',
          zIndex: 4, textAlign: 'right', maxWidth: '520px'
        }}>
          <p style={{
            color: '#4477ff', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '18px'
          }}>Statcast · XGBoost · 2.8M pitches</p>

          <div ref={titleRef} style={{ opacity: 0 }}>
            <h1 style={{
              color: '#fff', fontSize: 'clamp(44px, 6vw, 76px)',
              fontWeight: 800, lineHeight: 1.02, margin: '0 0 20px',
              textShadow: '0 0 80px rgba(40,100,255,0.3)',
            }}>
              Home Run<br />
              <span style={{
                background: 'linear-gradient(90deg, #1a44dd, #55aaff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Projector</span>
            </h1>
          </div>

          <p ref={subtitleRef} style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '15px',
            lineHeight: 1.8, margin: '0 0 40px', opacity: 0
          }}>
            ML-powered home run probability engine.<br />
            4 seasons · 131K fly balls · AUC 0.953
          </p>

          <div ref={ctaRef} style={{ opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #0f2fa8, #1f55ff)',
                color: '#fff', border: '1px solid rgba(80,140,255,0.25)',
                padding: '15px 44px', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 0 50px rgba(20,70,255,0.3)',
                letterSpacing: '0.08em', width: '100%'
              }}
              onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
              onClick={() => window.location.href = '/today'}
            >
              Today's HR Candidates →
            </button>
            <button
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(80,140,255,0.2)',
                padding: '15px 44px', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                letterSpacing: '0.08em', width: '100%'
              }}
              onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
              onClick={() => window.location.href = '/projector'}
            >
              Manual Projector →
            </button>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: '22px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 4,
          color: 'rgba(255,255,255,0.18)', fontSize: '10px',
          letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap'
        }}>
          Built by Arjan Gunsi · UCSD Data Science
        </div>

        <div style={{
          position: 'absolute', bottom: '40px', right: '5%',
          zIndex: 4, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '6px',
          color: 'rgba(255,255,255,0.25)', fontSize: '10px',
          letterSpacing: '0.15em', textTransform: 'uppercase'
        }}>
          <span>Scroll</span>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(to bottom, rgba(80,140,255,0.6), transparent)'
          }} />
        </div>
      </div>
    </div>
  )
}
