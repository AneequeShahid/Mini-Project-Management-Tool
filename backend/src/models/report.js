import mongoose from "mongoose";

const { Schema, model } = mongoose;

const reportSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true },
    type: { type: String, enum: ["sprint", "project", "team", "time", "custom"], required: true },
    config: {
      metrics: [String],
      dateRange: {
        start: Date,
        end: Date,
      },
      groupBy: { type: String },
      filters: { type: Schema.Types.Mixed },
    },
    format: { type: String, enum: ["pdf", "csv", "xlsx", "json"], default: "csv" },
    status: { type: String, enum: ["generating", "ready", "failed"], default: "generating" },
    url: { type: String },
    size: { type: Number },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduled: {
      enabled: { type: Boolean, default: false },
      cron: { type: String },
      recipients: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Report = model("Report", reportSchema);
