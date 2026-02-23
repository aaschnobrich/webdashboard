export const evaluateTransition = ({
  currentStatus,
  consecutiveFails,
  checkOk,
  lastAlertSentAt,
  now,
  failThreshold = 2,
  alertCooldownMinutes = 30
}) => {
  const cooldownMs = alertCooldownMinutes * 60_000;

  if (checkOk) {
    const nextStatus = 'UP';
    return {
      nextStatus,
      nextFails: 0,
      changed: currentStatus !== nextStatus,
      sendDownAlert: false,
      sendRecoveredAlert: currentStatus === 'DOWN'
    };
  }

  const nextFails = consecutiveFails + 1;
  const nextStatus = nextFails >= failThreshold ? 'DOWN' : currentStatus;
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
