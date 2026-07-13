import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  billable: { type: Boolean, default: false },
}, { timestamps: true });

export const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);
