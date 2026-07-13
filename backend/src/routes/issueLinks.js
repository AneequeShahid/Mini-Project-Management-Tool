import { Router } from 'express';
import { IssueLink } from '../models/IssueLink.js';
import { requireAuth } from '../middleware/auth.js';
import { Task } from '../models/task.js';

const router = Router();

// Get all links for an issue
router.get('/:issueId', requireAuth, async (req, res) => {
  try {
    const links = await IssueLink.find({
      $or: [
        { sourceId: req.params.issueId },
        { targetId: req.params.issueId }
      ]
    })
    .populate('sourceId', 'title key status priority type')
    .populate('targetId', 'title key status priority type');
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a link
router.post('/', requireAuth, async (req, res) => {
  try {
    const { sourceId, targetId, linkType } = req.body;

    // Create inverse link automatically
    const inverseMap = {
      'blocks': 'is-blocked-by',
      'is-blocked-by': 'blocks',
      'duplicates': 'is-duplicated-by',
      'is-duplicated-by': 'duplicates',
      'parent-of': 'child-of',
      'child-of': 'parent-of',
      'relates-to': 'relates-to'
    };

    const link = await IssueLink.create({
      sourceId, targetId, linkType,
      createdBy: req.user.id
    });

    // Create inverse
    if (inverseMap[linkType] !== linkType) {
      await IssueLink.create({
        sourceId: targetId,
        targetId: sourceId,
        linkType: inverseMap[linkType],
        createdBy: req.user.id
      });
    }

    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a link
router.delete('/:linkId', requireAuth, async (req, res) => {
  try {
    const link = await IssueLink.findById(req.params.linkId);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    // Delete inverse too
    await IssueLink.deleteOne({
      sourceId: link.targetId,
      targetId: link.sourceId
    });
    await IssueLink.findByIdAndDelete(req.params.linkId);
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
