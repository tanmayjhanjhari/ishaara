import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import { Button, EmptyState, SkeletonCard } from '../components/ui'
import LessonCard from '../components/lesson/LessonCard'
import { useLessons } from '../api/lessons'

const TABS = [
  { label: 'All',      value: 'all'      },
  { label: 'Alphabet', value: 'alphabet' },
  { label: 'Words',    value: 'word'     },
  { label: 'Phrases',  value: 'phrase'   },
]

export default function Lessons() {
  const navigate               = useNavigate()
  const [category, setCategory] = useState('all')

  const filterParam = category === 'all' ? {} : { category }
  const { data: lessons = [], isLoading, isError, refetch } = useLessons(filterParam)

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
        {TABS.map(tab => (
          <Button
            key={tab.value}
            variant={category === tab.value ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCategory(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
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
