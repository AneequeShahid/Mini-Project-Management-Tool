import mongoose, { Schema, Document } from "mongoose";

export interface ISprint extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: "Planned" | "Active" | "Completed";
  velocity: number;
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    goal: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Planned", "Active", "Completed"], default: "Planned" },
    velocity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Sprint = mongoose.model<ISprint>("Sprint", sprintSchema);
