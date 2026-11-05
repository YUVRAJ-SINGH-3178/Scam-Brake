import { backgroundWorker } from './scheduler.ts';

backgroundWorker.start(30_000);

const shutdown = () => {
  backgroundWorker.stop();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
