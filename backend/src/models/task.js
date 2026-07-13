import mongoose from "mongoose";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint" },
    epic: { type: Schema.Types.ObjectId, ref: "Epic" },
    milestone: { type: Schema.Types.ObjectId, ref: "Milestone" },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Backlog", "Todo", "In Progress", "In Review", "Done"],
      default: "Todo",
    },
    issueType: {
      type: String,
      enum: ["Task", "Bug"],
      default: "Task",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    assignee: { type: Schema.Types.ObjectId, ref: "User" },
    reporter: { type: Schema.Types.ObjectId, ref: "User" },
    storyPoints: { type: Number, default: 0 },
    dueDate: { type: Date },
    labels: [{ type: String }],
    comments: [{ author: { type: Schema.Types.ObjectId, ref: "User" }, text: String, createdAt: { type: Date, default: Date.now }, reactions: [{ emoji: String, user: { type: Schema.Types.ObjectId, ref: "User" } }] }],
    attachments: [{ url: String, name: String, size: Number, type: String, uploadedBy: { type: Schema.Types.ObjectId, ref: "User" }, createdAt: { type: Date, default: Date.now } }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subtasks: [{ title: String, done: { type: Boolean, default: false }, assignee: { type: Schema.Types.ObjectId, ref: "User" } }],
    dependsOn: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    estimatedTime: { type: Number },
    timeEstimate: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    timelogs: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      hours: { type: Number, required: true },
      description: { type: String },
      loggedAt: { type: Date, default: Date.now }
    }],

    customFields: [{
      fieldId: { type: Schema.Types.ObjectId, ref: "Project.customFieldDefinitions" },
      value: Schema.Types.Mixed,
    }],
    linkedPRs: [{ repo: String, type: String, externalId: String, url: String, title: String, state: String, mergedAt: Date }],
    meeting: {
      url: String,
      provider: { type: String, enum: ["jitsi", "zoom", "google-meet"] },
      scheduledAt: Date,
      recording: String,
      transcript: String,
    },
    startedAt: { type: Date },
    resolvedAt: { type: Date },
  },

  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ sprint: 1 });

export const Task = model("Task", taskSchema);
