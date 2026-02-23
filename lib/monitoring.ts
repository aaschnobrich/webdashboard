import { appEnv } from './env';

export type MonitorState = 'UP' | 'DOWN' | 'UNKNOWN';

export type CheckResult = {
  ok: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  error?: string;
};

export const checkUrl = async (url: string, timeoutMs = 8000): Promise<CheckResult> => {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow'
    });
    const responseTimeMs = Date.now() - start;
    const ok = response.status >= 200 && response.status < 400;

    return {
      ok,
      statusCode: response.status,
      responseTimeMs,
      error: ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown network error'
    };
  } finally {
    clearTimeout(timeout);
  }
};

export type Transition = {
  nextStatus: MonitorState;
  nextFails: number;
  changed: boolean;
  sendDownAlert: boolean;
  sendRecoveredAlert: boolean;
};

export const evaluateTransition = (params: {
  currentStatus: MonitorState;
  consecutiveFails: number;
  checkOk: boolean;
  lastAlertSentAt: Date | null;
  now: Date;
}): Transition => {
  const { currentStatus, consecutiveFails, checkOk, lastAlertSentAt, now } = params;
  const failThreshold = appEnv.failThreshold;
  const cooldownMs = appEnv.alertCooldownMinutes * 60_000;

  if (checkOk) {
    const nextStatus: MonitorState = 'UP';
    return {
      nextStatus,
      nextFails: 0,
      changed: currentStatus !== nextStatus,
      sendDownAlert: false,
      sendRecoveredAlert: currentStatus === 'DOWN'
    };
  }

  const nextFails = consecutiveFails + 1;
  const nextStatus: MonitorState = nextFails >= failThreshold ? 'DOWN' : currentStatus;
  const changed = currentStatus !== nextStatus;
  const inCooldown = lastAlertSentAt ? now.getTime() - lastAlertSentAt.getTime() < cooldownMs : false;

  return {
    nextStatus,
    nextFails,
    changed,
    sendDownAlert: nextStatus === 'DOWN' && (changed || !inCooldown),
    sendRecoveredAlert: false
  };
};

export const buildMonitorUpdate = (transition: Transition, check: CheckResult, now: Date) => ({
  status: transition.nextStatus,
  consecutiveFails: transition.nextFails,
  lastCheckedAt: now,
  lastResponseTimeMs: check.responseTimeMs,
  lastError: check.ok ? null : check.error ?? 'Unknown error',
  lastStatusChangeAt: transition.changed ? now : undefined
});
