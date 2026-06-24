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
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(err);
  res.status(status).json({ message: err.message || "Server Error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on :${port}`));
