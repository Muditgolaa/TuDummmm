import mongoose from "mongoose";

// One habit a user is trying to keep (e.g. "DSA practice").
// Normalized: habits live in their own collection, not inside a JSON blob.
const habitSchema = new mongoose.Schema(
  {
    // Owner. Indexed because every query is scoped to the logged-in user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    color: { type: String, required: true, trim: true }, // hex the UI paints with
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);