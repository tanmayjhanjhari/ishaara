<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/hand.svg" alt="Ishaara Logo" width="80" height="80">
  <h1 align="center">Ishaara</h1>
  <p align="center">
    <strong>An interactive, gamified platform to learn Indian Sign Language (ISL) using real-time computer vision.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green" alt="Django">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/MediaPipe-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="MediaPipe">
  </p>
</div>

<br />

## 🌟 Overview

**Ishaara** (meaning "sign" or "gesture" in Hindi/Urdu) is a web application designed to make learning Indian Sign Language (ISL) accessible, interactive, and fun. By leveraging real-time computer vision through MediaPipe, Ishaara provides instant feedback on users' hand gestures directly in the browser—no specialized hardware required.

## ✨ Features

- 📸 **Real-Time CV Feedback**: Uses MediaPipe to track hand landmarks directly in the browser and validate signs instantly with <100ms latency.
- 🎮 **Gamified Learning Experience**: Keep users engaged with XP points, level progressions, daily streaks, and unlockable badges.
- 🏆 **Global Leaderboard**: Compete with other learners on the weekly XP leaderboard.
- 📱 **Responsive & Modern UI**: Built with React and Tailwind CSS, featuring a beautiful dark-mode interface with subtle micro-animations and a dynamic design system.
- 🔒 **Secure Auth**: JWT-based authentication system with secure state persistence.

## 🛠️ Technology Stack

### Frontend (ishaara-web)
- **Framework**: React 19 + Vite
- **State Management**: Zustand (Auth, Session), React Query (Server Data)
- **Styling**: Tailwind CSS, Vanilla CSS Modules
- **Computer Vision**: MediaPipe Hand Tracking
- **Icons**: Lucide React

### Backend (ishaara-api)
- **Framework**: Django REST Framework (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Service-oriented pattern for gamification logic (XP, Streaks, Badges).

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

### Running the Backend

```bash
cd ishaara-api
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Running the Frontend

```bash
cd ishaara-web
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application!

---

<div align="center">
  <i>Empowering communication through accessible technology.</i>
</div>
