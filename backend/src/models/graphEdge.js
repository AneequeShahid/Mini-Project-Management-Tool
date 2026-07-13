import mongoose from "mongoose";

const graphEdgeSchema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    index: true 
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    index: true 
  },
  relation: { 
    type: String, 
    required: true, 
    index: true 
  },
  properties: { type: mongoose.Schema.Types.Mixed },
  weight: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure uniqueness for the same relation between two nodes
graphEdgeSchema.index({ from: 1, to: 1, relation: 1 }, { unique: true });

export const GraphEdge = mongoose.model("GraphEdge", graphEdgeSchema);
