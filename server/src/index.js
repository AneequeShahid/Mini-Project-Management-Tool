import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import projectRoutes from "./routes/projects.js";
import sprintRoutes from "./routes/sprints.js";
import taskRoutes from "./routes/tasks.js";
import burndownRoutes from "./routes/burndown.js";
import { connectDB } from "./utils/db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/burndown", burndownRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

async function start() {
  await connectDB(process.env.MONGODB_URI);
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API running on :${port}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
