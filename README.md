# EventHub &bull; Full-Stack College Event Management System

**EventHub** is a production-grade collegiate event management platform built with React + Vite, Node.js + Express, and normalized MySQL (with connection pooling via `mysql2`).

---

## 🌟 Key Features

### For Students
- **Account Registration & Authentication**: Secure registration and login with bcrypt-hashed passwords and JWT sessions.
- **Event Discovery**: Search by keywords, filter by 8 categories (*Technical, Cultural, Sports, Workshop, Academic, Gaming, Entrepreneurship, Arts*), and filter by timeline (*Upcoming, Today, Past*).
- **Event Details & Registration**: Live seat capacity meters, dynamic spot counters, and one-click registration with optional notes.
- **Duplicate & Capacity Enforcement**: Strict prevention of double registrations (enforced via database unique constraints and API validation) and automatic rejection when events reach full capacity.
- **My Registrations**: Personal ticket roster with statuses (*Registered, Attended, Cancelled*), and self-cancellation.
- **Student Profile**: Editable profile with Student ID, Department, Contact info, and active event statistics.

### For Administrators
- **Admin Dashboard**: Live KPI metrics (*Total Events, Registered Students, Total Registrations, Attendance Check-ins*), category breakdown charts, and real-time registration activity feed.
- **Event Management (Full CRUD)**: Create, edit, and delete events with custom capacities, venues, dates, and cover images.
- **Participant Management**: Filter attendees by event and status, search students, and update registration statuses (*Registered &rarr; Attended &rarr; Cancelled*).
- **Role-Based Route Protection**: Automatic `403 Forbidden` enforcement for unauthorized roles on all administrative endpoints.

---

## 🏗️ Architecture & File Structure

```
khushal fssd project/
├── database/
│   └── event_management.sql       # Normalized MySQL schema, constraints, indexes & seeds
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # mysql2 connection pool & fallback relational engine
│   │   ├── controllers/
│   │   │   ├── authController.js  # Auth logic (register, login, profile)
│   │   │   ├── eventController.js # Event CRUD, search, pagination, admin stats
│   │   │   └── registrationController.js # Registrations, duplicate prevention, participants
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification & role authorization (Admin/Student)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   └── registrationRoutes.js
│   │   └── server.js              # Express app entry point
│   ├── .env                       # Environment variables
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Sticky header with role-based navigation
    │   │   ├── Footer.jsx
    │   │   ├── EventCard.jsx      # Event preview card with capacity meter
    │   │   ├── EventDetailModal.jsx # Registration & detail modal
    │   │   ├── Pagination.jsx     # Reusable pagination controls
    │   │   └── ProtectedRoute.jsx # Route guard with 403 authorization boundary
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Global auth provider & token management
    │   │   └── ToastContext.jsx   # Floating toast notification system
    │   ├── pages/
    │   │   ├── HomePage.jsx       # Hero banner, category tabs, event grid
    │   │   ├── LoginPage.jsx      # Login page with 1-click Demo credentials
    │   │   ├── RegisterPage.jsx   # Student signup page
    │   │   ├── MyRegistrationsPage.jsx # Student ticket roster
    │   │   ├── ProfilePage.jsx    # Student profile management
    │   │   ├── NotFoundPage.jsx   # 404 handler
    │   │   └── admin/
    │   │       ├── AdminDashboardPage.jsx    # Stats, analytics & recent feed
    │   │       ├── AdminEventsPage.jsx       # Event management table & CRUD modal
    │   │       └── AdminParticipantsPage.jsx # Attendee management & status updater
    │   ├── services/
    │   │   └── api.js             # Client API service with JWT interceptor
    │   ├── styles/
    │   │   └── index.css          # Design system, glassmorphism & responsive CSS
    │   ├── App.jsx                # React Router setup
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🗄️ Database Schema (`database/event_management.sql`)

### Tables & Relationships
1. **`users`**:
   - Columns: `id`, `name`, `email` (UNIQUE), `password` (bcrypt-hashed), `role` (`student`/`admin`), `student_id`, `department`, `phone`, `avatar_url`, timestamps.
2. **`events`**:
   - Columns: `id`, `title`, `description`, `category`, `date`, `time`, `venue`, `capacity` (CHECK > 0), `organizer`, `image_url`, `status`, `created_by` (FK &rarr; `users.id`), timestamps.
3. **`registrations`**:
   - Columns: `id`, `user_id` (FK &rarr; `users.id`), `event_id` (FK &rarr; `events.id`), `registration_date`, `status` (`Registered`/`Attended`/`Cancelled`), `notes`, timestamps.
   - **Constraint**: `UNIQUE KEY unique_user_event (user_id, event_id)` enforces that a user cannot have multiple simultaneous duplicate registrations for the same event.

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eventhub.com` | `admin123` | Full administrative access & statistics |
| **Student** | `aarav.sharma@college.edu` | `student123` | Pre-registered for HackForge & GenAI Masterclass |
| **Student** | `sophia.chen@college.edu` | `student123` | Pre-registered for Cultural Fest |
| **Student** | `marcus.j@college.edu` | `student123` | Pre-registered for Basketball League |
| **Student** | `ananya.patel@college.edu` | `student123` | Pre-registered for GenAI Masterclass |
| **Student** | `liam.r@college.edu` | `student123` | Pre-registered for Esports Championship |

---

## 🚀 How to Run Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```
