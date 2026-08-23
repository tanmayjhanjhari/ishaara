import { Card, Button, Badge } from '../ui'
import { useNavigate } from 'react-router-dom'

export default function ContinueLearningCard({ lessonProgress = [] }) {
  const navigate = useNavigate()

  // Find the current active lesson to continue
  const activeLesson =
    lessonProgress.find((l) => l.status === 'in_progress') ||
    lessonProgress[0]

  const getBadgeConfig = (status) => {
    switch (status) {
      case 'completed':
        return { variant: 'success', text: 'Completed' }
      case 'in_progress':
        return { variant: 'warning', text: 'In Progress' }
      default:
        return { variant: 'neutral', text: 'Not Started' }
    }
  }

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-gray-900/40 border border-gray-800/80">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-gray-300">Continue Learning</span>
        </div>

        {!activeLesson ? (
          <div className="flex flex-col items-center justify-center py-6 text-center select-none">
            <p className="text-xs text-gray-500 mb-4">No lessons started yet.</p>
            <Button
              variant="primary"
              size="sm"
              className="w-full font-bold"
              onClick={() => navigate('/lessons')}
            >
              Start First Lesson
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-white leading-snug">
                {activeLesson.lesson_title}
              </span>
              
              <div className="flex items-center gap-2 select-none">
                <Badge
                  variant={getBadgeConfig(activeLesson.status).variant}
                  size="sm"
                >
                  {getBadgeConfig(activeLesson.status).text}
                </Badge>
                {activeLesson.status === 'completed' && activeLesson.accuracy !== null && (
                  <span className="text-xs font-semibold text-gray-400 font-mono">
                    {Math.round(activeLesson.accuracy)}% accuracy
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full mt-3 font-bold"
              onClick={() => navigate(`/lessons/${activeLesson.lesson_id}`)}
            >
              {activeLesson.status === 'in_progress' ? 'Continue →' : 'Start →'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
