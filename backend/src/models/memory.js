import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  type: { 
    type: String, 
    enum: ["semantic", "procedural", "project", "meeting"], 
    required: true,
    index: true 
  },
  content: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  embedding: { type: [Number], index: true }, // For semantic retrieval
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

memorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Memory = mongoose.model("Memory", memorySchema);
