# ISHAARA — High Level Design (HLD)
> Phase 2 | Status: Approved

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  BROWSER                     │
│                                             │
│  React + Vite                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pages   │  │Components│  │  Stores  │  │
│  │  Router  │  │  UI Kit  │  │ Zustand  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         CV Pipeline (client only)   │    │
│  │  Webcam → MediaPipe → Landmarks     │    │
│  │  → Normalize → Score → Feedback     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  React Query ──── HTTP / JWT ───────────┐   │
└────────────────────────────────────────┼───┘
                                         │
                                    REST API
                                         │
┌────────────────────────────────────────┼───┐
│              BACKEND (Render)          │   │
│                                        ▼   │
│  Django + DRF                              │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │   Auth   │  │  Views   │  │Services │  │
│  │  JWT     │  │  Routes  │  │Business │  │
│  └──────────┘  └──────────┘  └─────────┘  │
│                    │                        │
│             Django ORM                      │
│                    │                        │
│  ┌─────────────────▼──────────────────┐    │
│  │         PostgreSQL (Render)        │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

**Key architectural rule:** The CV pipeline is entirely client-side. No webcam frames, no video, no landmark data is ever sent to the server. Only the final score (a number) and metadata travel to the API.

---

## 2. Frontend Architecture

### 2.1 Folder Structure

```
ishaara-web/
├── public/
│   └── assets/           # Static images, sign reference images
├── src/
│   ├── api/              # React Query hooks per domain
│   │   ├── auth.js
│   │   ├── lessons.js
│   │   ├── progress.js
│   │   └── gamification.js
│   ├── components/
│   │   ├── ui/           # Atoms: Button, Input, Badge, Card, Avatar
│   │   ├── layout/       # Navbar, Sidebar, PageWrapper
│   │   ├── lesson/       # LessonCard, SignCard, ScoreOverlay
│   │   ├── webcam/       # WebcamFeed, LandmarkOverlay, FeedbackDisplay
│   │   └── gamification/ # XPBar, StreakBadge, BadgeCard, LeaderboardRow
│   ├── cv/               # All computer vision logic
│   │   ├── useMediaPipe.js
│   │   ├── useLandmarks.js
│   │   ├── useSignScorer.js
│   │   └── normalize.js
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Lessons.jsx
│   │   ├── LessonPlayer.jsx
│   │   ├── Profile.jsx
│   │   ├── Leaderboard.jsx
│   │   └── Admin.jsx
│   ├── store/
│   │   ├── authStore.js    # Zustand: user, token
│   │   └── sessionStore.js # Zustand: active lesson state
│   ├── utils/
│   │   ├── scoring.js
│   │   └── constants.js
│   ├── styles/
│   │   └── tokens.css      # Design tokens
│   ├── App.jsx
│   └── main.jsx
```

### 2.2 State Management Split

| State Type | Tool | Examples |
|---|---|---|
| Server state | React Query | User profile, lessons, leaderboard |
| Auth state | Zustand | Token, user ID, isAuthenticated |
| Session state | Zustand | Current sign, score, lesson progress |
| CV state | useRef only | Landmark data, live scores — never React state |

**Why useRef for CV:** MediaPipe runs at 30fps. Putting landmark data in React state causes 30 re-renders per second and kills performance. Refs update silently.

### 2.3 Routing

```
Public routes:    /  /login  /register
Protected routes: /dashboard  /lessons  /lessons/:id
                  /profile  /leaderboard  /admin
Route guard: checks authStore.isAuthenticated
             redirects to /login if false
```

### 2.4 CV Pipeline (Client Only)

```
Webcam Stream
     ↓
MediaPipe HandLandmarker
     ↓
21 landmarks × (x, y, z)
     ↓
normalize.js
  - Subtract wrist (landmark 0)
  - Divide by palm size (landmark 0 → landmark 9 distance)
     ↓
useSignScorer.js
  - Load reference landmarks for current sign from API
  - Compute Euclidean distance per landmark
  - Average across all 21 points
  - Map to 0–100 score
     ↓
Hold detection (500ms stability window)
     ↓
Feedback rendered → score POSTed to /api/v1/attempts/
```

---

## 3. Backend Architecture

### 3.1 Folder Structure

```
ishaara-api/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/            # User, Profile models + auth views
│   ├── content/          # Sign, Lesson, LessonSign models + views
│   ├── progress/         # Attempt, LessonProgress models + views
│   └── gamification/     # XPEvent, Streak, Badge, UserBadge + views
├── services/
│   ├── xp_service.py     # XP award logic + level calculation
│   ├── streak_service.py # Streak update logic
│   └── badge_service.py  # Badge evaluation logic
└── utils/
    └── pagination.py
```

### 3.2 App Responsibilities

