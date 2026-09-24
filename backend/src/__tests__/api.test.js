import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const { default: app } = await import("../app.js");

let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 60000);
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

async function registerUser(email) {
  const res = await request(app).post("/api/auth/register").send({ name: "T", email, password: "secret123" });
  return res.body;
}

describe("auth", () => {
  it("registers and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Alice", email: "alice@test.com", password: "secret123" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });
  it("rejects a short password", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Bob", email: "bob@test.com", password: "123" });
    expect(res.status).toBe(400);
  });
  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send({ name: "C", email: "dup@test.com", password: "secret123" });
    const res = await request(app).post("/api/auth/register").send({ name: "C", email: "dup@test.com", password: "secret123" });
    expect(res.status).toBe(409);
  });
  it("logs in correctly and rejects wrong credentials", async () => {
    await request(app).post("/api/auth/register").send({ name: "D", email: "d@test.com", password: "secret123" });
    expect((await request(app).post("/api/auth/login").send({ email: "d@test.com", password: "secret123" })).status).toBe(200);
    expect((await request(app).post("/api/auth/login").send({ email: "d@test.com", password: "wrong" })).status).toBe(401);
  });
});

describe("auth guard", () => {
  it("blocks unauthenticated tracker access", async () => {
    expect((await request(app).get("/api/habits")).status).toBe(401);
  });
});

describe("ownership (no IDOR)", () => {
  it("user B cannot modify user A's habit", async () => {
    const a = await registerUser("owner-a@test.com");
    const b = await registerUser("owner-b@test.com");
    const created = await request(app).post("/api/habits").set("Authorization", `Bearer ${a.token}`).send({ name: "DSA" });
    expect(created.status).toBe(201);
    const habitId = created.body.habit._id;
    expect((await request(app).patch(`/api/habits/${habitId}`).set("Authorization", `Bearer ${b.token}`).send({ name: "HACKED" })).status).toBe(404);
    const ok = await request(app).patch(`/api/habits/${habitId}`).set("Authorization", `Bearer ${a.token}`).send({ name: "DSA v2" });
    expect(ok.status).toBe(200);
    expect(ok.body.habit.name).toBe("DSA v2");
  });
  it("validates input and rejects malformed ids", async () => {
    const a = await registerUser("val@test.com");
    const auth = `Bearer ${a.token}`;
    expect((await request(app).post("/api/habits").set("Authorization", auth).send({ name: "  " })).status).toBe(400);
    expect((await request(app).patch("/api/habits/not-an-id").set("Authorization", auth).send({ name: "x" })).status).toBe(400);
  });
});