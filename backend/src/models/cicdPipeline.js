import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cicdPipelineSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true },
    provider: { type: String, enum: ["github-actions", "jenkins", "gitlab-ci", "circleci"], required: true },
    status: { type: String, enum: ["passed", "failed", "running", "pending", "cancelled"], default: "pending" },
    branch: { type: String },
    commitSha: { type: String },
    commitMessage: { type: String },
    author: { type: String },
    runId: { type: String },
    runUrl: { type: String },
    duration: { type: Number },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    triggeredBy: { type: String, enum: ["push", "pr", "manual", "schedule"], default: "push" },
    linkedTask: { type: Schema.Types.ObjectId, ref: "Task" },
    webhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

cicdPipelineSchema.index({ workspace: 1, status: 1 });
cicdPipelineSchema.index({ project: 1 });
cicdPipelineSchema.index({ runId: 1 });

export const CICDPipeline = model("CICDPipeline", cicdPipelineSchema);
