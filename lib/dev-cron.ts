import { appEnv } from './env';
import { runMonitorChecks } from './cron';

const globalForCron = globalThis as unknown as { devCronStarted?: boolean };

export const startDevCron = () => {
  if (process.env.NODE_ENV !== 'development' || !appEnv.enableDevCron) return;
  if (globalForCron.devCronStarted) return;

  globalForCron.devCronStarted = true;
  setInterval(async () => {
    try {
      const result = await runMonitorChecks();
      console.log('[dev-cron] checked monitors', result);
    } catch (error) {
      console.error('[dev-cron] failed', error);
    }
  }, appEnv.checkIntervalSeconds * 1000);
};
