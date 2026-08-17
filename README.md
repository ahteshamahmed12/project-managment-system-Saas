# 🚀 Project Management SaaS (Promage)

A modern **Project Management SaaS** built with **FastAPI**, **PostgreSQL**, and **React**. This application provides secure JWT authentication, role-based access control (RBAC), and lets teams manage projects, sprints, tasks and users through a RESTful API with a polished React dashboard.

---

## ✨ Features

### Authentication & Users
- 🔐 JWT Authentication (Access + Refresh Tokens)
- 👤 User Registration & Login (normal + admin login pages)
- 📧 Forgot / Reset Password (UI + API)
- 🧑‍💼 Profile management (name, phone, avatar, department) & account deletion
- 👥 Admin user management (list, create, update, delete)

### Roles & Permissions (RBAC)
- 🛡️ Granular permission system (`resource:action` e.g. `sprint:read`)
- 👑 Roles: `owner`, `admin`, `manager`, `member`, `viewer`
- 🔒 Backend route protection via `require_permission`
- 🧩 Admin permissions management UI

### Projects, Tasks & Sprints
- 📁 Project management UI
- ✅ Task management (board/table, task details, story points, priorities, statuses)
- 🔄 Sprint management — fully connected to the backend (CRUD, start, complete, burndown chart data, move tasks between sprints)

### Global Search
- 🔍 Navbar global search across **users, projects, sprints and tasks** (debounced, grouped results, click-to-navigate)
- ⚙️ Backend `GET /api/search/?q=...` with LIKE-based matching (auth required)

### Dashboard & Analytics
- 📊 User dashboard (stats, charts with Recharts)
- 🛠️ Admin dashboard (user overview, project overview, activity overview)
- 📈 Performance page with charts & cards
- 🗂️ Reports page

### Real-Time & UX
- 🔔 Notifications UI (dropdown + list, read/unread, clear)
- 🟢 WebSocket routes + connection manager (backend)
- 🌗 Light/Dark theme toggle
- 📱 Responsive layout (collapsible sidebar, mobile menu)
- 🖱️ Drag & drop support (dnd-kit) for sprint/task reordering

---

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui components
- React Router v7, React Hook Form + Zod validation
- Recharts, lucide-react, dnd-kit, axios

### Backend
- Python + FastAPI + Uvicorn
- SQLAlchemy 2 (async) + asyncpg
- PostgreSQL
- Pydantic v2 + pydantic-settings
- PyJWT (access + refresh tokens)
- WebSockets

---

## 📂 Project Structure

```text
project-managment-system-Saas/
│
├── Backend/                     # FastAPI application
│   ├── main.py                  # App entry point (router registration, CORS)
│   ├── config.py                # Environment settings (pydantic-settings)
│   ├── database.py              # Async engine, session factory, get_db
│   ├── seed_rbac.py             # Seeds permissions + roles
│   ├── seed_admins.py           # Seeds admin users
│   ├── auth/                    # Password hashing, JWT handler, get_current_user
│   ├── dependencies/            # require_permission (RBAC guard)
│   ├── models/                  # User, Role, Permission, Project, Task, Sprint
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── routers/                 # auth, user, role, sprints, search
│   ├── services/                # Business logic (global search)
│   └── app/websocket/           # WS connection manager + routes
│
└── frontend/                    # React application
    └── src/
        ├── pages/               # Auth, Dashboard, Projects, Tasks, Sprints,
        │                        # TeamManagement, Users, Reports, Settings,
        │                        # Notifications, Profile, Activity,
        │                        # TeamActivity, Admin/*
        ├── components/          # layout (Navbar, Sidebar), common
        │                        # (GlobalSearch, SearchFilterBar), ui (shadcn)
        ├── context/             # Auth, Users, Projects, Sprints, Notifications
        ├── lib/                 # API clients, validations, mappers, utils
        ├── types/               # Shared TypeScript types
        └── routes/              # AppRoutes (public/protected/admin routes)
```

---

## ⚙️ Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL

### 1. Backend

```bash
cd Backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux / macOS

pip install fastapi uvicorn[standard] sqlalchemy asyncpg pydantic pydantic-settings pyjwt email-validator
```

