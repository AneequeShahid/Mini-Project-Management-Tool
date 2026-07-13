import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  name: { type: String, required: true },
  issueType: { type: String, required: true },
  defaultTitle: String,
  defaultDescription: String,
  defaultPriority: String,
  defaultLabels: [String],
  defaultStoryPoints: Number,
  isGlobal: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const Template = mongoose.model('Template', TemplateSchema);
