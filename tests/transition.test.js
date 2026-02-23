import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTransition } from '../lib/transition-logic.js';

test('becomes DOWN on second failure', () => {
  const now = new Date('2025-01-01T00:00:00Z');
  const first = evaluateTransition({ currentStatus: 'UP', consecutiveFails: 0, checkOk: false, lastAlertSentAt: null, now });
  assert.equal(first.nextStatus, 'UP');

  const second = evaluateTransition({ currentStatus: 'UP', consecutiveFails: first.nextFails, checkOk: false, lastAlertSentAt: null, now });
  assert.equal(second.nextStatus, 'DOWN');
  assert.equal(second.sendDownAlert, true);
});

test('recovers on next success', () => {
  const now = new Date('2025-01-01T00:00:00Z');
  const next = evaluateTransition({ currentStatus: 'DOWN', consecutiveFails: 2, checkOk: true, lastAlertSentAt: null, now });
  assert.equal(next.nextStatus, 'UP');
  assert.equal(next.sendRecoveredAlert, true);
});
