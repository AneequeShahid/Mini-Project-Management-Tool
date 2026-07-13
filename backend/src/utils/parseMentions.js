import { Notification } from '../models/notification.js';
import { User } from '../models/user.js';

export async function parseMentions(text, actorId, issueId, projectId) {
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const matches = [...text.matchAll(mentionRegex)];

  for (const match of matches) {
    const username = match[1];
    const user = await User.findOne({
      $or: [
        { name: new RegExp(`^${username}$`, 'i') },
        { email: new RegExp(username, 'i') }
      ]
    });
    if (user && String(user._id) !== String(actorId)) {
      await Notification.create({
        user: user._id,
        userId: user._id,
        type: 'mention',
        title: 'You were mentioned',
        message: `Someone mentioned you in an issue`,
        issueId,
        projectId,
        project: projectId,
        actorId,
        fromUser: actorId
      });
    }
  }
}

export default parseMentions;
