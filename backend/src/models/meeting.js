import mongoose from "mongoose";

const { Schema, model } = mongoose;

const meetingSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    title: { type: String, required: true },
    description: { type: String },
    provider: { type: String, enum: ["jitsi", "zoom", "google-meet"], default: "jitsi" },
    joinUrl: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number },
    status: { type: String, enum: ["scheduled", "live", "ended", "cancelled"], default: "scheduled" },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    notes: { type: String },
    aiSummary: {
      summary: { type: String },
      keyPoints: [String],
      decisions: [String],
      actionItems: [{ owner: String, task: String, dueDate: Date }],
      generatedAt: { type: Date },
    },
    recording: { type: String },
    transcript: { type: String },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ["daily", "weekly", "biweekly", "monthly"] },
      endDate: { type: Date },
    },
  },
  { timestamps: true }
);

meetingSchema.index({ workspace: 1, startTime: -1 });
meetingSchema.index({ project: 1 });
meetingSchema.index({ host: 1 });

export const Meeting = model("Meeting", meetingSchema);
