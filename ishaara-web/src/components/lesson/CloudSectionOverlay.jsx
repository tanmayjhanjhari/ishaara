import React from 'react'

export default function CloudSectionOverlay({ onOpenRoadmap }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center pointer-events-auto select-none overflow-hidden rounded-3xl">
      {/* Background Frosted Glass & Atmospheric Mist */}
      <div 
        className="absolute inset-0 backdrop-blur-[6px] transition-all duration-700"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(15, 12, 35, 0.82) 0%, rgba(8, 6, 20, 0.92) 75%, rgba(4, 3, 12, 0.98) 100%)',
          boxShadow: 'inset 0 0 60px rgba(99, 102, 241, 0.15)'
        }}
      />

      {/* Atmospheric Floating SVG Clouds */}
      <div className="absolute -top-10 -left-12 w-64 h-36 opacity-30 pointer-events-none filter blur-sm animate-pulse">
        <svg viewBox="0 0 100 60" fill="currentColor" className="text-indigo-400/40 w-full h-full">
          <path d="M20,40 Q25,20 40,25 Q55,10 70,22 Q85,18 90,35 Q95,50 75,52 L20,52 Q10,50 20,40 Z" />
        </svg>
      </div>

      <div className="absolute -bottom-10 -right-12 w-72 h-40 opacity-35 pointer-events-none filter blur-sm animate-pulse" style={{ animationDelay: '1.5s' }}>
        <svg viewBox="0 0 100 60" fill="currentColor" className="text-purple-400/40 w-full h-full">
          <path d="M15,45 Q20,25 38,28 Q50,12 72,20 Q88,15 92,38 Q98,52 80,55 L15,55 Q5,52 15,45 Z" />
        </svg>
      </div>

      <div className="absolute top-1/3 -right-8 w-48 h-28 opacity-25 pointer-events-none filter blur-sm">
        <svg viewBox="0 0 100 60" fill="currentColor" className="text-cyan-400/30 w-full h-full">
          <path d="M25,42 Q30,22 45,26 Q60,14 76,24 Q90,20 92,38 Q95,50 80,52 L25,52 Z" />
        </svg>
      </div>

      {/* Stylized Cloud Shroud Billows (Center Floating) */}
      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Glowing Lock & Cloud Icon Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full blur-md opacity-40 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1e1b4b] to-[#0f0e26] border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.3)] flex items-center justify-center">
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">
              ☁️
            </span>
            <span className="absolute -bottom-1 -right-1 text-sm bg-indigo-600 border border-white/20 rounded-full p-1 shadow-md">
              🔒
            </span>
          </div>
        </div>

        {/* Phase Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2 shadow-inner">
          <span className="text-cyan-400">✦</span>
          <span>FUTURE EXPANSION</span>
          <span className="text-cyan-400">✦</span>
        </div>

        {/* Coming Soon Title */}
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-indigo-100 to-fuchsia-200 font-outfit uppercase mb-1 drop-shadow-sm">
          COMING SOON
        </h3>

        <p className="text-xs font-semibold text-gray-300 mb-4 px-2 leading-relaxed">
          Words & Vocabulary lessons are currently locked while our studio records full motion-tracked datasets with certified ISL educators.
        </p>

        {/* Future Plans Teaser Cards */}
        <div className="w-full grid grid-cols-3 gap-2 mb-4 text-left">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 backdrop-blur-sm">
            <div className="text-sm mb-0.5">🎬</div>
            <div className="text-[10px] font-bold text-white leading-tight">3D Motion Signs</div>
            <div className="text-[9px] text-gray-400 leading-none mt-0.5">Dynamic tracking</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 backdrop-blur-sm">
            <div className="text-sm mb-0.5">💬</div>
            <div className="text-[10px] font-bold text-white leading-tight">Conversations</div>
            <div className="text-[9px] text-gray-400 leading-none mt-0.5">Real-life quests</div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 backdrop-blur-sm">
            <div className="text-sm mb-0.5">📚</div>
            <div className="text-[10px] font-bold text-white leading-tight">500+ Words</div>
            <div className="text-[9px] text-gray-400 leading-none mt-0.5">Authentic ISL</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenRoadmap}
          className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-400/30 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span>✨</span>
            <span>VIEW FUTURE ROADMAP</span>
            <span>→</span>
          </span>
        </button>
      </div>
    </div>
  )
}
