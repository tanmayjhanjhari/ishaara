# PROJECT_CONTEXT.md — ISHAARA
> Read this file before starting any task. This is the single source of truth for the project.

---

## What It Is

ISHAARA is a Duolingo-inspired Indian Sign Language (ISL) learning platform.
Users learn ISL by performing signs in front of their webcam.
The system evaluates signs in real time using MediaPipe hand landmark detection.
All computer vision runs in the browser. No video or landmark data is ever sent to the server.

---

## Project Structure

```
ishaara/
├── ishaara-web/     React + Vite frontend
├── ishaara-api/     Django REST backend
└── docs/            RGD, PRD, HLD reference documents
```

---

## Tech Stack (Finalized — Do Not Change)

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| State | Zustand (client), React Query (server) |
| Backend | Django, Django REST Framework |
| Auth | JWT via djangorestframework-simplejwt |
| Database | PostgreSQL |
| Computer Vision | MediaPipe Tasks Vision (browser) |
| Deployment | Vercel (frontend), Render (backend + DB) |

---

## Architecture Rules (Never Violate)

1. All CV inference runs in the browser only
2. No webcam frames, no video, no landmark data is ever sent to the server
3. Only the final score (a number 0–100) and metadata are sent to the API
4. Landmark data uses useRef only — never useState (prevents 30fps re-renders)
5. Business logic lives in services/, not in views
6. API prefix is /api/v1/ on all endpoints
7. All passwords hashed — never stored in plain text
8. JWT access token: 60 min lifetime. Refresh token: 7 days

---

## CV Pipeline (Browser Only)

```
Webcam Stream
     ↓
MediaPipe HandLandmarker
  numHands: 1 (Phase 1), 2 (Phase 2)
  runningMode: VIDEO
     ↓
21 landmarks × (x, y, z) per hand
     ↓
normalize.js
  Step 1: subtract wrist (landmark[0]) from all points
  Step 2: divide by palm size = distance(landmark[0], landmark[9])
  Result: scale-invariant, position-invariant float[63]
     ↓
useSignScorer.js
  Load reference_landmarks for current sign from API (once per sign)
  Compute Euclidean distance per landmark between user and reference
  Average across all 21 landmarks
  Map distance to score 0–100
     ↓
Hold detection: sign must be stable for 500ms before triggering
     ↓
Score + is_success POSTed to /api/v1/attempts/
Feedback rendered in UI
```

---

## Scoring System

| Score | Rating | Meaning |
|---|---|---|
| 90 – 100 | Perfect | Excellent match |
| 70 – 89 | Great | Good match |
| 50 – 69 | Almost | Needs adjustment |
| 0 – 49 | Try Again | Significant mismatch |

---

## Django App Structure

```
ishaara-api/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py    # DEBUG=True, SQLite, CORS localhost
│   │   └── production.py     # DEBUG=False, PostgreSQL, env vars
│   └── urls.py
├── apps/
│   ├── users/                # User, Profile — auth and identity
│   ├── content/              # Sign, Lesson, LessonSign — the catalog
│   ├── progress/             # Attempt, LessonProgress — user activity
│   └── gamification/         # XPEvent, Streak, Badge, UserBadge
└── services/
    ├── xp_service.py         # XP award + level calculation
    ├── streak_service.py     # Streak update logic
    └── badge_service.py      # Badge condition evaluation
```

---

## React App Structure

```
ishaara-web/src/
├── api/                  # React Query hooks (auth, lessons, progress, gamification)
├── components/
│   ├── ui/               # Atoms: Button, Input, Badge, Card, Avatar, Spinner
│   ├── layout/           # Navbar, Sidebar, PageWrapper
│   ├── lesson/           # LessonCard, SignCard, ScoreOverlay
│   ├── webcam/           # WebcamFeed, LandmarkOverlay, FeedbackDisplay
│   └── gamification/     # XPBar, StreakBadge, BadgeCard, LeaderboardRow
├── cv/                   # All computer vision logic (MediaPipe, scoring, normalize)
├── pages/                # One file per route
├── store/                # Zustand stores (authStore, sessionStore)
├── utils/                # scoring.js, constants.js
└── styles/               # tokens.css (design tokens)
```

---

## Database Models

