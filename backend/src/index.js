import "dotenv/config";        // loads variables from .env into process.env
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { writeLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import questionRoutes from "./routes/questions.js";
import analyticsRoutes from "./routes/analytics.js";
import habitRoutes from "./routes/habits.js";
import logRoutes from "./routes/logs.js";
import todoRoutes from "./routes/todos.js";

// Refuse to start if a critical secret is missing (fail loud, not silent).
for (const key of ["MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY", "CLIENT_URL"]) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key} — set it before starting.`);
    process.exit(1);
  }
}

const app = express();

// --- Security & parsing middleware (runs on every request) ---
// helmet sets sensible security headers. crossOriginResourcePolicy is relaxed to "cross-origin" because the frontend is served from a different origin (:5173).
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL })); // only our React app may call us
app.use(express.json({ limit: "16kb" }));          // parse JSON + cap body size

// simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TuDummmm backend is running 🚀" });
});

// Tracker routes (write-rate-limited; GETs are exempt inside the limiter)
app.use("/api/habits", writeLimiter, habitRoutes);
app.use("/api/logs", writeLimiter, logRoutes);
app.use("/api/todos", writeLimiter, todoRoutes);

// Auth + interview routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Central error handler (Express 5 auto-forwards async errors here)
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID" });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

// Start the server
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});