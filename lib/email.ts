import { Resend } from 'resend';
import { appEnv } from './env';

const resend = process.env.EMAIL_PROVIDER_API_KEY ? new Resend(process.env.EMAIL_PROVIDER_API_KEY) : null;

const send = async (subject: string, html: string, text: string, to: string): Promise<void> => {
  if (!resend) {
    console.log('[email:skipped]', { to, subject, text });
    return;
  }

  await resend.emails.send({
    from: appEnv.emailFrom,
    to,
    subject,
    html,
    text
  });
};

export const sendDownEmail = async (params: {
  to: string;
  url: string;
  checkedAt: Date;
  detail: string;
}): Promise<void> => {
  const subject = `Site Down: ${params.url}`;
  const text = `Your monitor detected downtime for ${params.url} at ${params.checkedAt.toISOString()}. Details: ${params.detail}. Dashboard: ${appEnv.dashboardUrl}`;
  const html = `<p><strong>${params.url}</strong> appears down.</p><p>Time: ${params.checkedAt.toISOString()}</p><p>Details: ${params.detail}</p><p><a href="${appEnv.dashboardUrl}">Open dashboard</a></p>`;
  await send(subject, html, text, params.to);
};

export const sendRecoveredEmail = async (params: {
  to: string;
  url: string;
  recoveredAt: Date;
  downtimeMinutes?: number;
}): Promise<void> => {
  const subject = `Site Recovered: ${params.url}`;
  const duration = params.downtimeMinutes ? `${params.downtimeMinutes} minute(s)` : 'unknown duration';
  const text = `${params.url} recovered at ${params.recoveredAt.toISOString()} after ${duration}. Dashboard: ${appEnv.dashboardUrl}`;
  const html = `<p><strong>${params.url}</strong> has recovered.</p><p>Recovered at: ${params.recoveredAt.toISOString()}</p><p>Downtime: ${duration}</p><p><a href="${appEnv.dashboardUrl}">Open dashboard</a></p>`;
  await send(subject, html, text, params.to);
};
