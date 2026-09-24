import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

// Refuse to start if a critical secret is missing (fail loud, not silent).
for (const key of ["MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY", "CLIENT_URL"]) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key} — set it before starting.`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});