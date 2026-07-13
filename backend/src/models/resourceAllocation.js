import mongoose from "mongoose";

const { Schema, model } = mongoose;

const resourceAllocationSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    allocation: { type: Number, min: 0, max: 100, default: 100 },
    startDate: { type: Date },
    endDate: { type: Date },
    role: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

resourceAllocationSchema.index({ workspace: 1, user: 1 });
resourceAllocationSchema.index({ project: 1 });

export const ResourceAllocation = model("ResourceAllocation", resourceAllocationSchema);
