import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sprintSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    goal: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Planned", "Active", "Completed"], default: "Planned" },
  },
  { timestamps: true }
);

export const Sprint = model("Sprint", sprintSchema);
