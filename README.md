# 🚀 Project Management SaaS

A modern **Project Management SaaS** built with **FastAPI**, **PostgreSQL**, and **React**. This application provides secure authentication and enables users to manage projects and tasks efficiently through RESTful APIs.

---

## 📖 Overview

This project is designed to help individuals and teams organize their work by creating projects, managing tasks, and tracking progress. It follows a scalable architecture with a FastAPI backend and a React frontend.

---

## ✨ Features

- 🔐 JWT Authentication (Access & Refresh Tokens)
- 👤 User Registration & Login
- 📁 Project Management
- ✅ Task Management
- 🔄 Full CRUD Operations
- 🗄️ PostgreSQL Database Integration
- ⚡ FastAPI REST APIs
- ✔️ Pydantic Data Validation
- 🛡️ Protected Routes
- 📄 Interactive API Documentation (Swagger & ReDoc)
- 🏗️ Scalable Project Structure

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication
- Alembic

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios

### Database
- PostgreSQL

---

## 📂 Project Structure

```text
app/
│
├── auth/              # Authentication logic
├── crud/              # CRUD operations
├── database.py        # Database configuration
├── models.py          # SQLAlchemy models
├── schemas.py         # Pydantic schemas
├── routers/           # API routes
├── services/          # Business logic
├── utils/             # Helper functions
├── config.py          # Environment settings
└── main.py            # FastAPI entry point
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/project-management-saas.git
```

### 2. Navigate to the project

```bash
cd project-management-saas
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

### 4. Activate the virtual environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root and add:

```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost/database_name

SECRET_KEY=your_secret_key

REFRESH_SECRET_KEY=your_refresh_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## ▶️ Run the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```
http://localhost:8000
```

---

## 📚 API Documentation

After running the server:

**Swagger UI**

```
http://localhost:8000/docs
```

**ReDoc**

```
http://localhost:8000/redoc
```

---

## 📌 Current Status

### ✅ Completed

- User Authentication
- JWT Access & Refresh Tokens
- PostgreSQL Integration
- CRUD API Design
- Frontend–Backend Integration
- Login & Registration
- Protected Routes

### 🚧 In Progress

- Project CRUD
- Task CRUD
- Role-Based Authorization
- Dashboard
- Activity Logs

### 🔮 Planned Features

- Email Verification
- Password Reset
- File Uploads
- Notifications
- Team Collaboration
- Docker Deployment
- Kubernetes Deployment
- CI/CD Pipeline
- Unit & Integration Testing

---

Sprint Workflow
Planned
   ↓
Active
   ↓
Completed

A sprint contains a specific group of tasks that the team plans to complete within a defined period.

Example:

Sprint 1
Duration: 2 Weeks
Goal: Complete Authentication

Tasks:
✓ Login API
✓ Signup API
✓ Authentication UI
○ Email Verification
○ Forgot Password
🛠️ Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
Lucide React
Shadcn/UI
Backend
Python
FastAPI
SQLAlchemy
PostgreSQL
Pydantic
Development Tools
Git
GitHub
VS Code
Postman

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.






