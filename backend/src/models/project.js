import mongoose from "mongoose";

const { Schema, model } = mongoose;

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    roles: [{ user: { type: Schema.Types.ObjectId, ref: "User" }, role: { type: String, enum: ["Owner", "Admin", "Member", "Viewer"], default: "Member" } }],
    status: { type: String, enum: ["Active", "Archived"], default: "Active" },
    startDate: { type: Date },
    endDate: { type: Date },
    icon: { type: String, default: "📁" },
    isTemplate: { type: Boolean, default: false },
    customFieldDefinitions: [{
      name: { type: String, required: true },
      type: { type: String, enum: ["text", "number", "date", "dropdown"], default: "text" },
      options: [String], // for dropdown
    }],
  },
  { timestamps: true }
);

export const Project = model("Project", projectSchema);