| App | Owns |
|---|---|
| users | Registration, login, JWT, Profile CRUD |
| content | Signs, Lessons, LessonSigns — the content catalog |
| progress | Attempts, LessonProgress — what the user has done |
| gamification | XP, Levels, Streaks, Badges, Leaderboard |

### 3.3 Service Layer Pattern

Business logic lives in `services/`, not in views. Views handle HTTP only.

```
View receives request
     ↓
Validates input (serializer)
     ↓
Calls service function
     ↓
Service updates DB + triggers side effects
     ↓
View returns response
```

**Example:** `POST /api/v1/attempts/` → view calls `xp_service.award_xp()` → which calls `streak_service.update_streak()` → which calls `badge_service.check_badges()`. Each service is independently testable.

---

## 4. Database Design

### 4.1 Entity Relationship Overview

```
User ──────── Profile          (1:1)
User ──────── Streak           (1:1)
User ──────── Attempt          (1:many)
User ──────── LessonProgress   (1:many)
User ──────── XPEvent          (1:many)
User ──────── UserBadge        (1:many)
Lesson ─────── LessonSign      (1:many)
Sign ──────── LessonSign       (1:many)
Sign ──────── Attempt          (1:many)
Badge ──────── UserBadge       (1:many)
```

### 4.2 Complete Schema

**users_user**
```
id            UUID        PRIMARY KEY
email         VARCHAR     UNIQUE NOT NULL
username      VARCHAR     UNIQUE NOT NULL
password      VARCHAR     NOT NULL (hashed)
is_active     BOOL        DEFAULT TRUE
is_staff      BOOL        DEFAULT FALSE
created_at    TIMESTAMP
```

**users_profile**
```
id            UUID        PRIMARY KEY
user_id       UUID        FK → users_user (1:1)
display_name  VARCHAR
avatar_url    VARCHAR
xp_total      INT         DEFAULT 0
level         INT         DEFAULT 1
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

**content_sign**
```
id                    UUID    PRIMARY KEY
slug                  VARCHAR UNIQUE
label                 VARCHAR
category              VARCHAR (alphabet / word / phrase)
difficulty            INT     1–5
reference_landmarks   JSONB
video_url             VARCHAR
xp_reward             INT     DEFAULT 10
created_at            TIMESTAMP
```

**content_lesson**
```
id              UUID    PRIMARY KEY
title           VARCHAR
description     TEXT
category        VARCHAR
difficulty      INT
order_index     INT
required_level  INT     DEFAULT 1
created_at      TIMESTAMP
```

**content_lesson_sign**
```
id          UUID    PRIMARY KEY
lesson_id   UUID    FK → content_lesson
sign_id     UUID    FK → content_sign
order_index INT
```

**progress_attempt**
```
id          UUID        PRIMARY KEY
user_id     UUID        FK → users_user
sign_id     UUID        FK → content_sign
score       FLOAT
is_success  BOOL
created_at  TIMESTAMP
INDEX (user_id, sign_id, created_at)
```

**progress_lesson_progress**
```
id              UUID        PRIMARY KEY
user_id         UUID        FK → users_user
lesson_id       UUID        FK → content_lesson
status          VARCHAR     (not_started / in_progress / completed)
accuracy        FLOAT
completed_at    TIMESTAMP
UNIQUE (user_id, lesson_id)
```

**gamification_xp_event**
```
id              UUID        PRIMARY KEY
user_id         UUID        FK → users_user
amount          INT
source_type     VARCHAR     (attempt / lesson / streak_bonus)
source_id       UUID        nullable
created_at      TIMESTAMP
```

**gamification_streak**
```
id                  UUID    PRIMARY KEY
user_id             UUID    FK → users_user (1:1)
current_streak      INT     DEFAULT 0
longest_streak      INT     DEFAULT 0
last_active_date    DATE
```

**gamification_badge**
```
id                  UUID    PRIMARY KEY
name                VARCHAR
description         TEXT
icon_url            VARCHAR
condition_type      VARCHAR (attempt_count / lesson_count / streak_days / xp_total)
condition_value     INT
```

**gamification_user_badge**
```
id          UUID        PRIMARY KEY
user_id     UUID        FK → users_user
badge_id    UUID        FK → gamification_badge
earned_at   TIMESTAMP
UNIQUE (user_id, badge_id)
```

---

## 5. API Design

### 5.1 Conventions

- Base prefix: `/api/v1/`
- Auth: `Authorization: Bearer {access_token}` on all protected routes
- Response envelope: `{ status, data, message }`
- Errors: `{ status: "error", code: "SIGN_NOT_FOUND", message: "..." }`

### 5.2 Endpoint Specification

**Auth**
```
POST /api/v1/auth/register/     → {access, refresh, user}
POST /api/v1/auth/login/        → {access, refresh, user}
POST /api/v1/auth/logout/       → 200
POST /api/v1/auth/refresh/      → {access}
```

**User**
```
GET  /api/v1/users/me/          → full profile + streak + xp
PUT  /api/v1/users/me/          → update display_name, avatar_url
```

**Content**
```
GET  /api/v1/signs/             → list (filter: category, difficulty)
GET  /api/v1/signs/:slug/       → detail with reference_landmarks
GET  /api/v1/lessons/           → list with user progress status
GET  /api/v1/lessons/:id/       → detail with ordered sign sequence
```

**Progress**
```
POST /api/v1/attempts/          → {sign_id, score, is_success}
                                   triggers: XP award, streak update, badge check
