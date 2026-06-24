import mongoose from "mongoose";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint" },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    storyPoints: { type: Number },
    isBug: { type: Boolean, default: false },
    bugReport: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Task = model("Task", taskSchema);
