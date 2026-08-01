# ISHAARA — Product Requirements Document (PRD)
> Phase 1 | Status: Approved

---

## 1. Product Vision

ISHAARA is a web-based Indian Sign Language learning platform that combines structured lessons, real-time webcam-based sign validation, and gamification to make ISL learning as engaging and habit-forming as Duolingo. The product is designed for independent learners who want measurable progress without a human tutor.

---

## 2. Product Goals

| Goal | Measure |
|---|---|
| Teach ISL progressively | Alphabet → Words → Phrases across structured lessons |
| Validate signs in real time | Webcam + MediaPipe confidence score per attempt |
| Drive daily habit | Streak system + XP rewards |
| Show measurable progress | Per-sign accuracy tracking over time |
| Retain learners | Gamification, badges, leaderboard |

---

## 3. User Stories

### Authentication
- As a new user, I can register with email and password so I can save my progress
- As a returning user, I can log in and see exactly where I left off
- As a user, I can view and edit my display name and avatar

### Learning
- As a learner, I can browse all available lessons organized by category and difficulty
- As a learner, I can open a lesson and practice each sign one at a time
- As a learner, I see the reference sign (image or skeleton) alongside my webcam feed
- As a learner, I receive instant feedback after each sign attempt (correct / almost / try again)
- As a learner, I can complete a lesson and see my accuracy summary

### Gesture Recognition
- As a learner, my webcam is accessed with my permission
- As a learner, MediaPipe detects my hand landmarks in real time
- As a learner, my sign is compared to the reference and scored automatically
- As a learner, I do not need to press any button — the system detects when I hold a sign

### Progress
- As a learner, I can see my accuracy for every sign I have attempted
- As a learner, I can see which signs I struggle with and revisit them
- As a learner, I can see my lesson completion history

### Gamification
- As a learner, I earn XP for every correct sign, scaled by accuracy
- As a learner, I level up as I accumulate XP
- As a learner, I maintain a daily streak by practicing at least once per day
- As a learner, I earn badges for reaching milestones
- As a learner, I can see a weekly leaderboard and my rank

### Dashboard
- As a learner, my dashboard shows XP, level, streak, recent activity, and weak signs
- As a learner, I can continue my current lesson from the dashboard in one click

### Admin
- As an admin, I can create, edit, and delete signs and lessons
- As an admin, I can view how many users have completed each lesson

---

## 4. Feature List with Priority

| Feature | Priority | Phase |
|---|---|---|
| User registration and login | P0 | MVP |
| JWT authentication | P0 | MVP |
| Lesson browsing | P0 | MVP |
| Lesson player with sign sequence | P0 | MVP |
| Webcam access | P0 | MVP |
| MediaPipe hand landmark detection | P0 | MVP |
| Real-time sign scoring | P0 | MVP |
| Attempt recording | P0 | MVP |
| XP system | P0 | MVP |
| Streak system | P0 | MVP |
| User dashboard | P0 | MVP |
| Per-sign accuracy tracking | P1 | MVP |
| Weak sign detection | P1 | MVP |
| Badge system | P1 | MVP |
| Leaderboard | P1 | MVP |
| Admin panel | P1 | MVP |
| User profile page | P1 | MVP |
| Performance optimization | P2 | Post-MVP |
| PWA / offline support | P2 | Post-MVP |

---

## 5. Page Map

```
/                    Landing page
/register            Registration
/login               Login
/dashboard           User home (XP, streak, recent lessons, weak signs)
/lessons             All lessons (browse by category)
/lessons/:id         Lesson player (webcam + sign sequence)
/profile             User profile (stats, badges, history)
/leaderboard         Weekly XP leaderboard
/admin               Admin panel (signs + lessons CRUD)
```

---

## 6. Core User Flow

```
Register / Login
     ↓
Dashboard
     ↓
Browse Lessons → Select Lesson
     ↓
Lesson Player
  ├── Webcam activates
  ├── Reference sign shown
  ├── MediaPipe detects landmarks
  ├── Score computed
  ├── Feedback displayed
  ├── XP awarded if correct
  └── Next sign loads automatically
     ↓
Lesson Complete Screen
  ├── Accuracy summary
  ├── XP earned
  └── Streak updated
     ↓
Dashboard (updated)
```

