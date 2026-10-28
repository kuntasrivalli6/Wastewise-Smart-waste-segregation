import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';

let server;
let baseUrl;

test.before(() => {
  return new Promise((resolve) => {
    // Start on ephemeral port 0
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('API GET /health returns 200 and healthy status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'healthy');
});

test('API GET /categories returns categories list', async () => {
  const res = await fetch(`${baseUrl}/categories`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length >= 6);
});

test('API POST /classifications returns classification for valid item', async () => {
  const res = await fetch(`${baseUrl}/classifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Cardboard box' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.recognized, true);
  assert.equal(body.data.category.slug, 'dry-recyclable');
});

test('API POST /classifications returns 422 for invalid empty input', async () => {
  const res = await fetch(`${baseUrl}/classifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '' }),
  });
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('API Admin route enforces 401 without auth and 403 for non-admin', async () => {
  // Unauthenticated request
  const unauthRes = await fetch(`${baseUrl}/admin/overview`);
  assert.equal(unauthRes.status, 401);

  // Authenticated as regular user
  const userRes = await fetch(`${baseUrl}/admin/overview`, {
    headers: { Authorization: 'Bearer mock-token-user-123' },
  });
  assert.equal(userRes.status, 403);

  // Authenticated as admin
  const adminRes = await fetch(`${baseUrl}/admin/overview`, {
    headers: { Authorization: 'Bearer mock-token-admin-123' },
  });
  assert.equal(adminRes.status, 200);
  const adminBody = await adminRes.json();
  assert.equal(adminBody.success, true);
  assert.ok(adminBody.data.usersCount !== undefined);
});

