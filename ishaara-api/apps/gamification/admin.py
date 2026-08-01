from django.contrib import admin
from .models import XPEvent, Streak, Badge, UserBadge

admin.site.register(XPEvent)
admin.site.register(Streak)
admin.site.register(Badge)
admin.site.register(UserBadge)
