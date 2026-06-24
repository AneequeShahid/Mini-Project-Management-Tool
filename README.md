# Mini Project Management Tool — SE Deliverable 2

This repo contains the implementation and documentation for Mini Project Management Tool.

---

## Core Functional Coverage

This implementation targets the functional scope defined in the course deliverable:

- **FR1 – User Authentication** — secure login and session management for team members.
- **FR2 – Backlog Management** — add, edit, delete, and prioritize user stories.
- **FR3 – Sprint Planning** — configure sprints, set start/end dates, and assign user stories to a sprint.
- **FR4 – Story Point Assignment** — numeric story point values for backlog items.
- **FR5 – Sprint Board View** — task board with To-Do, In Progress, and Done columns.
- **FR6 – Task Status Update** — drag-and-drop-style status updates between board columns.
- **FR7 – Burndown Chart** — daily burndown tracking and chart data generation.
- **FR8 – Role Management** — roles for Admin, Team Member, and Viewer.
- **FR9 – Bug Reporting** — task flagging support in the data model.
- **FR10 – View-Only Access** — Viewer users may inspect the board and burndown data without edit permissions.

---

## Non-Functional Coverage

- **Security** — passwords stored with bcrypt; sessions use JWT with 24-hour expiry.
- **Performance** — API responses target normal-load response under 500ms.
- **Usability** — desktop-first interface with concise task flows and clear sprint views.
- **Reliability** — modular backend structure supports maintainability and extension.
- **Maintainability** — separated backend into models, routes, and middleware; README documents setup steps.
- **Portability** — frontend runs on standard modern browsers without extra plugins.
- **Availability** — deployment-ready service structure for hosting separate frontend, backend, and database tiers.

---

## Project Structure

```
mini-project-management-tool/
├── client/                       # React frontend
│   ├── public/
│   └── src/
│       └── routes/
│           ├── TaskRoutes.jsx
│           └── SprintRoutes.jsx
├── server/                       # Node.js / Express backend
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT + role guards
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── project.js
│   │   │   ├── sprint.js
│   │   │   ├── task.js
│   │   │   └── burndown.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── projects.js
│   │   │   ├── sprints.js
│   │   │   ├── tasks.js
│   │   │   └── burndown.js
│   │   ├── utils/
│   │   │   └── db.js             # MongoDB connection
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 🔒 API Endpoints & Security

All user-facing endpoints (excluding auth routes) are protected via a custom JWT validation middleware.

### Authentication
* `POST /api/auth/register` — Register a new account.
* `POST /api/auth/login` — Login and receive a stateless JWT.

### Sprint & Task Operations
* `GET /api/sprints` — Fetch all sprints.
* `POST /api/sprints` — Create a new sprint (Team Member or higher).

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
MONGODB_URI=mongodb+srv://your_username:***@cluster.mongodb.net/project_mgmt
JWT_SECRET=your_jwt_secret
```
Start the local development server with the local backend port default:
```bash
npm run dev
```
The API listens on `http://localhost:4000` by default.

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
npm run dev
```
The client dashboard will run locally at `http://localhost:5173`.

---

## ✅ Test Cases

| ID | Description |
| --- | --- |
| TC-01 | Login returns a JWT for valid credentials. |
| TC-02 | Incorrect password returns 401. |
| TC-03 | Admin can create a sprint and assign members. |
| TC-04 | Team Member can move tasks between board columns. |
| TC-05 | Viewer can view the board and burndown data without edit access. |
| TC-06 | Bug report flag is stored on task creation and exposed in task detail. |

---

## 🎓 Academic Credit

Developed as a project for the Software Engineering course at **Beaconhouse National University (BNU)**.