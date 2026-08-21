export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100]

export function isMilestone(streak) {
  return STREAK_MILESTONES.includes(streak)
}

export function getMilestoneMessage(streak) {
  const messages = {
    3:   { title: '3 Day Streak! 🔥', msg: "You're building a habit!" },
    7:   { title: 'One Week! 🌟', msg: 'A whole week of practice!' },
    14:  { title: '2 Week Warrior! ⚡', msg: 'Incredible consistency!' },
    21:  { title: '3 Weeks Strong! 💪', msg: "You've formed a real habit!" },
    30:  { title: '30 Day Legend! 🏆', msg: 'A full month of daily ISL!' },
    60:  { title: '60 Day Master! 👑', msg: 'Two months — unstoppable!' },
    100: { title: '100 Day Champion! 🎯', msg: 'You are an ISL legend!' }
  }
  return messages[streak] || null
}
