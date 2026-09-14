import mongoose from "mongoose";

// A single to-do item. Field names (todo, isCompleted) intentionally match the frontend store so Phase 3 can swap localStorage for the API with little reshaping.
const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    todo: { type: String, required: true, trim: true, maxlength: 200 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);