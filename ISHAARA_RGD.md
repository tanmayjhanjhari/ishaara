# ISHAARA — Requirement Gathering Document (RGD)
> Phase 0 | Status: Approved

---

## 1. Problem Statement

Indian Sign Language is the primary communication method for an estimated 18 million deaf and hard-of-hearing individuals in India. No accessible, structured, self-paced digital platform exists for learning ISL. Existing resources are either static videos, expensive courses, or require a human tutor. There is no platform that teaches ISL interactively, validates whether the learner is signing correctly in real time, or makes the learning process engaging enough to sustain habit formation.

---

## 2. Target Users

**Primary**
- Hearing individuals who want to communicate with deaf family members, colleagues, or friends
- Students learning ISL as part of accessibility coursework
- Professionals in healthcare, education, or public service

**Secondary**
- Deaf individuals learning standardized ISL signs
- Teachers and trainers who want a supplementary tool for learners
- Self-learners motivated by personal interest

**Persona: Core Learner**
Age 18–35. Tech-comfortable. Motivated but inconsistent without structure. Needs daily habit reinforcement. Expects app-quality UX, not an academic tool.

---

## 3. User Pain Points

| Pain Point | Impact |
|---|---|
| No real-time feedback on whether a sign is correct | Learner builds wrong muscle memory |
| Existing content is passive (video-only) | No active practice or validation |
| No progression system | Learner loses motivation quickly |
| No habit-forming mechanisms | Drop-off within days of starting |
| ISL learning is expensive (tutors) | Not accessible to most users |
| No mobile-friendly interactive ISL tool in India | Massive accessibility gap |

---

## 4. Project Objectives

1. Deliver a webcam-based ISL learning platform that validates signs in real time using computer vision
2. Structure learning into progressive lessons (alphabet → words → phrases)
3. Implement a gamification layer to sustain daily engagement
4. Track learner progress with granular data (per-sign accuracy, streaks, XP)
5. Build a portfolio-quality product demonstrating full-stack, CV, and system design competence

---

## 5. Functional Requirements

### Authentication
- User registration with email and password
- Login, logout, JWT-based session management
- User profile with display name and avatar

### Learning Content
- Structured lessons organized by difficulty and category
- Each lesson contains an ordered sequence of ISL signs
- Signs have a label, description, difficulty rating, and reference video/image
- Lesson completion tracked per user

### Webcam + Gesture Recognition
- Access device webcam via browser API
- Run MediaPipe Hands to extract 21 hand landmarks per hand
- Compare detected landmarks against reference sign data
- Return a confidence-based correctness score in real time
- Provide visual feedback (correct / almost / try again)

### Progress Tracking
- Track every sign attempt: sign ID, score, timestamp, user ID
- Calculate per-sign accuracy over time
- Show overall progress per lesson and across all lessons
- Identify weak signs and recommend review

### Gamification
- XP earned per correct sign, scaled by accuracy
- User levels based on cumulative XP
- Daily streak tracking (practicing at least once per day)
- Badges awarded for milestones (first sign, 7-day streak, lesson complete, etc.)
- Leaderboard showing top users by XP this week

### Dashboard
- Overview of XP, level, streak, recent lessons, weak signs
- Visual progress rings and streak calendar
- Quick-access to continue the current lesson

### Admin Panel
- Create, edit, delete signs and lessons
- View aggregate user stats and progress

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Webcam inference latency | < 100ms per frame |
| Page load time | < 2 seconds on standard connection |
| API response time | < 300ms P95 |
| Mobile responsiveness | Usable on 375px minimum width |
| Accessibility | WCAG 2.1 AA |
| Code quality | Reusable components, clean folder structure |
| Security | JWT auth, no raw passwords stored, HTTPS in production |
| Scalability | Architecture supports adding new sign categories and lesson types |

---

## 7. Success Metrics

**Engagement**
- Average session duration > 5 minutes
- Day-7 retention > 30%
- Users completing at least 3 lessons

**Learning Quality**
- Average sign accuracy improves > 20% between first and fifth attempt
- Weak sign detection surfaced and practiced in review sessions

**Technical**
- Gesture recognition accuracy > 85% for alphabet signs under normal lighting
- Zero critical bugs in core lesson flow at launch

**Portfolio**
- Demonstrates: REST API design, database modeling, computer vision integration, gamification systems, component architecture, deployment

---

## 8. Constraints

| Constraint | Detail |
|---|---|
| Budget | Free-tier hosting only (Render, Vercel, or equivalent) |
| Dataset | Must use publicly available ISL landmark datasets (Kaggle) |
| Team size | Solo developer with AI assistance |
| Browser compatibility | Chrome and Firefox (webcam API dependency) |
| No native app | Web-only for v1 (PWA optional) |
| Inference location | All CV inference runs client-side — no video data sent to server |
| Timeline | MVP in approximately 8–12 weeks |

---

## 9. Assumptions

- Users have a working webcam and are in reasonably lit conditions
- Phase 1 covers alphabet signs only (A–Z); word and phrase recognition is Phase 2
- Reference sign data (landmarks) will be sourced from publicly available Kaggle ISL datasets
- The platform will be used in landscape or desktop mode for webcam accuracy
- Users accept webcam access prompt on their own device
- Backend landmark data is stored as reference only; no user video is stored or transmitted

---

## 10. Out of Scope for v1

- Mobile native apps (iOS/Android)
- Two-person signing or conversation mode
- Speech-to-sign translation
- Teacher/class management system
- Social features (friends, chat)
- Offline mode
