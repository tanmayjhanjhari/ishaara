import Spinner from './Spinner'

export default function PageSpinner() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#070714] text-white z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Subtle glowing ring background */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Spinner size="lg" className="text-primary relative z-10" />
        </div>
        <span className="text-lg font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse">
          ishaara
        </span>
      </div>
    </div>
  )
}
