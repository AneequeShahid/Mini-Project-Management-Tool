import mongoose from "mongoose";

const featureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  enabled: { type: Boolean, default: false },
  rolloutPercentage: { type: Number, default: 100 }, // 0 to 100
  rules: { type: mongoose.Schema.Types.Mixed }, // e.g., { "roles": ["Admin"] }
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const FeatureFlag = mongoose.model("FeatureFlag", featureFlagSchema);
