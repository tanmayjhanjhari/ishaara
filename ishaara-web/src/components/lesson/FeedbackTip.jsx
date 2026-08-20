import React from 'react'
import { Lightbulb } from 'lucide-react'
import { Card } from '../ui'

export default function FeedbackTip({ tip, isVisible }) {
  if (!isVisible || !tip) return null

  return (
    <Card
      variant="flat"
      padding="md"
      className="mt-3 w-full bg-[#18182a]/50 border border-amber-500/20 text-left animate-feedback-tip flex items-start gap-2.5"
    >
      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          {tip}
        </p>
      </div>
    </Card>
  )
}
