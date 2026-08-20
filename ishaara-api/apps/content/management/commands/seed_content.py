import string
from django.core.management.base import BaseCommand
from apps.content.models import Sign, Lesson, LessonSign

ISL_INSTRUCTIONS = {
    'A': 'Touch the tip of your left thumb with your right index finger',
    'B': "Form circles with both hands and place them together like an '8'",
    'C': 'Curve your hand into a C shape, like holding a cup (one-handed)',
    'D': 'Point your left index finger up, and touch your right index and thumb to it to form a D shape',
    'E': 'Touch the tip of your left index finger with your right index finger',
    'F': 'Place your right index and middle fingers together flat across the first two fingers of your left hand',
    'G': 'Clench both fists and place your right fist on top of your left fist',
    'H': 'Place your left hand flat, palm up, and sweep your right flat hand across it from wrist to fingers',
    'I': 'Raise only your pinky finger, fist everything else (one-handed)',
    'J': 'Touch your left palm with your right index, then trace down your left index finger and draw a J shape',
    'K': 'Point your left index finger up, and touch your right index finger (hooked) to its middle joint',
    'L': 'Extend your index finger up and thumb out to the side, forming an L shape (one-handed)',
    'M': 'Place your right index, middle, and ring fingers together on your left palm',
    'N': 'Place your right index and middle fingers together on your left palm',
    'O': 'Curve all fingers to touch the thumb, forming an O shape (one-handed)',
    'P': 'Point your left index finger up, form a circle with right index and thumb, and touch the left index tip',
    'Q': 'Form a circle with your left thumb and index, and hook your right index finger through it',
    'R': 'Place your right index finger bent/hooked onto your left palm',
    'S': 'Hook your right pinky finger around your left pinky finger',
    'T': 'Touch the bottom edge of your left palm with your right index finger',
    'U': 'Hold index and middle fingers up together, pointing up (one-handed)',
    'V': 'Hold index and middle fingers up in a V or peace sign (one-handed)',
    'W': 'Interlock the fingers of both hands, palms facing each other',
    'X': 'Cross your right index finger over your left index finger to form an X',
    'Y': 'Extend your left thumb and index finger, and place your right index finger in the web between them',
    'Z': 'Touch your left palm with your right index finger, then move/touch the base of your palm',
}


class Command(BaseCommand):
    help = 'Seed initial ISL alphabet content'

    def handle(self, *args, **kwargs):
        signs = []
        for index, letter in enumerate(string.ascii_uppercase):
            sign, created = Sign.objects.get_or_create(
                slug=f'sign-{letter.lower()}',
                defaults={
                    'label':       letter,
                    'description': ISL_INSTRUCTIONS.get(letter, ''),
                    'category':    'alphabet',
                    'difficulty':  1,
                    'xp_reward':   10,
                }
            )
            # Always update description on existing records to keep in sync with ISL_INSTRUCTIONS
            if letter in ISL_INSTRUCTIONS and sign.description != ISL_INSTRUCTIONS[letter]:
                sign.description = ISL_INSTRUCTIONS[letter]
                sign.save(update_fields=['description'])

            signs.append(sign)
            status = 'created' if created else 'exists'
            self.stdout.write(f'  {letter}: {status}')

        lesson, created = Lesson.objects.get_or_create(
            title='ISL Alphabet',
            defaults={
                'description':   'Learn all 26 letters of the Indian Sign Language alphabet',
                'category':      'alphabet',
                'difficulty':    1,
                'order_index':   0,
                'required_level': 1,
                'is_published':  True,
            }
        )

        for index, sign in enumerate(signs):
            LessonSign.objects.get_or_create(
                lesson=lesson,
                sign=sign,
                defaults={'order_index': index}
            )

        self.stdout.write(self.style.SUCCESS(
            f"\n[OK] {'Created' if created else 'Updated'} 26 signs and 1 lesson successfully"
        ))
