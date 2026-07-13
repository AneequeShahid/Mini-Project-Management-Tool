import mongoose from "mongoose";

const { Schema, model } = mongoose;

const milestoneSchema = new Schema(
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
export const Milestone = model("Milestone", milestoneSchema);
