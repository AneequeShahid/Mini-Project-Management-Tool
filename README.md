# 📊 Agile Project Management Tool

This is a full-stack Agile project management application designed to facilitate team collaboration, sprint planning, and task tracking. Featuring interactive drag-and-drop sprint boards, real-time burndown charts, and role-based access control, this tool streamlines the software development lifecycle for engineering teams.

---

## 🚀 Key Features

* **Interactive Kanban Board**: Built a drag-and-drop task board for visual task lifecycle management (To Do, In Progress, In Review, Done).
* **Automated Burndown Charts**: Displays real-time sprint velocity charts representing daily project progression and remaining tasks.
* **Role-Based Access Control (RBAC)**: Secure access management allowing managers to create sprints and assign tasks, while team members update task progress.
* **Decoupled Three-Tier Architecture**: Deployed the React frontend to **Vercel** and the Node.js/Express backend API to **Railway**, with database services hosted on **MongoDB Atlas**.
* **Secure Authentication**: Implemented stateless session management utilizing JSON Web Tokens (JWT) and bcrypt password hashing.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, TailwindCSS, HTML5/CSS3
* **Backend**: Node.js, Express.js (RESTful APIs)
* **Database**: MongoDB (Mongoose ORM)
* **Deployment**: Vercel (Client), Railway (Server), MongoDB Atlas (Database)
* **Security**: JSON Web Tokens (JWT), bcrypt

---

## 📂 Project Architecture

```
mini-project-management-tool/
├── client/           # React.js Frontend
│   ├── src/          # Source components, state management
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── server/           # Node.js / Express Backend API
│   ├── controllers/  # Route handlers (auth, tasks, sprints)
│   ├── models/       # Mongoose Schemas (User, Task, Sprint)
│   ├── routes/       # Express routes
│   └── package.json  # Backend dependencies
└── docs/             # Technical specifications & design diagrams
```

---

## 🔒 API Endpoints & Security

All user-facing endpoints (excluding auth routes) are protected via a custom JWT validation middleware.

### Authentication
* `POST /api/auth/register` — Register a new account.
* `POST /api/auth/login` — Login and receive a stateless JWT.

### Sprint & Task Operations
* `GET /api/sprints` — Fetch all sprints.
* `POST /api/sprints/create` — Create a new sprint (Manager only).
* `GET /api/tasks` — List tasks under the active sprint.
* `PUT /api/tasks/:id/update` — Drag-and-drop task status updates.

---

## ⚙️ Setup & Installation

### 1. Backend Server Setup
Navigate to the `server/` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:password@cluster.mongodb.net/project_mgmt
JWT_SECRET=your_jwt_signing_key
```
Start the local development server:
```bash
npm run dev
```

### 2. Client Setup
Navigate to the `client/` directory and install dependencies:
```bash
cd ../client
npm install
```
Create a `.env` file in the `client/` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
Start the React application:
```bash
npm start
```
The client dashboard will run locally at `http://localhost:3000`.

---

## 🎓 Academic Credit
Developed as a project for the Software Engineering course at **Beaconhouse National University (BNU)**.
