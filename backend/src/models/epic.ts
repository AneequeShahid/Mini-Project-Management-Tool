import mongoose, { Schema, Document } from "mongoose";

export interface IEpic extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: "Backlog" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High" | "Critical";
  startDate?: Date;
  endDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const epicSchema = new Schema<IEpic>(
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
export const Epic = mongoose.model<IEpic>("Epic", epicSchema);
