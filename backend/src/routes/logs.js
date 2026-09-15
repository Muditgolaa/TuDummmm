import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Habit from "../models/Habit.js";
import DayLog from "../models/DayLog.js";

const router = express.Router();
router.use(requireAuth);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Regex only checks shape; this also rejects impossible dates like 2026-13-99.
function isValidYmd(s) {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// GET /api/logs — every day log I have (the UI turns this into a date→log map)
router.get("/", async (req, res) => {
  const logs = await DayLog.find({ userId: req.userId }).sort({ date: 1 });
  res.json({ logs });
});
    
// PUT /api/logs/:date — upsert one day. Body may include any of: completedHabits: string[]  (full list of habit ids done that day) minutes: number            (absolute focus minutes, not a delta) note: string
router.put("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    if (!isValidYmd(date)) {
      return res.status(400).json({ error: "Date must be a real YYYY-MM-DD" });
    }

    const set = {};

    if (req.body.completedHabits !== undefined) {
      if (!Array.isArray(req.body.completedHabits)) {
        return res.status(400).json({ error: "completedHabits must be an array" });
      }
      // Only accept ids that are genuinely this user's habits (no foreign/dangling ids).
      const mine = await Habit.find({ userId: req.userId }).select("_id");
      const valid = new Set(mine.map((h) => h._id.toString()));
      set.completedHabits = req.body.completedHabits.filter((id) => valid.has(String(id)));
    }

    if (req.body.minutes !== undefined) {
      const m = Number(req.body.minutes);
      if (!Number.isFinite(m) || m < 0 || m > 1440) {
        return res.status(400).json({ error: "minutes must be 0–1440" });
      }
      set.minutes = Math.round(m);
    }

    if (req.body.note !== undefined) {
      if (typeof req.body.note !== "string") {
        return res.status(400).json({ error: "note must be a string" });
      }
      set.note = req.body.note.slice(0, 500);
    }

    if (!Object.keys(set).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    // Upsert keyed on (userId, date) — the unique index makes this a true upsert.
    const log = await DayLog.findOneAndUpdate(
      { userId: req.userId, date },
      { $set: set, $setOnInsert: { userId: req.userId, date } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ log });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
    console.error("Upsert log error:", err.message);
    res.status(500).json({ error: "Failed to save day log" });
  }
});

export default router;