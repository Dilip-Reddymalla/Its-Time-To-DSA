# Its-Time-To-DSA 🚀

> A personalized, dynamic **DSA Roadmap Platform** that generates phase-based study schedules, tracks your LeetCode progress in real-time, and visualizes your growth — all wrapped in a stunning glassmorphism dark-mode UI.

---

## 📸 Overview

Its-Time-To-DSA takes the guesswork out of competitive programming preparation. You set your daily intensity and roadmap length, and the platform builds you a fully structured algorithm training plan — automatically scaling problem difficulty as you progress through phases like Basics → Patterns → Logic → Data Structures → Advanced.

---

## ✨ Features

### 🔐 Authentication
- Google OAuth 2.0 sign-in — no passwords needed
- Session persisted via HTTP-only JWT cookies (auto-restored on refresh)

### 🧭 Onboarding Wizard (4 Steps)
- Link your **LeetCode username** with live validation against the LeetCode GraphQL API
- Choose your **Daily Intensity**: Light / Medium / Intense
- Choose your **Roadmap Duration**: Sprint (60 days) / Standard (90 days) / Marathon (120 days)
- Set your **start date** — schedule generates around it automatically

### 🎯 Today's Mission (`/dashboard`)
- Full list of today's problems with difficulty badges (`Easy` / `Medium` / `Hard`)
- **Revision badges** on spaced-repetition problems
- Direct LeetCode deep-links for each problem
- Real-time progress bar (solved / total)
- **Circular progress ring** with animated fill
- 🔥 Streak counter
- ⌛ LeetCode sync button — verifies your actual submissions
- 🎊 Confetti celebration when all problems are completed

### 📅 Master Roadmap Calendar (`/dashboard/calendar`)
- Full month-by-month grid of your entire roadmap
- Timezone-safe rendering (IST-proof — no date drift)
- Unique `D{n}` day pills map calendar dates to roadmap days
- Green dot indicator on revision days
- Click any scheduled day → slide-in detail panel showing:
  - Day type, date, problem count
  - Full problem list with difficulty + revision badges
  - Direct LeetCode links

### 📊 Progress & Analytics (`/dashboard/progress`)
- **Activity Heatmap** — GitHub-style 365-day contribution grid with a "today" ring highlight
- **Topic Breakdown** — Bar chart of solved problems per topic
- **Difficulty Distribution** — Doughnut chart (Easy / Medium / Hard)
- Summary stats: total solved, days active, current streak, longest streak

### ⚙️ Profile & Settings (`/dashboard/profile`)
- Update LeetCode username (max 2 changes per account)
- Change daily intensity
- Change roadmap duration (60 / 90 / 120 days)
- Change start date
- **Reschedule Plan** checkbox — triggers a full roadmap regeneration skipping already-solved problems

### 🏠 Landing Page (`/`)
- Animated hero section
- Features grid
- How It Works walkthrough
- Dashboard preview
- Testimonials carousel
- Live stats ticker
- CTA banner + footer

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | **React 19** + **Vite 8** |
| Routing | React Router DOM v6 |
| Global State | Zustand |
| HTTP Client | Axios (with credentials) |
| Charts | Chart.js 4 + react-chartjs-2 |
| Animations | canvas-confetti |
| Styling | **Vanilla CSS** — CSS custom properties, glassmorphism |
| Fonts | Google Fonts — Inter |
| Icons | Inline SVGs + emoji |
| Deployment | Vercel (SPA routing via `vercel.json`) |

---

## 📁 Project Structure

