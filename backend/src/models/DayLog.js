import mongoose from "mongoose";

// One day of activity for one user: which habits were done, focus minutes, a note. (userId + date) is unique so we can upsert "today" without creating duplicates.
const dayLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Calendar day as "YYYY-MM-DD" (matches the frontend's ymd()). A string avoids the timezone drift you'd get from storing a Date pinned to midnight.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    // Habits completed this day. An array of Habit ids = normalized, and trivial to turn back into the UI's { [habitId]: true } shape.
    completedHabits: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Habit" },
    ],
    minutes: { type: Number, default: 0, min: 0, max: 1440 }, // max 1 day
    note: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// One log per user per day. Also powers fast upserts keyed on { userId, date }.
dayLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DayLog", dayLogSchema);