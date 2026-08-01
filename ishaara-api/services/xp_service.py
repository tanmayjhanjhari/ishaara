from apps.gamification.models import XPEvent
from django.db import transaction

# LEVEL_THRESHOLDS[n] = min XP to reach level n+1
LEVEL_THRESHOLDS = [0]
_xp = 0
for _n in range(1, 51):
    _xp += 100 + (_n - 1) * 50
    LEVEL_THRESHOLDS.append(_xp)


def compute_level(total_xp):
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp >= threshold:
            level = i + 1
        else:
            break
    return min(level, 50)


def compute_xp_for_attempt(score, base_xp):
    if score < 50:
        return 0  # No XP for failed attempts
    multiplier = score / 100
    return round(base_xp * multiplier)


@transaction.atomic
def award_xp(user, amount, source_type, source_id=None):
    if amount <= 0:
        return {
            'xp_earned': 0,
            'total_xp':  user.profile.xp_total,
            'new_level': user.profile.level,
            'leveled_up': False,
        }
    XPEvent.objects.create(
        user=user,
        amount=amount,
        source_type=source_type,
        source_id=source_id,
    )
    profile = user.profile
    old_level = profile.level
    profile.xp_total += amount
    profile.level = compute_level(profile.xp_total)
    profile.save(update_fields=['xp_total', 'level'])
    return {
        'xp_earned': amount,
        'total_xp':  profile.xp_total,
        'new_level': profile.level,
        'leveled_up': profile.level > old_level,
    }