### 2. Environment Variables

Create a `.env` file inside `Backend/`:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost/database_name

SECRET_KEY=your_secret_key

REFRESH_SECRET_KEY=your_refresh_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ▶️ Run the Application

### Backend (from the `Backend/` folder)

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs` and `http://localhost:8000/redoc`.

### Seed the database (first run)

```bash
python seed_rbac.py      # create permissions + roles (owner, admin, manager, member, viewer)
python seed_admins.py    # create default admin accounts
```

Default admin accounts (from `seed_admins.py`):

| Name           | Email                      | Password   |
| -------------- | -------------------------- | ---------- |
| Syed Huzaifa   | syedhuzaifa@gmail.com      | `Admin@123` |
| Ahtesham Ahmed | ahteshamahmed405@gmail.com | `Admin@123` |
| Zain           | zainulabideen@gmail.com    | `Admin@123` |

### Frontend

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## 🔌 API Overview

All endpoints (except auth) require a `Bearer` token.

| Method | Endpoint                              | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`                  | Register a new user                  |
| POST   | `/api/auth/login`                     | Login (returns access + refresh)     |
| POST   | `/api/auth/refresh`                   | Refresh access token                 |
| GET    | `/api/auth/me`                        | Current user profile                 |
| PUT    | `/api/auth/me`                        | Update profile                       |
| DELETE | `/api/auth/me`                        | Delete account                       |
| POST   | `/api/auth/forgot-password`           | Request password reset               |
| POST   | `/api/auth/reset-password`            | Reset password                       |
| GET    | `/api/users/`                         | List users (admin)                   |
| GET/PUT/DELETE | `/api/users/{id}`            | Read / update / delete a user        |
| GET/POST/PUT/DELETE | `/api/roles/...`          | Role management (admin)              |
| GET/POST/PUT/DELETE | `/api/sprints/...`        | Sprint CRUD                          |
| GET    | `/api/sprints/{id}/burndown`          | Burndown data for a sprint           |
| PATCH  | `/api/sprints/{id}/start`             | Start a sprint                       |
| PATCH  | `/api/sprints/{id}/complete`          | Complete a sprint                    |
| PATCH  | `/api/sprints/tasks/{task_id}/move-to-sprint/{sprint_id}` | Move task to sprint |
| GET    | `/api/search/?q=term`                 | Global search (users, projects, sprints, tasks) |

WebSocket: `ws://localhost:8000/ws/...` (see `Backend/app/websocket/`).

---

## 📚 API Documentation

After running the server:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📌 Current Status

### ✅ Completed

- User Authentication (login, register, refresh, profile, forgot/reset password)
- JWT Access & Refresh Tokens
- PostgreSQL + async SQLAlchemy integration
- Role-Based Access Control (5 roles, granular permissions, route guards)
- Admin seeding scripts
- Sprint module fully connected to the backend (CRUD, burndown, task moves)
- Global search (backend + navbar frontend)
- Users, Projects, Tasks, Team Management, Reports, Settings UI
- Admin dashboard, permissions & performance pages
- Notifications UI (dropdown + page)
- Light/Dark theme, responsive layout, drag & drop
- WebSocket manager + routes (backend)

### 🚧 In Progress

- Projects & Tasks backend CRUD (frontend currently uses mock data)
- Notifications backend integration (currently client-side data)
- Activity / activity logs (UI exists, backend pending)

### 🔮 Planned Features

- Email verification & real password reset emails
- File uploads
- Real-time notifications via WebSockets
- Team collaboration features
- Docker deployment
- Kubernetes deployment
- CI/CD pipeline
- Unit & integration testing

---

## 🧭 Sprint Workflow

```
Planned
   ↓
Active
   ↓
Completed
   ↓
Closed
```

A sprint contains a specific group of tasks that the team plans to complete within a defined period.

Example:

Sprint 1 — Duration: 2 Weeks — Goal: Complete Authentication

Tasks:
- ✅ Login API
- ✅ Signup API
- ✅ Authentication UI
- ⬜ Email Verification
- ⬜ Forgot Password

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.