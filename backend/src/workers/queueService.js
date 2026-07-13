class QueueService {
  processQueue(name, handler) {
    console.log(`[QueueService] Registered queue handler for ${name}`);
    return { name, handler };
  }

  async enqueue(queueName, data) {
    console.log(`[QueueService] Enqueue to ${queueName}`, data);
    return { queueName, data, enqueued: true };
  }
}

export const queueService = new QueueService();
