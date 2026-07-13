import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function verify() {
  console.log('Starting MongoMemoryServer for verification...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(`Connected to mock DB at ${uri}`);

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

  console.log('All indexes created successfully on mock DB!');
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

verify().catch(console.error);
