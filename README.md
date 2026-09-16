# Smart University Management & Student Portal

A comprehensive full-stack university management and student portal system built with Next.js, React, TypeScript, Tailwind CSS, Express.js, and Node.js.

## Architecture

```
smart-university-management-and-student-portal/
├── frontend/             # Next.js 15+ with TypeScript & Tailwind CSS
│   ├── public/           # Static assets & icons
│   └── src/
│       ├── app/          # App Router pages and layout
│       ├── components/   # Reusable UI, Layout, and Section components
│       ├── data/         # Typed mock datasets (Programs, Departments, Faculty, etc.)
│       └── types/        # TypeScript interfaces and types
└── backend/              # Express.js REST API with TypeScript
    └── src/
        ├── config/       # Environment & server configuration
        ├── controllers/  # Route controller logic
        ├── middleware/   # Centralized error handler, 404, CORS
        ├── models/       # Database schemas (Phase 2)
        ├── routes/       # API endpoints (/api/health, etc.)
        ├── services/     # Business logic layer
        └── utils/        # Standard response & utility helpers
```

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

---

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`. Test the health check at `http://localhost:5000/api/health`.

---

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```
   The frontend application will run at `http://localhost:3000`.

---

## Project Implementation & Features

This project is **fully implemented and production-ready** across both backend and frontend.

### 1. Public Portal
- Modern university landing page with responsive Hero, About, Degree Programs, Departments, Faculty directory, Announcements, and Campus Events.
- Contact Us form (`/contact`) saving inquiries to backend.
- Role-based Authentication (`/login`) & Student Self-Registration (`/register`).

### 2. Admin Portal (`/dashboard/admin`)
- **Dashboard Overview**: Key metrics (total students, faculty, courses, pending fees, quick actions).
- **Departments & Semesters**: Full CRUD for academic departments and semesters.
- **Course Management**: Course creation, credit hours, teacher assignments.
- **User Management**: Student admission, teacher registration, and profile management.
- **Academic Controls**: Campus-wide attendance monitoring, assignment overview, university grade sheets & GPA calculation.
- **Financials**: Student fee challan generation, overdue tracking, and status updates.
- **Communications & Logs**: University notice board, contact message inbox, system audit logs, and analytics reports.

### 3. Teacher Portal (`/dashboard/teacher`)
- **Course Management**: Assigned courses, syllabus, enrolled student lists.
- **Attendance**: Daily attendance marker (Present/Absent/Late) with duplicate prevention and attendance history.
- **Assignments**: Create assignments, set due dates & marks, review and grade student submissions.
- **Grading & Results**: Enter midterm, final, and quiz marks with auto GPA/grade generation.
- **Announcements**: Post notices directly to enrolled classes.

### 4. Student Portal (`/dashboard/student`)
- **Student Dashboard**: Live CGPA, overall attendance %, fee alert, enrolled course list.
- **Courses & Schedule**: Enrolled subjects, instructors, and credit hours.
- **Attendance Tracker**: Subject-wise percentage with automatic warnings if below 75%.
- **Assignments**: View pending tasks, upload files, and view teacher feedback & marks.
- **Results & Transcripts**: Semester-wise marks breakdown, GPA/CGPA calculations, and downloadable PDF grade cards.
- **Fee Management**: View fee challan status and download official PDF fee slips.
- **Profile & Settings**: View and update academic and personal details.

---

## Default Seed Credentials

After running `npm run seed` in the `backend/` directory, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@apex.edu` | `Admin@123456` |
| **Teacher** | `teacher@apex.edu` | `Teacher@123456` |
| **Student** | `student@apex.edu` | `Student@123456` |
