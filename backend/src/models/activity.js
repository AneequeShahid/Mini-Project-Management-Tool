import mongoose from "mongoose";

const { Schema, model } = mongoose;

const activitySchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { 
      type: String, 
      required: true 
    },
    entityType: { type: String, enum: ["task", "sprint", "project", "comment"] },
    entityId: { type: Schema.Types.ObjectId },
    issueId: { type: Schema.Types.ObjectId, ref: "Task", index: true },
    details: { type: Schema.Types.Mixed },
    field: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    meta: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

activitySchema.index({ project: 1, createdAt: -1 });

export const Activity = model("Activity", activitySchema);
