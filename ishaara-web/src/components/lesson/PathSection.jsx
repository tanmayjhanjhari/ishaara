import React from 'react'
import PathSectionHeader from './PathSectionHeader'
import PathNode from './PathNode'
import { getLessonStatus } from '../../utils/pathLayout'

export default function PathSection({ section, userLevel, nextLessonId, onLessonClick, onLockedClick }) {
  const completedCount = section.lessons.filter(
    l => l.user_progress_status === 'completed'
  ).length
  const totalCount = section.lessons.length
  
  const heightPerNode = 150
  const containerHeight = totalCount * heightPerNode

  // Coordinates helper for the SVG and absolute nodes:
  // Layout width coordinate system is fixed to 400
  // Left: 90, Center: 200, Right: 310
  const getNodeCoordinates = (index) => {
    const pattern = [200, 310, 200, 90] // center, right, center, left
    const x = pattern[index % pattern.length]
    const y = index * heightPerNode + 75 // centered vertically in the node row
    return { x, y }
  }

  return (
    <div className="relative flex flex-col items-center pb-8 w-full">
      {/* Section Header */}
      <PathSectionHeader
        section={section}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Nodes Zigzag Layout */}
      <div 
        className="w-full max-w-[400px] mx-auto relative mt-6"
        style={{ height: `${containerHeight}px` }}
      >
        {/* SVG Connector Path */}
        {totalCount > 1 && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 400 ${containerHeight}`}
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            {section.lessons.map((_, i) => {
              if (i === totalCount - 1) return null

              const start = getNodeCoordinates(i)
              const end = getNodeCoordinates(i + 1)

              // Beautiful S-curve from start to end
              const pathData = `M ${start.x} ${start.y} C ${start.x} ${(start.y + end.y) / 2}, ${end.x} ${(start.y + end.y) / 2}, ${end.x} ${end.y}`

              const lessonStatus = getLessonStatus(section.lessons[i], userLevel)
              const isPathActive = lessonStatus === 'completed'

              if (isPathActive) {
                return (
                  <g key={`path-${i}`}>
                    {/* Glowing outer thick path */}
                    <path
                      d={pathData}
                      stroke={section.color.ring}
                      strokeWidth={10}
                      fill="none"
                      opacity={0.25}
                      strokeLinecap="round"
                    />
                    {/* Sharp inner core path */}
                    <path
                      d={pathData}
                      stroke={section.color.ring}
                      strokeWidth={4}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                )
              } else {
                return (
                  <path
                    key={`path-${i}`}
                    d={pathData}
                    stroke="#374151"
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray="6,8"
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                )
              }
            })}
          </svg>
        )}

        {/* Floating Nodes */}
        {section.lessons.map((lesson, i) => {
          let status = getLessonStatus(lesson, userLevel)
          if (lesson.id === nextLessonId && status === 'available') {
            status = 'active'
          }
          const coords = getNodeCoordinates(i)
          const xPercent = (coords.x / 400) * 100

          return (
            <div
              key={lesson.id}
              className="absolute"
              style={{
                top: `${coords.y}px`,
                left: `${xPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <PathNode
                lesson={lesson}
                status={status}
                index={i}
                onClick={(e) => {
                  if (status === 'locked') {
                    onLockedClick && onLockedClick(lesson, e)
                  } else {
                    onLessonClick(lesson)
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
