import { MongoMemoryServer } from 'mongodb-memory-server';

async function start() {
  try {
    console.log("Starting MongoDB Memory Server...");
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'pmtool'
      }
    });
    console.log(`MongoDB Memory Server started successfully at: ${mongod.getUri()}`);
    
    // Keep process alive
    process.on('SIGTERM', async () => {
      await mongod.stop();
      process.exit(0);
    });
    
  } catch (err) {
    console.error('Failed to start MongoDB Memory Server:', err);
    process.exit(1);
  }
}

start();
