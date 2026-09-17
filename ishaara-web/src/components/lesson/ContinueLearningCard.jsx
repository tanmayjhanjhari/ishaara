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
          <div className="flex flex-col py-1 select-none">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                Chapter 1
              </span>
              <span className="text-[11px] text-amber-400 font-bold">★ Start Here</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">ISL Alphabet: Sign A–Z</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Learn foundational hand shapes with real-time MediaPipe joint tracking and instant AI scoring.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full font-bold shadow-lg shadow-indigo-500/20"
              onClick={() => navigate('/lessons')}
            >
              Start Sign A Now →
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