### users_user
```
id            UUID     PK
email         VARCHAR  UNIQUE NOT NULL
username      VARCHAR  UNIQUE NOT NULL
password      VARCHAR  NOT NULL (hashed)
is_active     BOOL     DEFAULT TRUE
is_staff      BOOL     DEFAULT FALSE
created_at    TIMESTAMP
```

### users_profile
```
id            UUID     PK
user_id       UUID     FK → users_user (1:1)
display_name  VARCHAR
avatar_url    VARCHAR
xp_total      INT      DEFAULT 0
level         INT      DEFAULT 1
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### content_sign
```
id                    UUID     PK
slug                  VARCHAR  UNIQUE
label                 VARCHAR
category              VARCHAR  (alphabet / word / phrase)
difficulty            INT      1–5
reference_landmarks   JSONB
video_url             VARCHAR
xp_reward             INT      DEFAULT 10
created_at            TIMESTAMP
```

### content_lesson
```
id              UUID     PK
title           VARCHAR
description     TEXT
category        VARCHAR
difficulty      INT
order_index     INT
required_level  INT      DEFAULT 1
created_at      TIMESTAMP
```

### content_lesson_sign
```
id          UUID  PK
lesson_id   UUID  FK → content_lesson
sign_id     UUID  FK → content_sign
order_index INT
```

### progress_attempt
```
id          UUID       PK
user_id     UUID       FK → users_user
sign_id     UUID       FK → content_sign
score       FLOAT
is_success  BOOL
created_at  TIMESTAMP
INDEX (user_id, sign_id, created_at)
```

### progress_lesson_progress
```
id              UUID       PK
user_id         UUID       FK → users_user
lesson_id       UUID       FK → content_lesson
status          VARCHAR    (not_started / in_progress / completed)
accuracy        FLOAT
completed_at    TIMESTAMP
UNIQUE (user_id, lesson_id)
```

### gamification_xp_event
```
id              UUID       PK
user_id         UUID       FK → users_user
amount          INT
source_type     VARCHAR    (attempt / lesson / streak_bonus)
source_id       UUID       nullable
created_at      TIMESTAMP
```

### gamification_streak
```
id                  UUID  PK
user_id             UUID  FK → users_user (1:1)
current_streak      INT   DEFAULT 0
longest_streak      INT   DEFAULT 0
last_active_date    DATE
```

### gamification_badge
```
id                  UUID     PK
name                VARCHAR
description         TEXT
icon_url            VARCHAR
condition_type      VARCHAR  (attempt_count / lesson_count / streak_days / xp_total)
condition_value     INT
```

### gamification_user_badge
```
id          UUID       PK
user_id     UUID       FK → users_user
badge_id    UUID       FK → gamification_badge
earned_at   TIMESTAMP
UNIQUE (user_id, badge_id)
```

---

## Full API Reference

```
POST   /api/v1/auth/register/         Create account → {access, refresh, user}
POST   /api/v1/auth/login/            Login → {access, refresh, user}
POST   /api/v1/auth/logout/           Invalidate refresh token
POST   /api/v1/auth/refresh/          Rotate access token → {access}

GET    /api/v1/users/me/              Full profile + streak + xp + level
PUT    /api/v1/users/me/              Update display_name, avatar_url

GET    /api/v1/signs/                 All signs (filter: category, difficulty)
GET    /api/v1/signs/:slug/           Sign detail + reference_landmarks

GET    /api/v1/lessons/               All lessons + user progress status
GET    /api/v1/lessons/:id/           Lesson detail + ordered sign sequence

POST   /api/v1/attempts/              Record attempt → triggers XP + streak + badge
                                      Body: {sign_id, score, is_success}
                                      Returns: {xp_earned, new_level, streak_updated, badges_earned}
GET    /api/v1/attempts/              Attempt history (filter: ?sign_id=)
GET    /api/v1/progress/              All lesson progress for current user

GET    /api/v1/xp/                    {total_xp, level, xp_to_next_level}
GET    /api/v1/streak/                {current_streak, longest_streak, last_active_date}
GET    /api/v1/badges/                All earned badges for current user
GET    /api/v1/leaderboard/           Top 20 users by XP this week

POST   /api/v1/admin/signs/           Create sign (is_staff only)
PUT    /api/v1/admin/signs/:id/       Update sign (is_staff only)
DELETE /api/v1/admin/signs/:id/       Delete sign (is_staff only)
POST   /api/v1/admin/lessons/         Create lesson (is_staff only)
PUT    /api/v1/admin/lessons/:id/     Update lesson (is_staff only)
DELETE /api/v1/admin/lessons/:id/     Delete lesson (is_staff only)
```

---

## Critical Data Flow: POST /api/v1/attempts/

```
Request arrives with {sign_id, score, is_success}
     ↓
