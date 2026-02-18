import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker('pdf-render-queue', async job => {
    console.log('Processing job', job.id);
    // Call PDF service here
}, { connection });

console.log('Worker started');
