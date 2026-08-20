const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
]

const COLORS = {
  connection:  '#6366f1',  // indigo
  joint:       '#ffffff',
  wrist:       '#f43f5e',  // rose
  fingertip:   '#10b981'   // emerald
}

const FINGERTIPS = [4, 8, 12, 16, 20]

export function drawLandmarks(ctx, landmarks21, canvasWidth, canvasHeight) {
  if (!ctx || !landmarks21?.length) return

  // Convert normalized [0,1] coords to canvas pixels
  // Note: mirror x because video is mirrored (scaleX(-1))
  const toCanvas = (lm) => ({
    x: (1 - lm.x) * canvasWidth,   // mirror x
    y: lm.y * canvasHeight
  })

  // Draw connections first (under joints)
  ctx.lineWidth   = 2
  ctx.strokeStyle = COLORS.connection
  ctx.globalAlpha = 0.8

  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = toCanvas(landmarks21[startIdx])
    const end   = toCanvas(landmarks21[endIdx])
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x,   end.y)
    ctx.stroke()
  })

  // Draw joints
  ctx.globalAlpha = 1.0
  landmarks21.forEach((lm, i) => {
    const pos    = toCanvas(lm)
    const radius = FINGERTIPS.includes(i) ? 6 : 4
    const color  = i === 0 ? COLORS.wrist
                 : FINGERTIPS.includes(i) ? COLORS.fingertip
                 : COLORS.joint

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // Outer ring for fingertips
    if (FINGERTIPS.includes(i)) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius + 2, 0, 2 * Math.PI)
      ctx.strokeStyle = COLORS.fingertip
      ctx.lineWidth   = 1.5
      ctx.stroke()
    }
  })

  // Reset alpha
  ctx.globalAlpha = 1.0
}

export function clearCanvas(ctx, canvasWidth, canvasHeight) {
  if (!ctx) return
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
}