Validate: sign exists, score 0–100
     ↓
Create Attempt record in DB
     ↓
xp_service.award_xp(user, xp_amount)
  → xp_amount = sign.xp_reward × accuracy_multiplier
  → Create XPEvent record
  → Update profile.xp_total
  → Recalculate and update profile.level
     ↓
streak_service.update_streak(user)
  → If last_active_date < today: increment current_streak
  → Update last_active_date = today
  → Update longest_streak if needed
     ↓
badge_service.check_badges(user)
  → Load all badges user has NOT yet earned
  → Check each badge condition against current user stats
  → Create UserBadge records for newly met conditions
     ↓
Return {xp_earned, new_level, leveled_up, streak_updated, badges_earned}
```

---

## State Management Rules

| State | Tool | Why |
|---|---|---|
| Server data (lessons, profile, leaderboard) | React Query | Caching, background refetch, loading states |
| Auth (token, user, isAuthenticated) | Zustand | Persisted to localStorage |
| Active session (current sign, score) | Zustand | Fast client updates |
| CV / landmark data | useRef only | 30fps — must not trigger re-renders |

---

## Design System

### Colors
```
Primary:      #4F46E5   Indigo
Success:      #10B981   Emerald
Warning:      #F59E0B   Amber
Error:        #EF4444   Red
Surface:      #FFFFFF
Surface-2:    #F9FAFB
Border:       #E5E7EB
Text-primary: #111827
Text-muted:   #6B7280
```

### Typography
```
Display:  32px  700    Page titles
Heading:  24px  600    Section headers
Title:    18px  600    Card headers
Body:     16px  400    Content
Caption:  14px  400    Labels, hints
Micro:    12px  500    Tags, badges
```

### Spacing
Base unit 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64

---

## Page Routes

```
/                Public   Landing page
/register        Public   Registration
/login           Public   Login
/dashboard       Auth     Home: XP, streak, recent, weak signs
/lessons         Auth     Browse all lessons
/lessons/:id     Auth     Lesson player (webcam + sign sequence)
/profile         Auth     Stats, badges, history
/leaderboard     Auth     Weekly XP leaderboard
/admin           Staff    Signs + lessons CRUD
```

---

## Zustand Stores

### authStore
```
user            object    Current user data
accessToken     string    JWT access token
isAuthenticated bool
login()                   Save tokens + user to store + localStorage
logout()                  Clear store + localStorage + redirect /login
```

### sessionStore
```
currentSignId   string    Active sign in lesson
currentScore    number    Last score received
lessonId        string    Active lesson
signIndex       int       Position in lesson sequence
reset()                   Clear all session state
```

---

## Gamification Rules

### XP
- Earned on every successful sign attempt
- Formula: xp_earned = sign.xp_reward × (score / 100)
- Minimum score to earn XP: 50

### Levels
- Level computed from total XP
- Defined by LEVEL_THRESHOLDS array
- Level-up notification shown when threshold crossed

### Streaks
- Increment when user makes at least one successful attempt per day
- Compared against UTC date
- Broken if no activity for 24+ hours past midnight

### Badges
- Evaluated after every POST /api/v1/attempts/
- Condition types: attempt_count, lesson_count, streak_days, xp_total
- Awarded once — stored in UserBadge with timestamp

---

## Phase 1 Scope (Current)

- Alphabet signs only: A–Z (26 signs)
- Single hand detection
- Reference landmarks from Kaggle ISL dataset
- No video storage
- No social features
- No mobile app

## Phase 2 Scope (Future)

- Word and phrase recognition
- Two-hand detection
- Sequence-based gesture recognition
- Social features

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Webcam inference latency | < 100ms per frame |
| Page load time | < 2 seconds |
| API response time | < 300ms P95 |
| Mobile responsiveness | 375px minimum width |
| Accessibility | WCAG 2.1 AA |
| Security | JWT, hashed passwords, HTTPS, CORS restricted |

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (auto-deploy from main branch) |
| Backend | Render (auto-deploy from main branch) |
| Database | Render PostgreSQL |
| Environment | All secrets via environment variables, never in code |
