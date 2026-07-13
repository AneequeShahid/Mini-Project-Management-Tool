import { Activity } from '../models/activity.js';

export async function logActivity(issueId, userId, action, options = {}) {
  try {
    await Activity.create({
      issueId,
      projectId: options.projectId,
      userId,
      action,
      field: options.field,
      oldValue: options.oldValue,
      newValue: options.newValue,
      meta: options.meta,
      // populate legacy fields for backward compatibility
      project: options.projectId,
      user: userId,
      entityId: issueId,
      entityType: 'task'
    });
  } catch (err) {
    console.error('[Activity] Failed to log:', err.message);
  }
}

export default logActivity;
