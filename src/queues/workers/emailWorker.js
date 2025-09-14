// src/queues/workers/emailWorker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { sendWelcomeEmail } = require('../../services/emailService'); // implemente envio via nodemailer/SES/etc.

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const worker = new Worker('email-queue', async job => {
  const { name, email } = job.data;
  // job.name == 'send-welcome-email' possivelmente usado se worker processa vários tipos
  if (job.name === 'send-welcome-email' || job.name === 'send-welcome-email') {
    await sendWelcomeEmail({ name, email });
  } else {
    // process other job types if needed
  }
}, { connection, concurrency: 5 });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

module.exports = worker;
