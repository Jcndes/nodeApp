// src/queues/workers/emailWorker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { sendWelcomeEmail } = require('../../services/emailService');

// conexão Redis (compartilhável entre vários workers se quiser)
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// cria o worker
const worker = new Worker(
  'email-queue',
  async (job) => {
    switch (job.name) {
      case 'send-welcome-email':
        await sendWelcomeEmail(job.data);
        break;
      default:
        console.warn(`⚠️ Job ${job.name} não reconhecido.`);
    }
  },
  {
    connection,
    concurrency: 5, // processa até 5 jobs em paralelo
  }
);

// listeners de eventos
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} (${job.name}) concluído`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} (${job?.name}) falhou: ${err.message}`);
});

module.exports = worker;

