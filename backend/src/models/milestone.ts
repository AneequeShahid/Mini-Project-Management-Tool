import mongoose, { Schema, Document } from "mongoose";

export interface IMilestone extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  dueDate: Date;
  status: "Pending" | "In Progress" | "Completed";
  tasks: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

milestoneSchema.index({ project: 1 });
export const Milestone = mongoose.model<IMilestone>("Milestone", milestoneSchema);
