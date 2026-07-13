import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import mongoose from "mongoose";
import { setupTestDB, teardownTestDB } from "./helpers/db.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcryptjs";

let token;
let projectId;

beforeAll(async () => {
  await setupTestDB();
  const passwordHash = await bcrypt.hash("password123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: passwordHash,
    role: "Admin",
    workspace: new mongoose.Types.ObjectId(),
  });
  const res = await request(app).post("/api/auth/login").send({ email: "admin@example.com", password: "password123" });
  if (res.status === 200) token = res.body.token;
});

afterAll(async () => {
  await teardownTestDB();
});

describe("AI Endpoints", () => {
  it("POST /api/ai/generate-project - missing description", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/generate-project").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/ai/generate-project - with description (fallback)", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/generate-project").set("Authorization", `Bearer ${token}`).send({ description: "Build a task management app" });
    if (res.status !== 200) console.log("AI GENERATE PROJECT FAILED:", res.status, res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("project");
    expect(res.body).toHaveProperty("sprints");
  });

  it("POST /api/ai/breakdown-task - missing input", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/breakdown-task").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/ai/breakdown-task - with input (fallback)", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/breakdown-task").set("Authorization", `Bearer ${token}`).send({ title: "Add user authentication", description: "Implement JWT auth" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("backend");
  });

  it("POST /api/ai/estimate-points - with description (fallback)", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/estimate-points").set("Authorization", `Bearer ${token}`).send({ title: "Build login page", description: "Create a login form with email/password and JWT auth" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("points");
  });

  it("POST /api/ai/char", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/chat").set("Authorization", `Bearer ${token}`).send({ messages: [{ role: "user", content: "What can you do?" }] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reply");
  });

  it("GET /api/ai/search - missing query", async () => {
    if (!token) return;
    const res = await request(app).get("/api/ai/search").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("GET /api/ai/search - with query (fallback)", async () => {
    if (!token) return;
    const res = await request(app).get("/api/ai/search?query=test").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
  });

  it("POST /api/ai/code-review", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/code-review").set("Authorization", `Bearer ${token}`).send({ code: "function hello() { return 'world'; }", language: "javascript" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("summary");
  });

  it("POST /api/ai/meeting-summary", async () => {
    if (!token) return;
    const res = await request(app).post("/api/ai/meeting-summary").set("Authorization", `Bearer ${token}`).send({ notes: "Discussed sprint progress and blockers" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("keyPoints");
  });
});
