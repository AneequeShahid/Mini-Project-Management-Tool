import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Template } from '../models/Template.js';

const router = Router();

const DEFAULT_TEMPLATES = [
  {
    name: 'Bug Report',
    issueType: 'Bug',
    defaultTitle: '[BUG] ',
    defaultDescription: `## Bug Description\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n## Actual Behavior\n\n## Environment\n- Browser:\n- OS:\n- Version:`,
    defaultPriority: 'High',
    isGlobal: true
  },
  {
    name: 'User Story',
    issueType: 'Story',
    defaultTitle: 'As a [user], I want to [goal] so that [reason]',
    defaultDescription: `## User Story\n\n## Acceptance Criteria\n- [ ] \n- [ ] \n- [ ] \n\n## Definition of Done\n- [ ] Code reviewed\n- [ ] Tests written\n- [ ] Documentation updated`,
    defaultPriority: 'Medium',
    isGlobal: true
  },
  {
    name: 'Feature Request',
    issueType: 'Feature',
    defaultTitle: '[FEATURE] ',
    defaultDescription: `## Feature Description\n\n## Problem it Solves\n\n## Proposed Solution\n\n## Alternatives Considered\n\n## Additional Context`,
    defaultPriority: 'Medium',
    isGlobal: true
  },
  {
    name: 'Technical Debt',
    issueType: 'Task',
    defaultTitle: '[TECH DEBT] ',
    defaultDescription: `## Current State\n\n## Desired State\n\n## Why This Matters\n\n## Estimated Effort`,
    defaultPriority: 'Low',
    isGlobal: true
  }
];

async function ensureDefaultTemplates() {
  const count = await Template.countDocuments();
  if (count === 0) {
    await Template.create(DEFAULT_TEMPLATES);
    console.log('[Templates] Seeded default templates');
  }
}

router.get('/:projectId', requireAuth, async (req, res) => {
  try {
    await ensureDefaultTemplates();
    const templates = await Template.find({
      $or: [
        { projectId: req.params.projectId },
        { isGlobal: true }
      ]
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const template = await Template.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
