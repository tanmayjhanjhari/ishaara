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
          <div className="py-2 select-none">
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <span>🎯 Precision AI Analyzer</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                As you practice, the AI automatically evaluates finger angles and wrist positions, highlighting signs that need extra polish right here.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>Status</span>
              <span className="text-emerald-400 font-bold">● Ready for 1st Sign</span>
            </div>
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
