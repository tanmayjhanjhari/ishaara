/**
 * islAlphabet.js — ISL Alphabet reference data
 * Contains instructions, tips, watch-outs, and steps for all 26 ISL letters.
 * Aligned with the verified ISL manual fingerspelling configurations.
 */

export const ISL_ALPHABET = {
  A: {
    letter: 'A',
    hands: 'two',
    variant: false,
    instruction: 'Touch the tip of your non-dominant thumb with the index finger of your dominant hand, keeping other fingers on both hands open and relaxed.',
    tip: 'Hold your non-dominant hand flat, palm facing up or slightly tilted, with fingers spread. Bring your dominant index finger directly to touch the thumb tip.',
    watchOut: 'Do not use the one-handed ASL sign (fist with thumb on the side). Make sure only the dominant index finger touches the non-dominant thumb tip.',
    steps: [
      'Open your non-dominant hand flat in front of your body, palm facing up.',
      'Extend the index finger of your dominant hand, keeping other fingers in a loose fist.',
      'Press the tip of your dominant index finger onto the tip of your non-dominant thumb.',
      'Hold both hands steady, ensuring they are clearly visible to the camera.'
    ]
  },
  B: {
    letter: 'B',
    hands: 'two',
    variant: false,
    instruction: 'Press both hands together in front of you, touching the tips of all fingers and thumbs of both hands to form a double-loop binoculars shape.',
    tip: 'Keep both hands slightly curved, with thumbs meeting thumbs and fingertips meeting fingertips, forming a symmetrical figure-eight shape.',
    watchOut: 'Do not cross your palms. Keep the hands side-by-side so the finger-to-finger contact is clearly visible.',
    steps: [
      'Bring both hands in front of your chest with palms facing each other.',
      'Curve your fingers slightly on both hands.',
      'Press the tips of your dominant fingers and thumb against the tips of your non-dominant fingers and thumb.',
      'Hold this symmetrical double-loop shape steady without shifting your fingers.'
    ]
  },
  C: {
    letter: 'C',
    hands: 'one',
    variant: false,
    instruction: 'Use your dominant hand to form a curved C shape, bending all four fingers together and curving your thumb up to mirror them.',
    tip: 'Keep a smooth open curve between your thumb and fingers, resembling the shape of a cup or a letter C.',
    watchOut: 'Do not use both hands. Keep your non-dominant hand away or down so the camera only sees the one-handed shape.',
    steps: [
      'Raise your dominant hand in front of your chest, palm facing sideways.',
      'Curve your four fingers together downward and inward.',
      'Curve your thumb upward, pointing towards your fingertips.',
      'Maintain a clear, open C-shaped gap between the thumb and fingers.'
    ]
  },
  D: {
    letter: 'D',
    hands: 'two',
    variant: false,
    instruction: 'Point your non-dominant index finger straight up. Use your dominant hand to form a curve with your thumb and index finger, touching the tips together to the non-dominant index.',
    tip: 'Your non-dominant index finger forms the straight back of the letter D, and your dominant index and thumb form the curve.',
    watchOut: 'Make sure your dominant thumb touches the base of the non-dominant index, and your dominant index touches its tip.',
    steps: [
      'Point your non-dominant index finger straight up, keeping other fingers closed in a fist.',
      'Curve the index finger and thumb of your dominant hand into a semi-circle.',
      'Touch the tip of your dominant index finger to the tip of your non-dominant index finger.',
      'Touch your dominant thumb to the base of your non-dominant index finger to close the shape.'
    ]
  },
  E: {
    letter: 'E',
    hands: 'two',
    variant: false,
    instruction: 'Touch the tip of your non-dominant index finger with the tip of your dominant index finger.',
    tip: 'Keep your non-dominant hand open and flat, palm facing forward, and touch the index finger tip clearly.',
    watchOut: 'Do not touch the thumb or any other finger. Vowels in ISL correspond to specific fingertips.',
    steps: [
      'Open your non-dominant hand flat, palm facing forward or slightly tilted.',
      'Extend the index finger of your dominant hand, curving the other fingers into a loose fist.',
      'Press the tip of your dominant index finger against the tip of your non-dominant index finger.',
      'Keep both hands still in this position for verification.'
    ]
  },
  F: {
    letter: 'F',
    hands: 'two',
    variant: false,
    instruction: 'Lay your dominant index and middle fingers together horizontally across the index and middle fingers of your non-dominant hand to form a cross.',
    tip: 'Keep the fingers of both hands straight and together to form a neat cross shape.',
    watchOut: 'Do not use all fingers. Only the first two fingers of both hands should cross.',
    steps: [
      'Extend the index and middle fingers of both hands, keeping other fingers closed.',
      'Place your non-dominant index and middle fingers vertically in front of you.',
      'Lay your dominant index and middle fingers horizontally across the vertical fingers of the non-dominant hand.',
      'Press the fingers together firmly at a right angle to form a cross.'
    ]
  },
  G: {
    letter: 'G',
    hands: 'two',
    variant: false,
    instruction: 'Form closed fists with both hands, and stack your dominant fist vertically on top of your non-dominant fist.',
    tip: 'Stack the fists directly, like blocks, keeping your knuckles facing forward.',
    watchOut: 'Do not place the fists side-by-side or leave a large gap between them.',
    steps: [
      'Clench both hands into firm fists.',
      'Place your non-dominant fist at chest level, flat top facing up.',
      'Position your dominant fist directly on top of the non-dominant fist.',
      'Press the fists together vertically and hold them steady.'
    ]
  },
  H: {
    letter: 'H',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm facing up. Place your dominant hand flat, palm down, and brush it across the non-dominant palm from wrist to fingertips.',
    tip: 'Make a smooth forward sweeping motion across the palm.',
    watchOut: 'Keep both hands flat and parallel during the brush, rather than curling them.',
    steps: [
      'Open your non-dominant hand flat, palm up, fingers pointing forward.',
      'Place your dominant hand flat, palm down, near your non-dominant wrist.',
      'Sweep your dominant palm forward across the open non-dominant palm.',
      'Finish the stroke with your dominant hand resting flat on the non-dominant fingers.'
    ]
  },
  I: {
    letter: 'I',
    hands: 'variant',
    supportedHands: ['one', 'two'],
    defaultHandForm: 'two',
    variant: true,
    instruction: 'ISL uses documented one-handed and two-handed forms for I. For the two-handed form, touch the tip of your non-dominant middle finger with your dominant index. For one-handed, raise only your pinky finger.',
    tip: 'In the two-handed form, keep the non-dominant hand flat, palm forward, and target the middle fingertip.',
    watchOut: 'Ensure you touch the middle finger for the two-handed form, or raise only the pinky for the one-handed form.',
    steps: [
      'For the two-handed form, open your non-dominant hand flat, palm facing forward.',
      'Point your dominant index finger and touch the tip of your non-dominant middle finger.',
      'For the one-handed form, clench your dominant hand into a fist.',
      'Extend your dominant pinky finger straight up, keeping other fingers firmly closed.'
    ]
  },
  J: {
    letter: 'J',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm up. Touch your dominant index to the tip of your non-dominant middle finger, trace down to the palm, and sweep towards the thumb to draw a J.',
    tip: 'Start at the tip of the middle finger (the I finger) and trace the letter J shape onto the palm.',
    watchOut: 'Keep the base hand flat and stationary while the dominant index performs the tracing movement.',
    steps: [
      'Open your non-dominant hand flat, palm facing up.',
      'Place the tip of your dominant index finger on the tip of your non-dominant middle finger.',
      'Slide your dominant index finger down the middle finger into the center of the palm.',
      'Curve the tracing finger across the palm towards your thumb to form the J hook.'
    ]
  },
  K: {
    letter: 'K',
    hands: 'two',
    variant: false,
    instruction: 'Point your non-dominant index finger straight up. Bend your dominant index finger slightly to form a hook, and touch its middle joint to the middle joint of the non-dominant index.',
    tip: 'Your non-dominant index is the vertical stem, and your bent dominant index touches it like the upper leg of the letter K.',
    watchOut: 'Keep other fingers tucked away. Do not let the thumb block the hook.',
    steps: [
      'Point your non-dominant index finger straight up, other fingers closed in a fist.',
      'Extend your dominant index finger and hook it slightly at the joint.',
      'Touch the middle joint of your dominant index to the middle joint of your non-dominant index.',
      'Keep the hands in contact and hold the shape steady.'
    ]
  },
  L: {
    letter: 'L',
    hands: 'one',
    variant: false,
    instruction: 'Extend your dominant index finger straight up and your thumb out horizontally to the side, other fingers curled into the palm, forming a clear L shape.',
    tip: 'Make a right-angle shape with your thumb and index finger, keeping them straight.',
    watchOut: 'Ensure the other three fingers are fully curled so the L shape is clean and readable.',
    steps: [
      'Raise your dominant hand in front of your chest.',
      'Curl your middle, ring, and pinky fingers tightly into your palm.',
      'Extend your index finger straight up vertically.',
      'Point your thumb straight out horizontally to the side.'
    ]
  },
  M: {
    letter: 'M',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm up. Place the tips of your dominant index, middle, and ring fingers together flat onto the non-dominant palm.',
    tip: 'The three dominant fingers represent the three legs of the letter M.',
    watchOut: 'Do not use your pinky. Make sure all three fingers touch the palm clearly.',
    steps: [
      'Open your non-dominant hand flat, palm facing up in front of you.',
      'Extend the index, middle, and ring fingers of your right hand together.',
      'Place the tips of these three dominant fingers on the center of the non-dominant palm.',
      'Keep both hands steady in this position.'
    ]
  },
  N: {
    letter: 'N',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm up. Place the tips of your dominant index and middle fingers together flat onto the non-dominant palm.',
    tip: 'The two dominant fingers represent the two legs of the letter N.',
    watchOut: 'Only use the index and middle fingers of your dominant hand. Keep the ring and pinky fingers curled.',
    steps: [
      'Open your non-dominant hand flat, palm facing up.',
      'Extend the index and middle fingers of your dominant hand side-by-side.',
      'Place the tips of these two dominant fingers onto the non-dominant palm.',
      'Hold both hands steady.'
    ]
  },
  O: {
    letter: 'O',
    hands: 'one',
    variant: false,
    instruction: 'Touch the tip of your dominant thumb and index finger together, curving the other fingers slightly to form a clear circle.',
    tip: 'Form an open circle similar to the letter O, keeping the inside of the circle visible to the camera.',
    watchOut: 'Do not make this a two-handed sign. Keep the non-dominant hand down.',
    steps: [
      'Raise your dominant hand in front of your body.',
      'Curve your index finger and thumb to touch their tips together.',
      'Curve your other three fingers slightly alongside the index finger.',
      'Hold the open circular shape steady.'
    ]
  },
  P: {
    letter: 'P',
    hands: 'two',
    variant: false,
    instruction: 'Point your non-dominant index finger straight up. Touch the point where your dominant index and thumb meet to the tip of your non-dominant index finger.',
    tip: 'The dominant index and thumb form a loop, and their intersection touches the top of the vertical non-dominant index.',
    watchOut: 'Ensure the dominant loop is at the top of the vertical finger to look like the letter P.',
    steps: [
      'Point your non-dominant index finger straight up, keeping other fingers closed.',
      'Form a closed circle with the index finger and thumb of your dominant hand.',
      'Bring the dominant hand to touch the top of the non-dominant index.',
      'Hold both hands steady in this P shape.'
    ]
  },
  Q: {
    letter: 'Q',
    hands: 'two',
    variant: false,
    instruction: 'Form a closed circle by touching the tips of your non-dominant index finger and thumb. Hook your dominant index finger over the top and into this circle.',
    tip: 'The non-dominant circle is the body of the Q, and the dominant hooked index is the tail.',
    watchOut: 'Keep the non-dominant circle closed and clearly hook the dominant index through or over it.',
    steps: [
      'Touch the tips of your non-dominant index finger and thumb together to form a circle.',
      'Extend your dominant index finger and hook/bend it slightly.',
      'Hook your dominant index finger over the top edge of the non-dominant circle.',
      'Hold the combined shape steady in front of the camera.'
    ]
  },
  R: {
    letter: 'R',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm up. Curl your dominant index finger into a hook and place it onto the center of the non-dominant palm.',
    tip: 'The hooked finger represents the curved leg of the letter R resting on the flat base hand.',
    watchOut: 'Keep your non-dominant palm completely flat and facing up so the hooked finger is visible.',
    steps: [
      'Open your non-dominant hand flat, palm up, fingers pointing forward.',
      'Clench the fingers of your dominant hand into a loose fist, extending only the index finger.',
      'Bend/hook your dominant index finger at the joints.',
      'Place the hooked dominant index finger directly onto the center of your open non-dominant palm.'
    ]
  },
  S: {
    letter: 'S',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm up. Touch the tip of your dominant pinky finger to the tip of your non-dominant pinky finger.',
    tip: 'This is a pinky-to-pinky contact. Keep other fingers extended or relaxed on both hands.',
    watchOut: 'Make sure only the pinky fingers touch. Do not touch other fingers.',
    steps: [
      'Open your non-dominant hand flat, palm up in front of you.',
      'Open your dominant hand flat, palm facing the non-dominant hand.',
      'Bring the tips of both pinky fingers together to touch.',
      'Hold both hands steady with the pinky contact clearly visible.'
    ]
  },
  T: {
    letter: 'T',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm facing sideways. Touch the tip of your dominant index finger to the lower edge of the non-dominant palm near the pinky base.',
    tip: 'Your dominant index forms a vertical line meeting the horizontal lower edge of the non-dominant hand.',
    watchOut: 'Do not touch the center of the palm. Touch the lower edge/side of the hand near the wrist.',
    steps: [
      'Hold your non-dominant hand flat, palm facing right, with edges vertical.',
      'Extend the index finger of your dominant hand.',
      'Place the tip of your dominant index finger against the bottom edge of your non-dominant palm near the pinky.',
      'Hold the T junction shape steady.'
    ]
  },
  U: {
    letter: 'U',
    hands: 'variant',
    supportedHands: ['one', 'two'],
    defaultHandForm: 'two',
    variant: true,
    instruction: 'ISL has documented one-handed and two-handed forms for U. For the two-handed form, touch the tip of your non-dominant pinky finger with your dominant index. For the one-handed form, extend your dominant index and middle fingers together straight up.',
    tip: 'In the two-handed form, the pinky is the last vowel finger. In the one-handed form, keep the index and middle fingers closed together.',
    watchOut: 'Keep the fingers touching in the one-handed form (unlike V where they are spread).',
    steps: [
      'For the two-handed form, open your non-dominant hand flat, palm up/forward.',
      'Touch the tip of your non-dominant pinky with your dominant index finger.',
      'For the one-handed form, clench your dominant hand into a fist.',
      'Extend the index and middle fingers of your dominant hand straight up together.'
    ]
  },
  V: {
    letter: 'V',
    hands: 'one',
    variant: false,
    instruction: 'Extend the index and middle fingers of your dominant hand, spreading them apart to form a clear V shape, other fingers curled into the palm.',
    tip: 'Keep the fingers spread wide, like a peace sign, with palm facing forward.',
    watchOut: 'Do not use both hands. Make sure the index and middle fingers are clearly separated.',
    steps: [
      'Raise your dominant hand in front of your chest.',
      'Curl your thumb, ring, and pinky fingers tightly into your palm.',
      'Extend your index and middle fingers straight up.',
      'Spread the index and middle fingers apart to form a V shape.'
    ]
  },
  W: {
    letter: 'W',
    hands: 'one',
    variant: false,
    instruction: 'Extend the index, middle, and ring fingers of your dominant hand, spreading them apart to form a W shape, other fingers curled.',
    tip: 'Keep the three extended fingers separated and pointing up, resembling the peaks of a W.',
    watchOut: 'Keep the thumb holding down the pinky finger so they don\'t extend.',
    steps: [
      'Raise your dominant hand in front of your body.',
      'Curl your pinky finger into your palm and hold it down with your thumb.',
      'Extend your index, middle, and ring fingers straight up.',
      'Spread the three extended fingers apart to form the W shape.'
    ]
  },
  X: {
    letter: 'X',
    hands: 'two',
    variant: false,
    instruction: 'Cross the index finger of your dominant hand horizontally over the index finger of your non-dominant hand to form an X.',
    tip: 'Both index fingers are extended, other fingers in fists. Cross them at a 90-degree angle.',
    watchOut: 'Keep other fingers closed so only the crossed index fingers are visible.',
    steps: [
      'Extend the index finger of both hands, keeping other fingers closed in fists.',
      'Position your non-dominant index finger vertically.',
      'Cross your dominant index finger horizontally over the middle of the non-dominant index.',
      'Press them together to form a clear X shape.'
    ]
  },
  Y: {
    letter: 'Y',
    hands: 'two',
    variant: false,
    instruction: 'Open your non-dominant hand flat, palm facing up. Place the tip of your dominant index finger in the web/space between your non-dominant thumb and index finger.',
    tip: 'Your non-dominant hand forms the base, and your dominant index points directly into the thumb-index web.',
    watchOut: 'Make sure your non-dominant hand is open and flat.',
    steps: [
      'Open your non-dominant hand flat, palm facing up in front of you.',
      'Extend the thumb and index finger of the non-dominant hand.',
      'Extend the index finger of your dominant hand.',
      'Touch the tip of your dominant index finger to the web between your non-dominant thumb and index finger.'
    ]
  },
  Z: {
    letter: 'Z',
    hands: 'variant',
    supportedHands: ['one', 'two'],
    defaultHandForm: 'two',
    variant: true,
    instruction: 'ISL has documented one-handed and two-handed forms for Z. For the two-handed form, open your non-dominant hand flat, palm up. Press the tips of your dominant fingers vertically against the center of the non-dominant palm.',
    tip: 'In the two-handed form, place your dominant fingertips flat in the middle of the non-dominant palm.',
    watchOut: 'Keep the non-dominant hand flat and facing up.',
    steps: [
      'For the two-handed form, open your non-dominant hand flat, palm facing up.',
      'Position your dominant hand with fingers straight and together.',
      'Press the tips of your dominant fingers vertically against the center of the non-dominant palm.',
      'For the one-handed form, extend your dominant index finger and trace a Z path in the air.'
    ]
  }
}

