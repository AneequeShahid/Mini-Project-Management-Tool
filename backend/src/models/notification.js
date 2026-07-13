import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: {
      type: String,
      enum: ["task_assigned", "sprint_started", "sprint_completed", "mention", "due_date", "status_changed", "comment", "assigned", "blocked"],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String },
    read: { type: Boolean, default: false },
    fromUser: { type: Schema.Types.ObjectId, ref: "User" },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    issueId: { type: Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