```
Its-Time-To-DSA/
│
├── public/
│   ├── logo.png             # App logo (shown in sidebar + login page)
│   ├── favicon.svg          # Browser tab icon
│   ├── icons.svg            # SVG sprite sheet
│   └── manifest.json        # PWA manifest
│
├── src/
│   ├── api/
│   │   └── axios.js         # Axios instance: baseURL + withCredentials
│   │
│   ├── components/
│   │   │
│   │   ├── dashboard/       # All authenticated dashboard views
│   │   │   ├── ActivityHeatmap.jsx   # 365-day UTC-safe contribution heatmap
│   │   │   ├── CalendarView.jsx      # Month grid roadmap calendar (timezone-safe)
│   │   │   ├── DashboardLayout.jsx   # Sidebar nav + mobile top bar + layout shell
│   │   │   ├── ProfileView.jsx       # User settings form with reschedule option
│   │   │   ├── ProgressView.jsx      # Stats page with charts + heatmap embed
│   │   │   └── TodayView.jsx         # Daily mission: problem list + progress
│   │   │
│   │   ├── home/            # Public landing page sections
│   │   │   ├── CTABanner.jsx
│   │   │   ├── DashboardPreview.jsx
│   │   │   ├── FeaturesGrid.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsTicker.jsx
│   │   │   └── TestimonialsCarousel.jsx
│   │   │
│   │   ├── onboarding/
│   │   │   └── OnboardingFlow.jsx    # 4-step setup wizard
│   │   │
│   │   └── ui/
│   │       └── CircularProgress.jsx  # Animated SVG ring progress indicator
│   │
│   ├── pages/
│   │   ├── HomePage.jsx     # Landing page assembler
│   │   └── LoginPage.jsx    # Google OAuth sign-in page
│   │
│   ├── store/
│   │   └── authStore.js     # Zustand store: user, isAuthenticated, checkAuth, logout
│   │
│   ├── styles/
│   │   ├── index.css        # Full design token system + component classes
│   │   └── animations.css   # Keyframe animations (reveal, slide, pulse, etc.)
│   │
│   ├── App.jsx              # Route tree + auth guards
│   ├── App.css              # Root layout styles
│   ├── index.css            # @import fonts + global reset
│   └── main.jsx             # ReactDOM.createRoot mount
│
├── index.html               # Vite HTML entry
├── vite.config.js           # Vite + React plugin config
├── vercel.json              # SPA fallback routing for Vercel
├── eslint.config.js         # ESLint flat config
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Backend server running (see `Its-Time-To-DSA_Server`)

### Install

```bash
cd Its-Time-To-DSA
npm install
```

### Development

```bash
npm run dev
# → http://localhost:5173
```

API calls to `/api/*` are proxied to the backend. If you need to configure the proxy, edit `vite.config.js`:

```js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

### Production Build

```bash
npm run build
```

Output goes to `dist/`. The `vercel.json` ensures all routes fall back to `index.html` for React Router to handle.

---

## 🎨 Design System

All design tokens are CSS custom properties in `src/styles/index.css`:

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#080b10` | Page background |
| `--bg-surface` | `#0b0e14` | Sidebar / elevated surfaces |
| `--bg-card` | `#0f1521` | Card backgrounds |
| `--indigo-500` | `#6366f1` | Primary accent (CTA, active nav) |
| `--indigo-400` | `#818cf8` | Links, secondary highlights |
| `--emerald-500` | `#10b981` | Success, revision indicators |
| `--amber-500` | `#f59e0b` | Streak, warnings |
| `--slate-400` | `#94a3b8` | Body text |
| `--slate-500` | `#64748b` | Muted labels |
| `--border-color` | `rgba(255,255,255,0.07)` | Subtle glass borders |
| `--shadow-glow` | `0 0 20px rgba(99,102,241,0.3)` | Indigo glow |

### Reusable Classes
| Class | Description |
|---|---|
| `.glass` | Backdrop-blur glass panel |
| `.glass-card` | Rounded glass card with border |
| `.bento-card` | Larger bento-style card with glow |
| `.btn` | Base button reset |
| `.btn-primary` | Indigo gradient CTA button |
| `.btn-ghost` | Transparent outlined button |
| `.badge` | Base pill badge |
| `.badge-easy` | Green easy difficulty tag |
| `.badge-medium` | Yellow medium difficulty tag |
| `.badge-hard` | Red hard difficulty tag |
| `.gradient-text` | Indigo→violet text gradient |
| `.container` | Responsive max-width wrapper |
| `.reveal` | Scroll-triggered fade-in animation target |

---

## 🌐 Routes

| Route | Component | Auth Required |
|---|---|---|
| `/` | `HomePage` | No |
| `/login` | `LoginPage` | No (redirects if authed) |
| `/onboarding` | `OnboardingFlow` | Yes |
| `/dashboard` | `TodayView` | Yes |
| `/dashboard/calendar` | `CalendarView` | Yes |
| `/dashboard/progress` | `ProgressView` | Yes |
| `/dashboard/profile` | `ProfileView` | Yes |

---

## ⚠️ Known Behaviours & Notes

### Timezone Safety
All date comparisons use **UTC-stable string building** (`YYYY-MM-DD` via `getUTCFullYear/Month/Date`) to prevent IST-related date drift. Never use `.toISOString().split('T')[0]` with local dates in this project.

### Schedule Generation Lag
After onboarding, schedule generation is async on the backend. `TodayView` polls `/schedule/today` with up to 3 automatic retries (4-second intervals) while the roadmap builds — showing a "Building your roadmap..." state.

### LeetCode Username Limit
Each account is limited to **2 username changes** to prevent abuse.

### Reschedule Requirement
Changing `dailyGoal` or `totalDays` does **not** auto-update existing schedules. You must tick **"Reschedule Plan"** in Profile Settings to regenerate.
