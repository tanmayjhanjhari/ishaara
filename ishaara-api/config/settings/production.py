from .base import *
from decouple import config

DEBUG = False
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS',
  cast=lambda v: [s.strip() for s in v.split(',')])

SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Insert GZipMiddleware after SecurityMiddleware
if 'django.middleware.security.SecurityMiddleware' in MIDDLEWARE:
    idx = MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
    MIDDLEWARE.insert(idx + 1, 'django.middleware.gzip.GZipMiddleware')
else:
    MIDDLEWARE.insert(0, 'django.middleware.gzip.GZipMiddleware')
