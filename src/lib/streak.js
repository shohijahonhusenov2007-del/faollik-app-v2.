export function computeStreak(achievements) {
  const dates = new Set((achievements || []).map(a => a.date).filter(Boolean))
  const cursor = new Date()
  const todayKey = cursor.toISOString().slice(0, 10)
  if (!dates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
