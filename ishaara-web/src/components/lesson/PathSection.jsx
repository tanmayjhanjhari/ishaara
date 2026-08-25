import React from 'react'
import PathSectionHeader from './PathSectionHeader'
import PathNode from './PathNode'
import { getLessonStatus, getNodePosition } from '../../utils/pathLayout'

export default function PathSection({ section, userLevel, onLessonClick, onLockedClick }) {
  const completedCount = section.lessons.filter(
    l => l.user_progress_status === 'completed'
  ).length
  const totalCount = section.lessons.length

  return (
    <div className="relative flex flex-col items-center pb-8 w-full">
      {/* Section Header */}
      <PathSectionHeader
        section={section}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Zigzag column of PathNode components */}
      <div className="w-full flex flex-col mt-4">
        {section.lessons.map((lesson, i) => {
          const status = getLessonStatus(lesson, userLevel)
          const xPos   = getNodePosition(i, section.lessons.length)

          return (
            <div
              key={lesson.id}
              style={{
                alignSelf: xPos === 50 ? 'center'
                         : xPos  > 50 ? 'flex-end'
                         : 'flex-start',
                marginRight: xPos > 50 ? '15%' : 0,
                marginLeft:  xPos < 50 ? '15%' : 0,
              }}
            >
              <PathNode
                lesson={lesson}
                status={status}
                index={i}
                sectionColor={section.color}
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
