import mongoose from "mongoose";

const { Schema, model } = mongoose;

const epicSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Backlog", "In Progress", "Done"],
      default: "Backlog",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

epicSchema.index({ project: 1 });
export const Epic = model("Epic", epicSchema);
