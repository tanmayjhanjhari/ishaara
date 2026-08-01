import { useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Eye, Trophy, ChevronDown, Sparkles, Brain, Hand, Users, Star } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import HandConstellation from '../components/ui/HandConstellation'
import { Button, Card, Badge } from '../components/ui'

/* ── Mouse-tracking glow hook ─────────────────────────────────────────── */
function useMouseGlow(ref) {
  return useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    ref.current.style.setProperty('--cx', `${x}%`)
    ref.current.style.setProperty('--cy', `${y}%`)
  }, [ref])
}

/* ── Mouse glow on cards ──────────────────────────────────────────────── */
function handleCardMouse(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

const FEATURES = [
  {
    icon: Eye, title: 'Sign Mirror',
    color: '#06B6D4', dim: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)',
    tagline: 'See yourself through AI eyes',
    desc: 'Your camera becomes a constellation mirror. MediaPipe maps 21 landmarks onto your hand in real time, comparing every joint angle to the reference sign with millisecond precision.',
    detail: 'Sub-100ms feedback · 21-point skeleton · Frame-by-frame accuracy',
  },
  {
    icon: Zap, title: 'Journey Map',
    color: '#A78BFA', dim: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)',
    tagline: 'Navigate a sign language universe',
    desc: 'Signs are constellation nodes. Chapters are star clusters. As you master each gesture, your personal map lights up, providing a visual record of every breakthrough.',
    detail: 'Chapter progression · XP per sign · Streak tracking',
  },
  {
    icon: Trophy, title: 'Boss Battles',
    color: '#FCD34D', dim: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)',
    tagline: 'Prove mastery, earn rare rewards',
    desc: 'Once you complete a chapter, a Boss Battle unlocks. You face a rapid-fire sequence of signs, scored live by the AI. Beat the boss, climb the league, earn badges that show off your fluency.',
    detail: 'Timed challenges · League ranking · Rare achievement badges',
  },
]

const HOW_STEPS = [
  { num: '01', icon: Hand,  color: '#A78BFA', title: 'Learn a sign', body: 'Study the reference hand constellation, then mirror it with your own hands in front of the camera.' },
  { num: '02', icon: Brain, color: '#06B6D4', title: 'Get scored instantly', body: 'The AI scores landmark alignment in real time: a number, a glow, and honest feedback with no waiting.' },
  { num: '03', icon: Star,  color: '#FCD34D', title: 'Earn XP & rise', body: 'Every accurate sign earns XP. Your streak stays alive. Your rank moves. Your constellation map grows.' },
]

const PROOF = [
  { stat: '500+', sub: 'ISL Signs & Phrases' },
  { stat: '<100ms', sub: 'AI Feedback Latency' },
  { stat: '21', sub: 'Joint Landmarks Tracked' },
  { stat: '100%', sub: 'On-Device Privacy' },
]

function Particle({ style }) {
  return <div style={{ position:'absolute', width:4, height:4, borderRadius:'50%', background:'#A78BFA', animation:'floatUp 3s ease-out infinite', ...style }} />
}

