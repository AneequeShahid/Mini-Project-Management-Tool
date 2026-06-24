# Mini Project Management Tool 📋

> **A full-stack Agile project management web app** — sprint boards, burndown charts, backlog management, role-based access, and JWT authentication, built with React + Node.js + MongoDB.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-Dev%20Server-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Description

**Mini Project Management Tool** is a web application that gives software teams everything they need to run Agile sprints — from backlog grooming to task board updates and burndown tracking. It covers the 10 functional requirements of a lean project management system: user authentication, backlog management, sprint planning, story point assignment, a drag-and-drop task board, live status updates, burndown chart generation, role-based access control, bug flagging, and view-only mode.

The backend is a Node.js + Express REST API with JWT authentication and MongoDB persistence. The frontend is built with React (Vite), featuring a kanban-style Sprint Board component and a Burndown chart visualization.

**Who is it for?** Software engineering students learning full-stack development and Agile methodologies; small teams needing a lightweight self-hosted project tracker.

---

## 📑 Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Reference](#api-reference)
6. [Roles & Permissions](#roles--permissions)
7. [Contributing](#contributing)
8. [License & Contact](#license--contact)

---

## ✨ Features

- 🔐 **JWT Authentication** — secure login and session management
- 📝 **Backlog Management** — add, edit, delete, and prioritize user stories with story points
- 🏃 **Sprint Planning** — configure sprint start/end dates, assign stories to a sprint
- 📊 **Sprint Board** — kanban view with To-Do, In Progress, and Done columns
- 🔄 **Task Status Updates** — move tasks between columns
- 📉 **Burndown Chart** — daily remaining story points tracked and charted
- 👥 **Role-Based Access** — Admin, Team Member, and Viewer roles
- 🐛 **Bug Flagging** — mark tasks as bug reports within the data model
- 👁️ **View-Only Mode** — Viewer users can inspect board and burndown data without edit rights

---

## 🗂️ Project Structure

```
Mini-Project-Management-Tool/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SprintBoard.jsx    # Kanban board (To-Do / In Progress / Done)
│   │   │   └── Burndown.jsx       # Burndown chart component
│   │   ├── routes/
│   │   │   ├── SprintRoutes.jsx
│   │   │   └── TaskRoutes.jsx
│   │   ├── api.js                 # Axios API client
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Node.js + Express backend
│   └── src/
│       ├── index.js           # App entry point, MongoDB connection
│       ├── middleware/
│       │   └── auth.js        # JWT verification middleware
│       ├── models/
│       │   ├── project.js     # Project, Sprint, UserStory schemas
│       │   └── burndown.js    # Burndown data schema
│       ├── routes/            # REST API route handlers
│       └── utils/
│
├── docs/
│   ├── API-Notes.md           # Endpoint documentation
│   └── Getting-Started.md
└── README.md
```

---

## 🚀 Installation

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| MongoDB | ≥ 7.0 (local or Atlas) |
| npm | ≥ 9 |

### Backend

```bash
# 1. Clone the repository
git clone https://github.com/AneequeShahid/Mini-Project-Management-Tool.git
cd Mini-Project-Management-Tool

# 2. Install server dependencies
cd server
npm install

# 3. Set environment variables
# Create a .env file in /server:
echo "MONGODB_URI=mongodb://127.0.0.1:27017/mini_pmt" > .env
echo "JWT_SECRET=your-secret-key-here" >> .env
echo "PORT=5000" >> .env

# 4. Start the backend
node src/index.js
```

### Frontend

```bash
# In a separate terminal:
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💻 Usage

1. **Register / Login** — create an account and receive a JWT token
2. **Create a Project** — set up your project and invite team members
3. **Manage Backlog** — add user stories with story-point estimates
4. **Plan a Sprint** — select stories from the backlog and set sprint dates
5. **Update the Board** — move tasks from To-Do → In Progress → Done
6. **Track Progress** — view the burndown chart as story points are completed

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login, receive JWT |
| `GET` | `/api/sprints` | JWT | List all sprints |
| `POST` | `/api/sprints` | JWT (Admin) | Create a sprint |
| `PATCH` | `/api/tasks/:id/status` | JWT | Update task status |
| `GET` | `/api/burndown/:sprintId` | JWT | Get burndown data |

Full endpoint documentation in [`docs/API-Notes.md`](docs/API-Notes.md).

---

## 👥 Roles & Permissions

| Action | Admin | Team Member | Viewer |
|--------|-------|------------|--------|
| View board & burndown | ✅ | ✅ | ✅ |
| Update task status | ✅ | ✅ | ❌ |
| Manage backlog | ✅ | ✅ | ❌ |
| Create/delete sprints | ✅ | ❌ | ❌ |
| Manage team members | ✅ | ❌ | ❌ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: describe your change"`
4. Push and open a Pull Request targeting `main`

---

## 📄 License & Contact

MIT License — see [LICENSE](LICENSE) for details.

**Aneeque Shahid** · [@AneequeShahid](https://github.com/AneequeShahid) · aneequeshahid495@gmail.com