// src/queues/index.js
const { Queue, QueueScheduler, Worker } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// create queue schedulers (required for delayed/retries)
const emailQueueName = 'email-queue';
const emailQueueScheduler = new QueueScheduler(emailQueueName, { connection });

// create the queue object producers will use
const emailQueue = new Queue(emailQueueName, { connection });

// export objects
module.exports = {
  connection,
  emailQueue,
  emailQueueScheduler,
};
