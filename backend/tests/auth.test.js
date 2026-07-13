import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("Auth Routes", () => {
  it("POST /api/auth/register - missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Missing required fields");
  });

  it("POST /api/auth/register - invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email: "bad", password: "pass123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Invalid email format");
  });

  it("POST /api/auth/login - missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Missing required fields");
  });

  it("GET /health - returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/auth/profile - without token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("protected route - invalid token", async () => {
    const res = await request(app).get("/api/users").set("Authorization", "Bearer badtoken");
    expect(res.status).toBe(401);
  });
});
