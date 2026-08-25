from django.core.management.base import BaseCommand
from apps.content.models import Sign, Lesson, LessonSign
import json
import os

CATEGORY_CONFIG = {
  'greetings':              {'required_level':2,  'order':1,  'xp':15},
  'colours':                {'required_level':2,  'order':2,  'xp':15},
  'numbers':                {'required_level':2,  'order':3,  'xp':15},
  'animals':                {'required_level':3,  'order':4,  'xp':20},
  'family':                 {'required_level':3,  'order':5,  'xp':20},
  'food':                   {'required_level':3,  'order':6,  'xp':20},
  'days_and_time':          {'required_level':4,  'order':7,  'xp':25},
  'adjectives':             {'required_level':4,  'order':8,  'xp':25},
  'pronouns':               {'required_level':4,  'order':9,  'xp':25},
  'jobs':                   {'required_level':5,  'order':10, 'xp':30},
  'places':                 {'required_level':5,  'order':11, 'xp':30},
  'clothes':                {'required_level':5,  'order':12, 'xp':30},
  'electronics':            {'required_level':6,  'order':13, 'xp':35},
  'means_of_transportation':{'required_level':6,  'order':14, 'xp':35},
  'seasons':                {'required_level':6,  'order':15, 'xp':35},
  'society':                {'required_level':7,  'order':16, 'xp':40},
  'home':                   {'required_level':7,  'order':17, 'xp':40},
  'people':                 {'required_level':8,  'order':18, 'xp':45},
}

class Command(BaseCommand):
  help = 'Seed word lessons from extracted word landmarks json'

  def handle(self, *args, **kwargs):
    # Find word_landmarks.json by searching upwards for ishaara-ml
    current = os.path.abspath(__file__)
    json_path = None
    while current:
      parent = os.path.dirname(current)
      candidate = os.path.join(parent, 'ishaara-ml', 'models', 'word_landmarks.json')
      if os.path.exists(candidate):
        json_path = candidate
        break
      if parent == current:
        break
      current = parent

    if not json_path or not os.path.exists(json_path):
      # Fallback to simple relative path
      json_path = '../ishaara-ml/models/word_landmarks.json'

    self.stdout.write(f"Reading landmarks from {json_path}")
    if not os.path.exists(json_path):
      self.stderr.write(f"Error: landmarks file not found at {json_path}")
      return

    with open(json_path) as f:
      word_data = json.load(f)

    created_signs   = 0
    created_lessons = 0

    # Group words by category
    by_category = {}
    for word, info in word_data.items():
      cat = info['category']
      if cat not in by_category:
        by_category[cat] = []
      by_category[cat].append((word, info))

    for category, words in by_category.items():
      config = CATEGORY_CONFIG.get(category, {
        'required_level': 3, 'order': 99, 'xp': 20})

      # Create lesson for this category
      lesson_title = category.replace('_', ' ').title()
      lesson, _    = Lesson.objects.get_or_create(
        title=lesson_title,
        defaults={
          'description':     f'Learn {lesson_title} signs in ISL',
          'category':        'word',
          'difficulty':      min(5, config['required_level'] // 2 + 1),
          'order_index':     config['order'],
          'required_level':  config['required_level'],
          'is_published':    True,
        }
      )

      for i, (word, info) in enumerate(words):
        sign, created = Sign.objects.get_or_create(
          slug=f'sign-{word.lower().replace(" ","-")}',
          defaults={
            'label':               word.title(),
            'category':            'word',
            'difficulty':          config['required_level'] // 2 + 1,
            'reference_landmarks': info['reference_landmarks'],
            'xp_reward':           config['xp'],
          }
        )
        if created: created_signs += 1

        LessonSign.objects.get_or_create(
          lesson=lesson, sign=sign,
          defaults={'order_index': i})

      created_lessons += 1
      self.stdout.write(f'Created/updated lesson: {lesson_title} ({len(words)} words)')

    self.stdout.write(f'Done: {created_signs} signs, {created_lessons} lessons')
