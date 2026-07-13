import mongoose from "mongoose";

const { Schema, model } = mongoose;

const teamSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    description: { type: String },
    lead: { type: Schema.Types.ObjectId, ref: "User" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    icon: { type: String, default: "👥" },
  },
  { timestamps: true }
);

teamSchema.index({ workspace: 1 });
teamSchema.index({ lead: 1 });

export const Team = model("Team", teamSchema);