export default function Landing() {
  const heroRef = useRef(null)
  const handleHeroMouse = useMouseGlow(heroRef)
  const featRef = useRef(null)
  const handleFeatMouse = useMouseGlow(featRef)

  return (
    <div style={{ minHeight:'100vh', background:'#070714', overflowX:'hidden' }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
        className="cursor-glow"
        style={{ minHeight:'100vh', position:'relative', display:'flex', alignItems:'center' }}
      >
        {/* Ambient blobs */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:900, height:900, borderRadius:'50%', top:'-30%', left:'-15%', background:'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 65%)' }} />
          <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', bottom:'-20%', right:'-10%', background:'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)' }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', top:'40%', left:'45%', background:'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 65%)' }} />
          {/* Star dots */}
          {[{t:'7%',l:'12%',s:2},{t:'15%',l:'62%',s:1.5},{t:'30%',l:'89%',s:2},{t:'68%',l:'4%',s:1.5},{t:'52%',l:'38%',s:1},{t:'82%',l:'74%',s:2},{t:'22%',l:'28%',s:1.2}]
            .map((s,i) => <div key={i} style={{ position:'absolute', top:s.t, left:s.l, width:s.s*2, height:s.s*2, borderRadius:'50%', background:'#A78BFA', opacity:0.45, animation:`pulseDot 3s ${i*0.4}s ease-in-out infinite` }} />)}
          <Particle style={{ bottom:'32%', left:'20%' }} />
          <Particle style={{ bottom:'48%', left:'33%', animationDelay:'1.2s', background:'#67E8F9' }} />
          <Particle style={{ bottom:'22%', left:'26%', animationDelay:'2.4s' }} />
          <Particle style={{ bottom:'38%', left:'17%', animationDelay:'0.8s', background:'#6EE7B7' }} />
        </div>

        <div className="page-container" style={{ paddingTop:100, paddingBottom:100, position:'relative', zIndex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

            {/* ── Left copy ── */}
            <div style={{ animation:'fadeUp 0.8s ease-out both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:999, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.28)', marginBottom:32 }}>
                <Sparkles size={13} color="#A78BFA" />
                <span style={{ fontSize:13, fontWeight:600, color:'#A78BFA', letterSpacing:'0.04em' }}>Next-Gen Sign Language Learning</span>
              </div>

              <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'clamp(3.2rem,5.5vw,5.5rem)', lineHeight:1.02, letterSpacing:'-0.04em', color:'#EEE9FF', marginBottom:28 }}>
                Express<br />
                Beyond<br />
                <span className="gradient-animate">Words.</span>
              </h1>

              <p style={{ fontSize:'1.2rem', color:'#7B7BA8', lineHeight:1.75, marginBottom:48, maxWidth:460 }}>
                The world's most immersive sign language experience.
                Your webcam becomes a constellation mirror, with every gesture scored by AI and every session building mastery.
              </p>

              <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', marginBottom:52 }}>
                <Link to="/register" className="btn btn-primary btn-xl" style={{ gap:12, fontSize:'1.05rem', padding:'18px 40px' }}>
                  Start Learning Free
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" style={{ color:'#A78BFA', fontWeight:600, fontSize:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                  Sign in <ArrowRight size={15} />
                </Link>
              </div>

              {/* Trust line */}
              <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                {['Interactive AI Scoring', 'Browser-Native Tracking', 'Comprehensive Curriculum'].map(t => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#10B981' }} />
                    <span style={{ fontSize:13, color:'#7B7BA8' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Hand constellation ── */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', position:'relative', height:520 }}>
              <div style={{ position:'absolute', width:460, height:460, borderRadius:'50%', border:'1px solid rgba(124,58,237,0.1)', animation:'spin 28s linear infinite' }} />
              <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', border:'1px dashed rgba(6,182,212,0.1)', animation:'spin 18s linear infinite reverse' }} />
              <div style={{ position:'absolute', width:240, height:240, borderRadius:'50%', border:'1px solid rgba(167,139,250,0.06)', animation:'spin 12s linear infinite' }} />
              <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', animation:'pulseGlow 3.5s ease-in-out infinite' }} />
              <HandConstellation size={360} style={{ animation:'float 5s ease-in-out infinite', position:'relative', zIndex:2 }} />
              {/* Score badge */}
              <div style={{ position:'absolute', bottom:'12%', right:'4%', padding:'14px 20px', borderRadius:16, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', animation:'float 4s 1s ease-in-out infinite', zIndex:3, backdropFilter:'blur(12px)' }}>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontWeight:800, fontSize:28, color:'#6EE7B7', lineHeight:1 }}>96</div>
                <div style={{ fontSize:12, color:'#7B7BA8', marginTop:4 }}>Perfect ✓</div>
              </div>
              {/* Accuracy label */}
              <div style={{ position:'absolute', top:'18%', left:'2%', padding:'10px 16px', borderRadius:14, background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', animation:'float 6s 0.5s ease-in-out infinite', zIndex:3, backdropFilter:'blur(12px)' }}>
                <div style={{ fontSize:12, color:'#A78BFA', fontWeight:600 }}>Sign: A</div>
                <div style={{ fontSize:11, color:'#7B7BA8', marginTop:2 }}>Analyzing…</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', animation:'float 2s ease-in-out infinite' }}>
          <ChevronDown size={24} color="rgba(167,139,250,0.35)" />
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────── */}
      <section style={{ borderTop:'1px solid rgba(167,139,250,0.08)', borderBottom:'1px solid rgba(167,139,250,0.08)', padding:'40px 0', background:'rgba(10,10,30,0.5)' }}>
        <div className="page-container" style={{ display:'flex', justifyContent:'space-around', gap:32, flexWrap:'wrap' }}>
          {PROOF.map(s => (
            <div key={s.stat} style={{ textAlign:'center', position:'relative', padding:'0 20px' }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'2.4rem', color:'#EEE9FF', letterSpacing:'-0.03em', lineHeight:1 }}>{s.stat}</div>
              <div style={{ fontSize:13, color:'#7B7BA8', marginTop:8, letterSpacing:'0.04em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="page-container" style={{ padding:'120px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:72 }}>
          <p style={{ fontSize:12, color:'#7B7BA8', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>The loop</p>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'clamp(2rem,4vw,3.4rem)', color:'#EEE9FF', letterSpacing:'-0.03em' }}>
            Three steps.<br />
            <span style={{ color:'#A78BFA' }}>Infinite depth.</span>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:28 }}>
          {HOW_STEPS.map((s,i) => (
            <div key={s.num} className="glass-card feature-card" onMouseMove={handleCardMouse} style={{ padding:'40px 36px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', color:'#4A4A7A', fontWeight:600 }}>{s.num}</span>
                <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${s.color}40, transparent)` }} />
                <s.icon size={22} color={s.color} />
              </div>
              <h3 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.4rem', color:'#EEE9FF', marginBottom:14, letterSpacing:'-0.01em' }}>{s.title}</h3>
              <p style={{ fontSize:'0.95rem', color:'#7B7BA8', lineHeight:1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section
        ref={featRef}
        onMouseMove={handleFeatMouse}
        className="cursor-glow"
        style={{ background:'rgba(10,10,26,0.6)', padding:'100px 0' }}
      >
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <p style={{ fontSize:12, color:'#7B7BA8', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 }}>What makes ishaara different</p>
            <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'clamp(2rem,4vw,3.2rem)', color:'#EEE9FF', letterSpacing:'-0.03em' }}>
              Not a learning app.<br />
              <span style={{ color:'#A78BFA' }}>A communication universe.</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card feature-card" onMouseMove={handleCardMouse}
                style={{ padding:'40px 36px', borderColor:`${f.border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
                  <div style={{ width:52, height:52, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', background:f.dim, border:`1px solid ${f.border}`, boxShadow:`0 0 20px ${f.dim}` }}>
                    <f.icon size={24} color={f.color} />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.3rem', color:'#EEE9FF', letterSpacing:'-0.01em' }}>{f.title}</div>
                    <div style={{ fontSize:12, color:f.color, marginTop:2, fontWeight:600 }}>{f.tagline}</div>
                  </div>
                </div>
                <p style={{ fontSize:'0.95rem', color:'#7B7BA8', lineHeight:1.8, marginBottom:24 }}>{f.desc}</p>
                <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(167,139,250,0.05)', border:'1px solid rgba(167,139,250,0.08)', fontSize:12, color:'#4A4A7A', letterSpacing:'0.04em' }}>
                  {f.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGN MIRROR SPOTLIGHT ─────────────────────────────────────── */}
      <section className="page-container py-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual */}
          <div className="relative flex items-center justify-center h-[420px]">
            <div className="absolute inset-0 rounded-[28px] border border-cyan/15" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.08))' }} />
            {/* Corner brackets */}
            {[['top:16px','left:16px','borderTop,borderLeft'],['top:16px','right:16px','borderTop,borderRight'],['bottom:16px','left:16px','borderBottom,borderLeft'],['bottom:16px','right:16px','borderBottom,borderRight']].map(([pos1,pos2,borders],i) => {
              const [p1k,p1v]=pos1.split(':'), [p2k,p2v]=pos2.split(':')
              const isTop=p1k==='top', isLeft=p2k==='left'
              return <div key={i} className="absolute w-7 h-7" style={{ [p1k]:p1v, [p2k]:p2v, borderTop:isTop?'2px solid rgba(6,182,212,0.6)':'none', borderBottom:!isTop?'2px solid rgba(6,182,212,0.6)':'none', borderLeft:isLeft?'2px solid rgba(6,182,212,0.6)':'none', borderRight:!isLeft?'2px solid rgba(6,182,212,0.6)':'none' }} />
            })}
            <HandConstellation size={260} className="relative z-10 animate-float" />
            <Badge variant="cyan" className="absolute top-[12%] right-[8%] animate-[float_4s_0.8s_ease-in-out_infinite] z-20">
              Scanning…
            </Badge>
            {/* Scan line */}
            <div className="absolute left-5 right-5 h-0.5 rounded-sm animate-scanLine" style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.5),transparent)' }} />
          </div>
          {/* Copy */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-cyan uppercase mb-4">Sign Mirror</p>
            <h2 className="font-outfit font-black text-[clamp(1.8rem,3.5vw,3rem)] text-text-primary tracking-tight leading-tight mb-6">
              Watch your skeleton<br />match the reference.
            </h2>
            <p className="text-[1.05rem] text-text-muted leading-relaxed mb-10">
              Most apps show you a video. We show you <em className="text-text-primary not-italic font-medium">your own hands</em>, mapped as glowing constellations in real time. The AI doesn't judge your skin tone, lighting, or background. It only sees 21 landmark points and asks: <em className="text-primary not-italic font-medium">are they in the right place?</em>
            </p>
            <div className="flex flex-col gap-4">
              {['21-point MediaPipe hand skeleton','Frame-by-frame accuracy scoring','Instant feedback with no network round-trip'].map(t => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                    <span className="text-xs text-cyan font-bold">✓</span>
                  </div>
                  <span className="text-[0.95rem] text-text-muted">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-[120px] text-center relative overflow-hidden">
        <div className="absolute w-[800px] h-[500px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.13) 0%, transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full top-[30%] left-[30%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)' }} />
        <div className="relative z-10 px-6">
          <div className="wordmark text-6xl md:text-7xl mb-6 opacity-[0.08] tracking-tight">
            <span className="wordmark-i">i</span>shaara
          </div>
          <h2 className="font-outfit font-black text-[clamp(2rem,4vw,3.6rem)] text-text-primary tracking-tight mb-5">
            Your first sign is<br />
            <span className="gradient-animate">one click away.</span>
          </h2>
          <p className="text-lg text-text-muted max-w-[480px] mx-auto mb-12">
            No instructor. No classroom. No excuses.<br />
            Just your hands, a camera, and the AI that never sleeps.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link to="/register">
              <Button variant="primary" size="lg" className="px-12 py-5 text-[1.1rem]">
                Start for free
                <ArrowRight size={20} className="ml-3" />
              </Button>
            </Link>
            <Link to="/lessons/a">
              <Button variant="ghost" size="lg">
                <Eye size={18} className="mr-2" />
                Preview Sign Mirror
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="page-container flex flex-wrap items-center justify-between gap-5">
          <span className="wordmark text-[1.4rem] opacity-70">
            <span className="wordmark-i">i</span>shaara
          </span>
          <div className="flex gap-6">
            {['Privacy','Terms','Contact'].map(l => (
              <a key={l} href="#" className="text-sm font-medium text-text-dim hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-xs text-text-dim">© 2026 ishaara. Designed for human connection.</p>
        </div>
      </footer>
    </div>
  )
}
