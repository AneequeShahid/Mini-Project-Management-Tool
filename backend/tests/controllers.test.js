import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./helpers/db.js";
import { User } from "../src/models/user.js";
import { Project } from "../src/models/project.js";
import { Task } from "../src/models/task.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

let adminToken;

beforeAll(async () => {
  await setupTestDB();
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: passwordHash,
    role: "Admin",
    workspace: new mongoose.Types.ObjectId(),
  });
  
  const res = await request(app).post("/api/auth/login").send({ email: admin.email, password: "password123" });
  adminToken = res.body.token;
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: passwordHash,
    role: "Admin",
    workspace: new mongoose.Types.ObjectId(),
  });
  const res = await request(app).post("/api/auth/login").send({ email: admin.email, password: "password123" });
  adminToken = res.body.token;
});

describe("Full System Integration Tests", () => {
  describe("Auth & Users", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should login successfully", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@example.com",
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe("Project & Permissions", () => {
    it("should create a project and set owner", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Integration Project",
          description: "Testing the system",
          workspace: new mongoose.Types.ObjectId(),
        });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Integration Project");
      
      // Verify owner role
      const proj = await Project.findById(res.body._id);
      expect(proj.roles.some(r => r.role === "Owner")).toBe(true);
    });
  });

  describe("Task & Sprint Workflow", () => {
    it("should create a task and assign it to a sprint", async () => {
      // Setup: Project and Sprint
      const proj = await Project.create({
        name: "Sprint Project",
        organization: new mongoose.Types.ObjectId(),
        workspace: new mongoose.Types.ObjectId(),
        owner: new mongoose.Types.ObjectId(),
        members: [],
      });
      const sprint = await mongoose.model("Sprint").create({
        project: proj._id,
        name: "S1",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 14),
      });

      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Task",
          project: proj._id,
          sprint: sprint._id,
          priority: "High",
          storyPoints: 5,
        });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Test Task");
    });
  });

  describe("AI Features", () => {
    it("should return fallback response for project generation", async () => {
      const res = await request(app)
        .post("/api/ai/generate-project")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ description: "Build a tool" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("project");
    });

    it("should handle code review fallback", async () => {
      const res = await request(app)
        .post("/api/ai/code-review")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ code: "console.log('hi')" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("summary");
    });
  });
});
