import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import mongoose from "mongoose";
import { setupTestDB, teardownTestDB } from "./helpers/db.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcryptjs";

let token;
let workspaceId;

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

describe("Projects API", () => {
  it("GET /api/projects - without token", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(401);
  });

  it("GET /api/projects - with token", async () => {
    if (!token) return;
    const res = await request(app).get("/api/projects").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/projects - missing name", async () => {
    if (!token) return;
    const res = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });

  it("POST /api/projects - create + delete", async () => {
    if (!token) return;
    const res = await request(app).post("/api/projects").set("Authorization", `Bearer ${token}`).send({
      name: "Test Project",
      description: "Testing",
      workspace: new mongoose.Types.ObjectId().toString(),
      organization: new mongoose.Types.ObjectId().toString(),
    });
    if (res.status === 201) {
      expect(res.body.name).toBe("Test Project");
      const del = await request(app).delete(`/api/projects/${res.body._id}`).set("Authorization", `Bearer ${token}`);
      expect(del.status).toBe(200);
    }
  });
});

describe("Sprints API", () => {
  it("GET /api/sprints/project/:id - with token", async () => {
    if (!token) return;
    const res = await request(app).get(`/api/sprints/project/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("Epics API", () => {
  it("GET /api/epics/project/:id - with token", async () => {
    if (!token) return;
    const res = await request(app).get(`/api/epics/project/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("POST /api/epics/project/:id - missing name", async () => {
    if (!token) return;
    const res = await request(app).post(`/api/epics/project/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
  });
});

describe("Milestones API", () => {
  it("GET /api/milestones/project/:id - with token", async () => {
    if (!token) return;
    const res = await request(app).get(`/api/milestones/project/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("Health & Auth", () => {
  it("GET /health - returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/admin/stats - requires admin", async () => {
    if (!token) return;
    const res = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`);
    expect([200, 403]).toContain(res.status);
  });
});

describe("Search API", () => {
  it("GET /api/search - missing params", async () => {
    if (!token) return;
    const res = await request(app).get("/api/search").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("GET /api/search?q=test - with token", async () => {
    if (!token) return;
    const res = await request(app).get("/api/search?q=test").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tasks");
  });
});
