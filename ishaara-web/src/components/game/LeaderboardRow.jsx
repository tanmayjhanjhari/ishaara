import { memo } from 'react'
import { Avatar } from '../ui'
import LevelBadge from './LevelBadge'

const LeaderboardRow = memo(function LeaderboardRow({ entry, isCurrentUser }) {
  if (!entry) return null

  const getRankEmojiOrText = (rank) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>
      case 2:
        return <span className="text-xl">🥈</span>
      case 3:
        return <span className="text-xl">🥉</span>
      default:
        return <span className="text-xs text-gray-400">#{rank}</span>
    }
  }

  return (
    <div
      className={`flex items-center gap-4 py-3 px-4 rounded-xl border-b border-gray-800/50 transition-colors select-none ${
        isCurrentUser
          ? 'bg-indigo-950/40 border border-indigo-500/30'
          : ''
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0 font-bold">
        {getRankEmojiOrText(entry.rank)}
      </div>

      {/* Avatar */}
      <Avatar size="sm" name={entry.display_name} />

      {/* Name + Level */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          className={`text-sm font-semibold truncate ${
            isCurrentUser ? 'text-indigo-300 font-bold' : 'text-white'
          }`}
        >
          {entry.display_name}
          {isCurrentUser && <span className="text-[10px] text-indigo-400 font-bold ml-1.5">(You)</span>}
        </span>
        <LevelBadge size="sm" level={entry.level} />
      </div>

      {/* Weekly XP */}
      <div className="flex items-center gap-1 shrink-0 font-mono text-sm font-bold text-indigo-400">
        <span>⚡</span>
        <span>{entry.weekly_xp?.toLocaleString() || 0} XP</span>
      </div>
    </div>
  )
})

export default LeaderboardRow