GET  /api/v1/attempts/          → history (filter: sign_id)
GET  /api/v1/progress/          → all lesson progress for current user
```

**Gamification**
```
GET  /api/v1/xp/                → total XP, level, XP to next level
GET  /api/v1/streak/            → current, longest, last_active_date
GET  /api/v1/badges/            → all earned badges for current user
GET  /api/v1/leaderboard/       → top 20 users by XP this week
```

**Admin**
```
POST/PUT/DELETE /api/v1/admin/signs/
POST/PUT/DELETE /api/v1/admin/lessons/
```

### 5.3 Critical Flow: POST /api/v1/attempts/

```
Request arrives
     ↓
Validate: sign exists, score in range
     ↓
Create Attempt record
     ↓
xp_service.award_xp(user, sign.xp_reward × accuracy_multiplier)
  → Create XPEvent
  → Update profile.xp_total
  → Recalculate level
     ↓
streak_service.update_streak(user)
  → If last_active_date < today: increment streak
  → Update last_active_date
     ↓
badge_service.check_badges(user)
  → Query all unearned badges
  → Check conditions against current stats
  → Award any newly met badges
     ↓
Return: {xp_earned, new_level, streak_updated, badges_earned}
```

---

## 6. Design System

### 6.1 Color Tokens

```
Primary:      #4F46E5  (Indigo — trust, intelligence)
Success:      #10B981  (Emerald — correct sign)
Warning:      #F59E0B  (Amber — almost correct)
Error:        #EF4444  (Red — try again)
Surface:      #FFFFFF
Surface-2:    #F9FAFB
Border:       #E5E7EB
Text-primary: #111827
Text-muted:   #6B7280
```

### 6.2 Typography Scale

```
Display:  32px / 700 weight  — page titles
Heading:  24px / 600 weight  — section headers
Title:    18px / 600 weight  — card headers
Body:     16px / 400 weight  — paragraph text
Caption:  14px / 400 weight  — labels, hints
Micro:    12px / 500 weight  — badges, tags
```

### 6.3 Spacing System

Base unit: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64px

### 6.4 Component Inventory

| Category | Components |
|---|---|
| Atoms | Button, Input, Badge, Avatar, Spinner, Divider |
| Molecules | Card, FormField, SignCard, ScoreRing, StatTile |
| Organisms | Navbar, LessonCard, WebcamPanel, ProgressBar, LeaderboardTable |
| Pages | Landing, Login, Register, Dashboard, Lessons, LessonPlayer, Profile, Leaderboard, Admin |

---

## 7. Deployment Architecture

```
Vercel                        Render
──────────────────────        ──────────────────────────
React + Vite build            Django + Gunicorn
Static file serving           PostgreSQL instance
CDN distribution              Environment variables
Custom domain (future)        Auto-deploy from GitHub
```

**GitHub auto-deploy pipeline:**
- Push to `main` → Vercel builds frontend automatically
- Push to `main` → Render builds backend + runs migrations

---

## 8. Security Design

| Concern | Solution |
|---|---|
| Password storage | Django PBKDF2 hasher (default) |
| Auth tokens | JWT access (60 min) + refresh (7 days) |
| CORS | Restricted to Vercel domain in production |
| User data | No webcam data ever transmitted |
| Admin routes | is_staff check on all admin endpoints |
| SQL injection | Django ORM (parameterized queries by default) |
| XSS | React escapes all rendered values by default |

---

## 9. Scalability Considerations

| Area | Current | Future Path |
|---|---|---|
| Sign library | 26 alphabet signs | Add word/phrase categories without schema change |
| Lesson types | Linear sequence | Schema supports any ordering |
| Scoring | Distance-based | Swap scorer without API changes |
| Leaderboard | DB query weekly | Redis sorted set at scale |
| Background jobs | Synchronous in request | Celery task queue when needed |

---

## 10. Feature Implementation Order

```
1.  React Frontend Foundation
2.  UI Design System
3.  Django Backend Foundation
4.  Database Models
5.  Authentication Backend
6.  Authentication Frontend
7.  Lesson Management Backend
8.  Lesson UI
9.  Progress Tracking
10. Webcam Integration
11. MediaPipe Integration
12. Gesture Recognition Engine
13. Real-Time Feedback
14. XP System
15. Streak System
16. Badge System
17. Leaderboard
18. User Dashboard
19. Admin Panel
20. Performance Optimization
21. Deployment
```
