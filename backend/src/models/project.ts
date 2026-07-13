import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: "Active" | "Archived";
  startDate?: Date;
  endDate?: Date;
  icon?: string;
  isTemplate: boolean;
  customFieldDefinitions: Array<{
    name: string;
    type: "text" | "number" | "date" | "dropdown";
    options?: string[];
  }>;
  roles: Array<{
    user: mongoose.Types.ObjectId;
    role: "Owner" | "Admin" | "Member" | "Viewer";
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["Active", "Archived"], default: "Active" },
    startDate: { type: Date },
    endDate: { type: Date },
    icon: { type: String, default: "📁" },
    isTemplate: { type: Boolean, default: false },
    customFieldDefinitions: [{
      name: { type: String, required: true },
      type: { type: String, enum: ["text", "number", "date", "dropdown"], default: "text" },
      options: [String],
    }],
    roles: [{
      user: { type: Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["Owner", "Admin", "Member", "Viewer"], default: "Member" },
    }],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
