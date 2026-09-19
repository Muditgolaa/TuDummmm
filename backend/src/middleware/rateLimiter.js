import rateLimit from "express-rate-limit";

// Caps AI calls so one user can't drain the Groq free tier.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                  // 20 AI calls per hour per IP
  message: { error: "Too many AI requests — please try again later." },
});

// Caps tracker writes (habits/logs/todos) so the API can't be hammered.
// GET is exempt so the dashboard can always load its data freely.
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // generous for real use, blocks abuse/loops
  skip: (req) => req.method === "GET",
  message: { error: "Too many requests — please slow down a moment." },
});