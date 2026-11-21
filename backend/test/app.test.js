import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';

test('hello endpoint returns the API envelope without a database', async () => {
  const response = await request(app).get('/api/v1/hello');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    data: {
      service: 'shivam-electricals-api',
      message: 'Hello from Shivam Electricals ERP.'
    }
  });
});

test('admin routes require authentication', async () => {
  const response = await request(app).get('/api/v1/stores/admin-ping');

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test('product routes require authentication', async () => {
  const response = await request(app).post('/api/v1/products');

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.deepEqual(response.body.errors, {});
});

test('unknown routes use the API error envelope', async () => {
  const response = await request(app).get('/api/v1/not-found');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Route not found.',
    errors: {}
  });
});
