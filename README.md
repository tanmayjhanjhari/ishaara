# 🤟 ISHAARA

<p align="center">
  <em>A modern, gamified Indian Sign Language (ISL) learning platform powered by real-time Computer Vision.</em>
</p>

## 📖 Overview

ISHAARA is an interactive, Duolingo-inspired platform designed to help users learn Indian Sign Language. 
It uses your webcam and **MediaPipe Hand Landmark Detection** to evaluate your signs in real time—all within the browser. 

For maximum privacy, **no video or image data is ever sent to the server**.

---

## ✨ Features

- **📸 Real-time Evaluation:** Practice signs directly in your browser with instant feedback using MediaPipe.
- **🎮 Gamified Learning:** Earn XP, maintain daily streaks, level up, and unlock achievements as you progress.
- **🔒 Privacy First:** 100% of the computer vision inference runs locally on your device.
- **📊 Interactive Dashboards:** Track your progress, review weak signs, and compete on the weekly leaderboard.
- **📱 Fully Responsive:** Beautiful, modern UI that works flawlessly on desktop and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Custom Design System
- **State Management:** Zustand (Client state), React Query (Server state)
- **Computer Vision:** MediaPipe Tasks Vision

### Backend
- **Framework:** Django + Django REST Framework (DRF)
- **Database:** PostgreSQL
- **Authentication:** JWT (djangorestframework-simplejwt)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL (or SQLite for local dev)

### 1. Backend Setup (`ishaara-api`)
```bash
cd ishaara-api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup (`ishaara-web`)
```bash
cd ishaara-web
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📁 Architecture Overview

- **`ishaara-web/`**: The React frontend containing the UI, computer vision pipeline (`src/cv`), state stores, and API hooks.
- **`ishaara-api/`**: The Django backend managing users, content (lessons & signs), progress tracking, and the gamification engine (XP, streaks, badges).

---

## 🔒 Privacy & Security

We believe learning should be safe. ISHAARA is built on a strict privacy model:
1. Webcam streams never leave your device.
2. Hand landmarks are extracted locally.
3. Only an accuracy score (0-100) and a sign ID are sent to our servers to update your progress.

---

## 📄 License
This project is proprietary and confidential. All rights reserved.
