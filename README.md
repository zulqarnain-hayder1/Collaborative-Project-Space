# Collaborative Project Space

A complete full-stack collaborative project management web application for intern teams, built with React + Vite, Express, MongoDB, and Socket.IO.

## Features

- JWT-based registration and login
- Project creation and team member collaboration
- Kanban board with drag-and-drop columns:
  - To Do
  - In Progress
  - Review
  - Completed
- Real-time task synchronization with WebSockets
- Task creation, assignment, editing, deletion, and movement
- Milestone progress tracking with progress bars
- Dashboard with projects, active tasks, deadlines, and progress
- Task search and member-based filtering
- Live collaboration indicators and real-time notifications

## Tech Stack

- Frontend: React (Vite), React Router, Axios, Tailwind CSS, Socket.IO Client, @hello-pangea/dnd
- Backend: Node.js, Express.js, MongoDB + Mongoose, Socket.IO, JWT

## Project Structure

```text
collaborative-project-space/
  frontend/
    src/
      components/
        Navbar.jsx
        ProjectBoard.jsx
        TaskCard.jsx
        KanbanColumn.jsx
        MilestoneTracker.jsx
      pages/
        Dashboard.jsx
        ProjectDetails.jsx
        CreateProject.jsx
        Login.jsx
        Register.jsx
      services/
        api.js
        socket.js
      context/
        AuthContext.jsx
      App.jsx
      main.jsx
  backend/
    models/
      User.js
      Project.js
      Task.js
    routes/
      authRoutes.js
      projectRoutes.js
      taskRoutes.js
    controllers/
      authController.js
      projectController.js
      taskController.js
    socket/
      socketHandler.js
    middleware/
      authMiddleware.js
    config/
      db.js
    server.js
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Projects

- `POST /api/projects` Create project
- `GET /api/projects` Get projects for current user
- `GET /api/projects/:id` Get project details and tasks
- `PUT /api/projects/:id/join` Join project
- `PUT /api/projects/:id/milestones` Update milestones (admin)

### Tasks

- `POST /api/tasks` Create task
- `GET /api/tasks/:projectId` Get project tasks
- `PUT /api/tasks/:id` Update task
- `DELETE /api/tasks/:id` Delete task

## Socket Events

- `join-project`
- `task-created`
- `task-updated`
- `task-moved`
- `task-deleted`
- `collaboration-users`

## Environment Setup

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and set:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env` and set:

- `VITE_API_URL`
- `VITE_SOCKET_URL`

## Local Run Instructions

From `collaborative-project-space/`:

```bash
npm install
npm run install:all
npm run dev
```

Or run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Database Schemas

### User

- `name`
- `email`
- `password`
- `projects` (array of project IDs)

### Project

- `name`
- `description`
- `members`
- `milestones`
- `createdAt`

### Task

- `title`
- `description`
- `assignedTo`
- `status`
- `deadline`
- `priority`
- `projectId`

## Notes

- Milestones can be created at project setup and updated by project creator.
- Real-time task updates are broadcast to all users in the same project room.
- Drag-and-drop movement updates task status and notifies collaborators instantly.
# Collaborative-Project-Space
