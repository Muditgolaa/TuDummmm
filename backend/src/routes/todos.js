import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Todo from "../models/Todo.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/todos — my todos, oldest first
router.get("/", async (req, res) => {
  const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json({ todos });
});

// POST /api/todos — create { todo }
router.post("/", async (req, res) => {
  try {
    const { todo } = req.body;
    if (typeof todo !== "string" || !todo.trim()) {
      return res.status(400).json({ error: "Todo text is required" });
    }
    const created = await Todo.create({ userId: req.userId, todo: todo.trim() });
    res.status(201).json({ todo: created });
  } catch (err) {
    console.error("Create todo error:", err.message);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PATCH /api/todos/:id — edit text and/or toggle completion
router.patch("/:id", async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.todo === "string" && req.body.todo.trim()) update.todo = req.body.todo.trim();
    if (typeof req.body.isCompleted === "boolean") update.isCompleted = req.body.isCompleted;
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ todo });
  } catch (err) {
    console.error("Update todo error:", err.message);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE /api/todos/:id
router.delete("/:id", async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json({ message: "Todo deleted" });
});

export default router;