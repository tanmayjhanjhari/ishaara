export default function DashboardGreeting({ displayName, currentStreak = 0, attemptsToday = 0 }) {
  const hour = new Date().getHours()
  const timeGreeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mb-8 select-none">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        {timeGreeting}, {displayName}! 👋
      </h1>
      <p className="text-gray-400 mt-1 text-sm font-medium">
        {attemptsToday === 0
          ? 'Ready to practice some signs today?'
          : currentStreak > 0
            ? `${currentStreak}-day streak! Keep it going.`
            : 'Great work today — keep practicing!'}
      </p>
    </div>
  )
}
