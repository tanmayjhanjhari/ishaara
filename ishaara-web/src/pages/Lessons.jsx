import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Button, EmptyState, SkeletonCard } from '../components/ui'
import LessonCard from '../components/lesson/LessonCard'
import { useLessons } from '../api/lessons'
import { initModel } from '../cv/onnxModel'

export default function Lessons() {
  const navigate               = useNavigate()
  const [category, setCategory] = useState('all')

  // Preload the ONNX model while the user browses lessons
  useEffect(() => {
    initModel().catch(err => console.warn('[ONNX] Preload failed:', err))
  }, [])

  const { data: allLessons = [], isLoading, isError, refetch } = useLessons({})

  // Dynamically load categories from lessons
  const categories = ['all', ...new Set(allLessons.map(l => l.category))]

  // Filter lessons locally
  const lessons = category === 'all'
    ? allLessons
    : allLessons.filter(l => l.category === category)

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-2 animate-fade-up">
        <p className="text-xs font-semibold tracking-widest text-text-muted uppercase mb-2">
          Learning Journey
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-2">
          Lessons
        </h1>
        <p className="text-sm text-text-muted">
          Choose a lesson to start practicing
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mt-6 mb-6 flex-wrap">
        {categories.map(cat => {
          const count = cat === 'all'
            ? allLessons.length
            : allLessons.filter(l => l.category === cat).length

          const countText = `${count} lesson${count !== 1 ? 's' : ''}`

          let tabLabel = ''
          switch (cat) {
            case 'all':
              tabLabel = `All (${countText})`
              break
            case 'alphabet':
              tabLabel = `🔤 Alphabet (${countText})`
              break
            case 'word':
              tabLabel = `💬 Words (${countText})`
              break
            case 'phrase':
              tabLabel = `📝 Phrases (${countText})`
              break
            default:
              const capitalized = cat.charAt(0).toUpperCase() + cat.slice(1)
              tabLabel = `${capitalized} (${countText})`
              break
          }

          return (
            <Button
              key={cat}
              variant={category === cat ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCategory(cat)}
            >
              {tabLabel}
            </Button>
          )
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-text-muted mb-4">Failed to load lessons.</p>
          <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && lessons.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No lessons available"
          subtitle="Check back soon for new content"
        />
      )}

      {/* Lesson grid */}
      {!isLoading && !isError && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={() => navigate(`/lessons/${lesson.id}`)}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
