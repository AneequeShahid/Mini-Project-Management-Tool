import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  role: String,
  allocation: { type: Number, min: 0, max: 100, default: 100 },
  startDate: Date,
  endDate: Date,
  notes: String,
});

const resourcePlanSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  name: { type: String, required: true },
  allocations: [allocationSchema],
  period: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  status: { type: String, enum: ["draft", "active", "archived"], default: "draft" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

resourcePlanSchema.index({ workspace: 1, "period.start": 1, "period.end": 1 });

export default mongoose.model("ResourcePlan", resourcePlanSchema);
