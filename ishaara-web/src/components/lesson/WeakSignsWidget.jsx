import { memo } from 'react'
import { Card, Button } from '../ui'
import { Link, useNavigate } from 'react-router-dom'

const WeakSignsWidget = memo(function WeakSignsWidget({ signs = [] }) {
  const navigate = useNavigate()

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-gray-900/40 border border-gray-800/80">
      <div>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800/50">
          <span className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
            <span>⚠</span> Signs to Practice
          </span>
          <Link to="/lessons" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            View All
          </Link>
        </div>

        {signs.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-6">
            No weak signs yet — keep practicing!
          </div>
        ) : (
          <div className="space-y-3">
            {signs.slice(0, 3).map((sign) => (
              <div key={sign.slug} className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0">
                {/* Sign Label Badge */}
                <div className="rounded-lg bg-amber-950/30 border border-amber-700/50 text-sm font-black text-amber-400 px-3 py-1 shrink-0 font-mono">
                  {sign.label}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 mx-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${sign.success_rate}%` }}
                  />
                </div>

                {/* Percentage */}
                <span className="text-xs font-mono font-bold text-gray-400 shrink-0 w-10 text-right">
                  {sign.success_rate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {signs.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-4"
          onClick={() => navigate('/lessons')}
        >
          Practice Now
        </Button>
      )}
    </Card>
  )
})

export default WeakSignsWidget
