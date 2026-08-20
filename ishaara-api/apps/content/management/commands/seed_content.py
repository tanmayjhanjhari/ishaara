import string
from django.core.management.base import BaseCommand
from apps.content.models import Sign, Lesson, LessonSign

ISL_INSTRUCTIONS = {
    'A': 'Close your fist with thumb resting beside the index finger',
    'B': 'Hold all four fingers straight up, thumb folded across palm',
    'C': 'Curve your hand into a C shape like holding a cup',
    'D': 'Touch index fingertip to thumb tip, other fingers point up',
    'E': 'Curl all fingers down touching the thumb',
    'F': 'Touch index fingertip to thumb, other three fingers spread out',
    'G': 'Point index finger sideways, thumb points same direction',
    'H': 'Point index and middle fingers sideways together',
    'I': 'Raise only your pinky finger, fist everything else',
    'J': 'Raise pinky and draw a J shape in the air',
    'K': 'Index and middle fingers up in a V, thumb between them',
    'L': 'Extend index finger up and thumb out to the side forming an L',
    'M': 'Tuck three fingers over the thumb into fist position',
    'N': 'Tuck two fingers over the thumb into fist position',
    'O': 'Curve all fingers to touch the thumb forming an O shape',
    'P': 'Point index finger down, thumb out, like a K pointing down',
    'Q': 'Point index finger down and thumb down beside it',
    'R': 'Cross your index finger over your middle finger',
    'S': 'Make a fist with thumb over the fingers',
    'T': 'Make a fist with thumb tucked between index and middle fingers',
    'U': 'Hold index and middle fingers up together pointing up',
    'V': 'Hold index and middle fingers up in a V or peace sign',
    'W': 'Hold index, middle and ring fingers up spread apart',
    'X': 'Curl your index finger into a hook shape',
    'Y': 'Extend thumb and pinky out, curl other fingers into palm',
    'Z': 'Point index finger and trace a Z shape in the air',
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
            # Update description on existing records in case it was empty before
            if not sign.description and letter in ISL_INSTRUCTIONS:
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
