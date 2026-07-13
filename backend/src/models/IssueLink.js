import mongoose from 'mongoose';

const IssueLinkSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  linkType: {
    type: String,
    enum: ['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by', 'parent-of', 'child-of'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now }
});

export const IssueLink = mongoose.model('IssueLink', IssueLinkSchema);
