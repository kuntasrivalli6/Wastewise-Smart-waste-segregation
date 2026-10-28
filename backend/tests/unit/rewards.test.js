import test from 'node:test';
import assert from 'node:assert/strict';
import { rewardService } from '../../src/services/rewardService.js';

test('Rewards: awards points on valid event', async () => {
  const userId = 'user-test-123';
  const idempotencyKey = `test-award-${Date.now()}`;
  const res = await rewardService.awardPoints(userId, 'classify_waste', idempotencyKey);
  assert.equal(res.awarded, true);
  assert.equal(res.points, 10);
});

test('Rewards: strictly prevents duplicate awards for identical idempotency key', async () => {
  const userId = 'user-test-456';
  const idempotencyKey = `idemp-dup-check-${Date.now()}`;
  
  // First attempt should succeed
  const first = await rewardService.awardPoints(userId, 'complete_module', idempotencyKey);
  assert.equal(first.awarded, true);
  assert.equal(first.points, 25);

  // Second attempt with exact same key must fail
  const second = await rewardService.awardPoints(userId, 'complete_module', idempotencyKey);
  assert.equal(second.awarded, false);
  assert.equal(second.reason, 'DUPLICATE_EVENT');
});

test('Rewards: accurately calculates user balance and tier progression', async () => {
  const userId = `user-tier-${Date.now()}`;
  
  // Initially starter
  const initial = await rewardService.getUserBalance(userId);
  assert.equal(initial.totalPoints, 0);
  assert.equal(initial.tier, 'Green Starter');

  // Award 150 points -> Eco Warrior (>= 100)
  for (let i = 0; i < 6; i++) {
    await rewardService.awardPoints(userId, 'complete_module', `tier-test-${userId}-${i}`);
  }
  const afterAwards = await rewardService.getUserBalance(userId);
  assert.equal(afterAwards.totalPoints, 150);
  assert.equal(afterAwards.tier, 'Eco Warrior');
});