export function getSignData(letter) {
  return ISL_ALPHABET[letter?.toUpperCase()] || null
}

export function getSteps(letter) {
  const data = getSignData(letter)
  return data?.steps || []
}

export function getVariantSteps(letter, activeVariant) {
  const data = getSignData(letter)
  const steps = data?.steps || []
  if (letter === 'I') {
    return activeVariant === 'one'
      ? [
          'Clench your dominant hand into a fist.',
          'Extend your dominant pinky finger straight up, keeping other fingers firmly closed.',
          'Position your hand clearly in front of the camera and hold steady.'
        ]
      : [
          'Open your non-dominant hand flat, palm facing forward.',
          'Point your dominant index finger and touch the tip of your non-dominant middle finger.',
          'Hold both hands steady.'
        ]
  }
  if (letter === 'U') {
    return activeVariant === 'one'
      ? [
          'Clench your dominant hand into a fist.',
          'Extend the index and middle fingers of your dominant hand straight up together.',
          'Position your hand clearly in front of the camera and hold steady.'
        ]
      : [
          'Open your non-dominant hand flat, palm up/forward.',
          'Touch the tip of your non-dominant pinky with your dominant index finger.',
          'Hold both hands steady.'
        ]
  }
  if (letter === 'Z') {
    return activeVariant === 'one'
      ? [
          'Extend your dominant index finger and trace a Z path in the air.'
        ]
      : [
          'Open your non-dominant hand flat, palm facing up.',
          'Position your dominant hand with fingers straight and together.',
          'Press the tips of your dominant fingers vertically against the center of the non-dominant palm.'
        ]
  }
  return steps;
}

