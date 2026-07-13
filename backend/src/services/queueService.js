// IQueueAdapter.js (Implicit interface)
// {
//   addJob(queueName, data, options): Promise<Job>,
//   processQueue(queueName, processor): Promise<void>,
// }

import { Queue, Worker } from "bullmq";
import { redisClient } from "./redis.js";

export class BullMQAdapter {
  constructor() {
    this.queues = {};
  }

  async addJob(queueName, data, options = {}) {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Queue(queueName, { connection: redisClient });
    }
    return await this.queues[queueName].add("default", data, options);
  }

  async processQueue(queueName, processor) {
    const worker = new Worker(queueName, async (job) => {
      return await processor(job.data);
    }, { connection: redisClient });
    
    worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
    worker.on("failed", (job, err) => console.error(`Job ${job.id} failed:`, err));
    
    return worker;
  }
}

export const queueService = new BullMQAdapter();
