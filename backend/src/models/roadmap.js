import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roadmapSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true },
    description: { type: String },
    timeframe: { type: String, enum: ["quarterly", "half-yearly", "yearly", "custom"], default: "quarterly" },
    startDate: { type: Date },
    endDate: { type: Date },
    milestones: [{
      title: { type: String },
      description: { type: String },
      date: { type: Date },
      status: { type: String, enum: ["planned", "in-progress", "completed", "delayed"], default: "planned" },
      linkedMilestone: { type: Schema.Types.ObjectId, ref: "Milestone" },
    }],
    items: [{
      title: { type: String },
      description: { type: String },
      quarter: { type: String },
      priority: { type: String, enum: ["P0", "P1", "P2", "P3"], default: "P2" },
      status: { type: String, enum: ["planned", "in-progress", "completed", "cancelled"], default: "planned" },
      linkedEpic: { type: Schema.Types.ObjectId, ref: "Epic" },
      linkedProject: { type: Schema.Types.ObjectId, ref: "Project" },
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Roadmap = model("Roadmap", roadmapSchema);
