import pLimit from 'p-limit';
import { MonitorStatus } from '@prisma/client';
import { differenceInMinutes } from 'date-fns';
import { prisma } from './prisma';
import { buildMonitorUpdate, checkUrl, evaluateTransition } from './monitoring';
import { sendDownEmail, sendRecoveredEmail } from './email';

export const runMonitorChecks = async () => {
  const limit = pLimit(10);
  let cursor: string | undefined;
  let processed = 0;

  while (true) {
    const monitors = await prisma.monitor.findMany({
      where: { isPaused: false },
      include: { user: true },
      orderBy: { id: 'asc' },
      take: 50,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    if (!monitors.length) break;
    cursor = monitors[monitors.length - 1].id;

    await Promise.all(
      monitors.map((monitor) =>
        limit(async () => {
          const now = new Date();
          const check = await checkUrl(monitor.url);
          const transition = evaluateTransition({
            currentStatus: monitor.status,
            consecutiveFails: monitor.consecutiveFails,
            checkOk: check.ok,
            lastAlertSentAt: monitor.lastAlertSentAt,
            now
          });

          await prisma.$transaction(async (tx) => {
            const updateData = buildMonitorUpdate(transition, check, now);
            await tx.monitor.update({ where: { id: monitor.id }, data: updateData });
            await tx.checkEvent.create({
              data: {
                monitorId: monitor.id,
                checkedAt: now,
                ok: check.ok,
                statusCode: check.statusCode,
                responseTimeMs: check.responseTimeMs,
                error: check.error
              }
            });
          });

          if (transition.sendDownAlert) {
            await sendDownEmail({
              to: monitor.user.email,
              url: monitor.url,
              checkedAt: now,
              detail: check.error ?? `HTTP ${check.statusCode ?? 'unknown'}`
            });
            await prisma.monitor.update({
              where: { id: monitor.id },
              data: { lastAlertSentAt: now }
            });
          }

          if (transition.sendRecoveredAlert && monitor.user.alertRecovered) {
            const downtimeMinutes =
              monitor.status === MonitorStatus.DOWN && monitor.lastStatusChangeAt
                ? differenceInMinutes(now, monitor.lastStatusChangeAt)
                : undefined;
            await sendRecoveredEmail({
              to: monitor.user.email,
              url: monitor.url,
              recoveredAt: now,
              downtimeMinutes
            });
          }
        })
      )
    );

    processed += monitors.length;
  }

  return { processed };
};
