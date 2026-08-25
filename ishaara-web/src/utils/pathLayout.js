export function buildPathLayout(lessons) {
  // Group lessons into sections by category
  const sections = []
  let currentCategory = null
  let currentSection  = null

  const ordered = [...lessons].sort((a,b) =>
    a.order_index - b.order_index)

  ordered.forEach(lesson => {
    if (lesson.category !== currentCategory) {
      currentSection  = {
        id:       lesson.category,
        title:    getCategoryTitle(lesson.category),
        icon:     getCategoryIcon(lesson.category),
        color:    getCategoryColor(lesson.category),
        lessons:  []
      }
      sections.push(currentSection)
      currentCategory = lesson.category
    }
    currentSection.lessons.push(lesson)
  })
  return sections
}

export function getCategoryTitle(category) {
  const titles = {
    alphabet: 'ISL Alphabet',
    word:     'Words & Vocabulary',
    phrase:   'Phrases & Sentences'
  }
  return titles[category] || category
}

export function getCategoryIcon(category) {
  const icons = {
    alphabet: '🔤',
    word:     '💬',
    phrase:   '📝'
  }
  return icons[category] || '📚'
}

export function getCategoryColor(category) {
  const colors = {
    alphabet: { bg:'#4f46e5', light:'#eef2ff', ring:'#6366f1' },
    word:     { bg:'#0f6e56', light:'#ecfdf5', ring:'#10b981' },
    phrase:   { bg:'#854f0b', light:'#fffbeb', ring:'#f59e0b' }
  }
  return colors[category] || { bg:'#374151', light:'#f9fafb', ring:'#6b7280'}
}

export function getLessonStatus(lesson, userLevel) {
  if (lesson.user_progress_status === 'completed') return 'completed'
  if (lesson.required_level > userLevel)            return 'locked'
  if (lesson.user_progress_status === 'in_progress') return 'active'
  return 'available'
}

// Generate zigzag x positions for path nodes
export function getNodePosition(index, totalInSection) {
  // Zigzag pattern: center, right, center, left, center...
  const positions = ['center','right','center','left']
  const pos       = positions[index % positions.length]
  return {
    center: 50,
    right:  68,
    left:   32
  }[pos]
}
