const intOrDefault = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const appEnv = {
  checkIntervalSeconds: intOrDefault(process.env.CHECK_INTERVAL_SECONDS, 60),
  failThreshold: intOrDefault(process.env.FAIL_THRESHOLD, 2),
  alertCooldownMinutes: intOrDefault(process.env.ALERT_COOLDOWN_MINUTES, 30),
  cronSecret: process.env.CRON_SECRET ?? '',
  dashboardUrl: process.env.DASHBOARD_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000/app',
  emailFrom: process.env.EMAIL_FROM ?? 'alerts@example.com',
  enableDevCron: (process.env.ENABLE_DEV_CRON ?? 'false') === 'true'
};
