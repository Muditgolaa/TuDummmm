import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Habit from "../models/Habit.js";
import DayLog from "../models/DayLog.js";

const router = express.Router();
router.use(requireAuth);

// Same palette the UI uses, so auto-assigned colours match the design system.
const COLORS = ["#f6a13d","#37d29a","#5aa2f6","#c98bff","#f97316","#e05a8a","#4bd0d0","#f2c94c"];

// GET /api/habits — my habits, oldest first (stable display order)
router.get("/", async (req, res) => {
  const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json({ habits });
});

// POST /api/habits — create { name, color? }
router.post("/", async (req, res) => {
  try {
    const { name, color } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Habit name is required" });
    }
    // No colour sent? Pick the first palette colour this user isn't using yet.
    let chosen = typeof color === "string" && color.trim() ? color.trim() : null;
    if (!chosen) {
      const mine = await Habit.find({ userId: req.userId }).select("color");
      const used = mine.map((h) => h.color);
      chosen = COLORS.find((c) => !used.includes(c)) || COLORS[mine.length % COLORS.length];
    }
    const habit = await Habit.create({ userId: req.userId, name: name.trim(), color: chosen });
    res.status(201).json({ habit });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
    console.error("Update habit error:", err.message);
    res.status(500).json({ error: "Failed to update habit" });
  }
});


// PATCH /api/habits/:id — edit name and/or colour in place
router.patch("/:id", async (req, res) => {
  try {
    const { name, color } = req.body;
    const update = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof color === "string" && color.trim()) update.color = color.trim();
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // ownership check is part of the query
      update,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json({ habit });
    } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
    console.error("Update habit error:", err.message);
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// DELETE /api/habits/:id — delete the habit AND scrub its id from every day log
router.delete("/:id", async (req, res) => {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!habit) return res.status(404).json({ error: "Habit not found" });
  // Referential integrity: no day log should reference a habit that no longer exists.
  await DayLog.updateMany(
    { userId: req.userId },
    { $pull: { completedHabits: habit._id } }
  );
  res.json({ message: "Habit deleted" });
});

export default router;