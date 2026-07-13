import mongoose from "mongoose";

const { Schema, model } = mongoose;

const gitRepoSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    provider: { type: String, enum: ["github", "gitlab", "gitea", "forgejo", "bitbucket"], required: true },
    externalId: { type: String },
    owner: { type: String, required: true },
    repo: { type: String, required: true },
    fullName: { type: String, required: true },
    url: { type: String },
    defaultBranch: { type: String, default: "main" },
    webhookSecret: { type: String },
    webhookId: { type: String },
    enabled: { type: Boolean, default: true },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true }
);

gitRepoSchema.index({ workspace: 1, fullName: 1 }, { unique: true });
gitRepoSchema.index({ project: 1 });

export const GitRepo = model("GitRepo", gitRepoSchema);
