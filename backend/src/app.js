import express from "express";
import cors from "cors";
import helmet from "helmet";
import { writeLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import questionRoutes from "./routes/questions.js";
import analyticsRoutes from "./routes/analytics.js";
import habitRoutes from "./routes/habits.js";
import logRoutes from "./routes/logs.js";
import todoRoutes from "./routes/todos.js";

// The Express app (middleware + routes), separate from server startup so tests
// can import `app` and drive it with Supertest without opening a port.
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TuDummmm backend is running 🚀" });
});

app.use("/api/habits", writeLimiter, habitRoutes);
app.use("/api/logs", writeLimiter, logRoutes);
app.use("/api/todos", writeLimiter, todoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID" });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Request body too large" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

export default app;