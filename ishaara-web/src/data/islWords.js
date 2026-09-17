/**
 * islWords.js — Authentic Indian Sign Language (ISL) data for Word & Greeting lessons
 * 
 * Provides human-verified instructions, steps, tips, handshapes, and gesture types
 * for signs in the Greetings lesson and other word categories.
 */

export const ISL_GREETINGS = {
  ALRIGHT: {
    label: 'Alright',
    category: 'word',
    hands: 'one',
    type: 'static',
    difficulty: 1,
    emoji: '👍',
    gesture: 'Clear Thumbs-Up at Chest',
    handShape: 'Dominant hand in a firm thumbs-up fist',
    cameraHint: 'Hold a clear thumbs-up steady in front of your chest',
    instruction: 'Form a firm thumbs-up with your dominant hand in front of your chest, pointing the thumb upward with a slight reassuring forward nod.',
    tip: 'In Indian Sign Language, a clear upright thumbs-up held firmly in front of the chest is widely used for "Alright" and "OK".',
    watchOut: 'Keep all four fingers curled tightly into your palm so only your thumb points up.',
    steps: [
      'Curl all four fingers firmly into a fist against your palm.',
      'Extend your dominant thumb straight up toward the ceiling.',
      'Hold the thumbs-up steady at mid-chest level directly in front of the camera.'
    ],
    motionCues: 'Static hold at chest level'
  },

  HELLO: {
    label: 'Hello',
    category: 'word',
    hands: 'one',
    type: 'motion',
    difficulty: 1,
    emoji: '👋',
    gesture: 'Salute Wave from Temple',
    handShape: 'Open flat hand with fingers straight and together',
    cameraHint: 'Raise your hand beside your temple and wave outward',
    instruction: 'Raise your dominant open hand to the side of your forehead or temple, palm facing forward, and make a crisp, polite outward salute wave.',
    tip: 'Keep your palm upright and fingers straight. This is a formal and welcoming greeting in ISL.',
    watchOut: 'Do not cover your face or eyes; keep your hand slightly to the side at temple height.',
    steps: [
      'Raise your dominant open hand next to your temple, palm facing forward.',
      'Keep all fingers straight and touching, thumb resting naturally beside them.',
      'Move your hand outward to the side in a crisp, polite wave.'
    ],
    motionCues: 'Wave outward from temple'
  },

  THANKYOU: {
    label: 'Thankyou',
    category: 'word',
    hands: 'one',
    type: 'motion',
    difficulty: 1,
    emoji: '🙏',
    gesture: 'Fingertips from Chin Moving Forward',
    handShape: 'Flat open palm, fingers together and straight',
    cameraHint: 'Touch fingertips to chin and move forward smoothly',
    instruction: 'Touch the tips of your dominant flat hand gently to your chin or lower lip, then move your hand smoothly forward toward the viewer with a slight nod.',
    tip: 'The outward movement represents extending your gratitude from your lips to the other person.',
    watchOut: 'Do not slap your chin; touch gently with your fingertips and sweep forward smoothly.',
    steps: [
      'Flatten your dominant hand with all fingers together and straight.',
      'Gently touch your fingertips to your chin or lower lip.',
      'Extend the hand smoothly forward toward the camera with palm facing slightly up.'
    ],
    motionCues: 'Forward sweep from chin'
  },

  GOODMORNING: {
    label: 'Goodmorning',
    category: 'word',
    hands: 'two',
    type: 'motion',
    difficulty: 2,
    emoji: '🌅',
    gesture: 'Good (Thumbs-Up) + Morning (Sunrise)',
    handShape: 'Thumbs-up transitioning to rising sun palm',
    cameraHint: 'Sign thumbs-up first, then raise open hand upward like sunrise',
    instruction: 'Show "Good" with a thumbs-up at chest level, then transition to "Morning" by raising your dominant open hand upward like the morning sun rising.',
    tip: 'This is an authentic ISL compound sign combining quality (Good) and time of day (Morning).',
    watchOut: 'Perform the thumbs-up first, then fluidly open your fingers as your hand rises.',
    steps: [
      'Show a thumbs-up with your dominant hand in front of your chest ("Good").',
      'Open your fingers and raise the hand upward from chest to eye level like the rising sun ("Morning").',
      'Hold the open sunrise pose at eye level.'
    ],
    motionCues: 'Thumbs up → Rise upward'
  },

  GOODAFTERNOON: {
    label: 'Goodafternoon',
    category: 'word',
    hands: 'two',
    type: 'motion',
    difficulty: 2,
    emoji: '☀️',
    gesture: 'Good (Thumbs-Up) + Afternoon (Midday Sun)',
    handShape: 'Thumbs-up transitioning to vertical upright forearm',
    cameraHint: 'Sign thumbs-up, then hold forearm vertical pointing up',
    instruction: 'Sign "Good" with a thumbs-up, then hold your dominant arm vertical with your open hand pointing straight up representing the midday sun directly overhead.',
    tip: 'The vertical upright position represents the sun directly overhead at noon in Indian Sign Language.',
    watchOut: 'Keep your elbow supported and forearm straight vertical.',
    steps: [
      'Sign "Good" with a thumbs-up in front of your chest.',
      'Raise your dominant arm upright, palm facing forward, pointing straight up ("Midday Sun").',
      'Hold the vertical arm position steady.'
    ],
    motionCues: 'Thumbs up → Vertical upright arm'
  },

  GOODEVENING: {
    label: 'Goodevening',
    category: 'word',
    hands: 'two',
    type: 'motion',
    difficulty: 2,
    emoji: '🌇',
    gesture: 'Good (Thumbs-Up) + Evening (Descending Sun)',
    handShape: 'Thumbs-up transitioning to arcing downward hand',
    cameraHint: 'Sign thumbs-up, then curve hand downward like setting sun',
    instruction: 'Sign "Good" with a thumbs-up, then arc your dominant curved hand downward toward your waist to represent the sun setting in the evening.',
    tip: 'The downward arcing motion contrasts directly with the rising morning sign.',
    watchOut: 'Keep the downward movement smooth and controlled.',
    steps: [
      'Sign "Good" with a thumbs-up in front of your chest.',
      'Bring your dominant open hand in an arcing path downward to waist level ("Sunset / Evening").',
      'Hold the final resting position.'
    ],
    motionCues: 'Thumbs up → Arc downward'
  },

  GOODNIGHT: {
    label: 'Goodnight',
    category: 'word',
    hands: 'two',
    type: 'motion',
    difficulty: 2,
    emoji: '🌙',
    gesture: 'Good (Thumbs-Up) + Night (Hands Crossing in Dark)',
    handShape: 'Thumbs-up transitioning to dominant hand covering non-dominant wrist',
    cameraHint: 'Sign thumbs-up, then cross dominant hand over non-dominant arm',
    instruction: 'Sign "Good" with a thumbs-up, then cross your dominant bent hand downward over your non-dominant wrist/arm to signify the darkness of nightfall.',
    tip: 'The downward covering motion symbolizes nightfall and darkness covering the earth.',
    watchOut: 'Keep your non-dominant forearm horizontal as a base while the dominant hand sweeps over it.',
    steps: [
      'Sign "Good" with a thumbs-up in front of your chest.',
      'Place your non-dominant forearm horizontally in front of you.',
      'Bring your dominant curved hand down over the non-dominant wrist ("Nightfall").'
    ],
    motionCues: 'Thumbs up → Cross downward'
  },

  HOWAREYOU: {
    label: 'Howareyou',
    category: 'word',
    hands: 'two',
    type: 'motion',
    difficulty: 2,
    emoji: '🤝',
    gesture: 'How (Palms Roll Up) + You (Point Forward)',
    handShape: 'Both curved hands rolling upward, then pointing forward',
    cameraHint: 'Roll both hands open palms up, then point forward',
    instruction: 'Start with both curved hands near your chest, roll them outward so both palms face up, then point your dominant index finger forward to ask "How are you?".',
    tip: 'Pair this sign with an inquisitive, friendly facial expression and slightly raised eyebrows.',
    watchOut: 'Make the rolling motion smooth before pointing forward.',
    steps: [
      'Place both curved hands in front of your chest, palms facing your body.',
      'Roll both hands outward and forward so palms face up ("How").',
      'Point your dominant index finger forward toward the camera ("You").'
    ],
    motionCues: 'Roll palms up → Point forward'
  },

  PLEASED: {
    label: 'Pleased',
    category: 'word',
    hands: 'one',
    type: 'motion',
    difficulty: 1,
    emoji: '😊',
    gesture: 'Gentle Circular Rub Over Heart/Chest',
    handShape: 'Flat open palm against chest',
    cameraHint: 'Place flat hand on chest and circle clockwise',
    instruction: 'Place your flat dominant palm against the center of your chest/heart and rub in a gentle clockwise circular motion with a warm smile.',
    tip: 'This sign signifies "Pleased", "Happy", or "Nice" (as in "Pleased to meet you").',
    watchOut: 'Do not tap or pat; keep your palm touching your chest in smooth circles.',
    steps: [
      'Place your flat dominant palm against the center of your upper chest.',
      'Move your hand in gentle, smooth clockwise circles over your heart.',
      'Smile warmly to express pleasure and friendliness.'
    ],
    motionCues: 'Circular rub over chest'
  }
}

export function getWordSignData(label) {
  if (!label) return null
  const key = String(label).toUpperCase().replace(/[\s_-]/g, '')
  return ISL_GREETINGS[key] || null
}