---

## 7. Gesture Recognition Specification

| Property | Specification |
|---|---|
| Input | Webcam video stream (browser) |
| Library | MediaPipe Hands (Tasks Vision) |
| Landmarks | 21 points per hand, (x, y, z) normalized |
| Hands detected | 1 (Phase 1), 2 (Phase 2) |
| Feature vector | 63 floats (21 × 3) per hand |
| Normalization | Wrist-relative, palm-size scaled |
| Comparison | Against stored reference landmarks per sign |
| Scoring | Euclidean distance → mapped to 0–100 confidence |
| Hold detection | Sign must be stable for 500ms before scoring |
| Feedback bands | 90–100 Perfect, 70–89 Great, 50–69 Almost, below 50 Try Again |
| Inference location | Browser only — no data sent to server |

---

## 8. Data Models (High Level)

| Model | Key Fields |
|---|---|
| User | id, email, username, password, created_at |
| Profile | user, display_name, avatar_url, xp_total, level, current_streak |
| Sign | id, slug, label, category, difficulty, reference_landmarks, video_url, xp_reward |
| Lesson | id, title, category, difficulty, order_index, required_level |
| LessonSign | lesson, sign, order_index |
| Attempt | user, sign, score, is_success, created_at |
| LessonProgress | user, lesson, status, accuracy, completed_at |
| Badge | id, name, description, icon, condition_type, condition_value |
| UserBadge | user, badge, earned_at |
| Streak | user, current_streak, longest_streak, last_active_date |
| XPEvent | user, amount, source_type, source_id, created_at |
| LeaderboardEntry | computed from XPEvent, weekly |

---

## 9. API Surface (High Level)

```
Auth
  POST   /api/v1/auth/register/
  POST   /api/v1/auth/login/
  POST   /api/v1/auth/logout/
  POST   /api/v1/auth/refresh/

User
  GET    /api/v1/users/me/
  PUT    /api/v1/users/me/

Signs
  GET    /api/v1/signs/
  GET    /api/v1/signs/:slug/

Lessons
  GET    /api/v1/lessons/
  GET    /api/v1/lessons/:id/

Progress
  POST   /api/v1/attempts/
  GET    /api/v1/attempts/?sign=
  GET    /api/v1/progress/

Gamification
  GET    /api/v1/xp/
  GET    /api/v1/streak/
  GET    /api/v1/badges/
  GET    /api/v1/leaderboard/

Admin
  CRUD   /api/v1/admin/signs/
  CRUD   /api/v1/admin/lessons/
```

---

## 10. Non-Functional Specifications

| Area | Requirement |
|---|---|
| Auth | JWT with refresh token rotation |
| Password storage | bcrypt via Django's default hasher |
| Video data | Never stored or transmitted |
| API versioning | /api/v1/ prefix from day one |
| CORS | Restricted to frontend domain in production |
| Component design | Atomic design: atoms → molecules → organisms → pages |
| State management | React Query for server state, Zustand for client state |
| CSS methodology | Tailwind utility-first with a custom design token layer |
| Error handling | Global error boundary, per-request error states |
| Loading states | Skeleton loaders on all async data |

---

## 11. Design Principles

- **Clarity over cleverness** — Every screen has one primary action
- **Feedback immediacy** — Every user action gets a response within 100ms
- **Progressive disclosure** — Show only what the user needs at each step
- **Consistent motion** — Animations reinforce meaning, never decorate
- **Mobile-first** — All layouts designed at 375px and scaled up

---

## 12. Success Criteria for MVP

- [ ] User can register, log in, and reach the dashboard
- [ ] User can browse and select a lesson
- [ ] Webcam activates in the lesson player
- [ ] MediaPipe detects hand landmarks in real time
- [ ] At least one sign (letter A) is scored correctly against a reference
- [ ] XP is awarded and stored after a correct attempt
- [ ] Streak increments after daily activity
- [ ] Dashboard reflects updated XP and streak
- [ ] All core pages are responsive and load under 2 seconds
