// constants.js: global app constants
// TODO: populate as features are implemented

export const SCORE_BANDS = {
  PERFECT: { min: 90, max: 100, label: 'Perfect', color: 'success' },
  GREAT:   { min: 70, max: 89,  label: 'Great',   color: 'success' },
  ALMOST:  { min: 50, max: 69,  label: 'Almost',  color: 'warning' },
  TRY:     { min: 0,  max: 49,  label: 'Try Again', color: 'error' },
}

export const HOLD_DURATION_MS = 500

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000,
]
