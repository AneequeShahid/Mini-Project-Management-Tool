import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env relative to the scripts folder
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable not found in process.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // Issues (literal collection from instructions)
  await db.collection('issues').createIndex({ projectId: 1, status: 1 });
  await db.collection('issues').createIndex({ assignee: 1, status: 1 });
  await db.collection('issues').createIndex({ sprintId: 1 });
  await db.collection('issues').createIndex({ '$**': 'text' });

  // Tasks (actual collection from project schema)
  await db.collection('tasks').createIndex({ project: 1, status: 1 });
  await db.collection('tasks').createIndex({ assignee: 1, status: 1 });
  await db.collection('tasks').createIndex({ sprint: 1 });
  await db.collection('tasks').createIndex({ '$**': 'text' });

  // Activity
  await db.collection('activities').createIndex({ issueId: 1, createdAt: -1 });
  await db.collection('activities').createIndex({ taskId: 1, createdAt: -1 });

  // Notifications
  await db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 });

  // Links
  await db.collection('issuelinks').createIndex({ sourceId: 1 });
  await db.collection('issuelinks').createIndex({ targetId: 1 });

  console.log('All indexes created');
  process.exit(0);
}

addIndexes().catch(console.error);
