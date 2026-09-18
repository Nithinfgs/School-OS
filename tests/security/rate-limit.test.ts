import assert from 'node:assert';
import { checkRateLimit, extractClientIp } from '../../lib/security/rate-limit';

export async function runRateLimitTests() {
  console.log('  ▶ Testing API Rate Limiting & Token Bucket Algorithms...');

  const testKey = `test-ip-${Date.now()}`;
  const config = { maxRequests: 3, windowMs: 1000 };

  // 1st request -> success
  const r1 = checkRateLimit(testKey, config);
  assert.strictEqual(r1.success, true);
  assert.strictEqual(r1.remaining, 2);

  // 2nd request -> success
  const r2 = checkRateLimit(testKey, config);
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r2.remaining, 1);

  // 3rd request -> success
  const r3 = checkRateLimit(testKey, config);
  assert.strictEqual(r3.success, true);
  assert.strictEqual(r3.remaining, 0);

  // 4th request -> blocked (HTTP 429)
  const r4 = checkRateLimit(testKey, config);
  assert.strictEqual(r4.success, false);
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.resetSeconds > 0);

  // Client IP extraction test
  const dummyReq = new Request('https://schoolos.app/api/auth/login', {
    headers: { 'x-forwarded-for': '203.0.113.195, 10.0.0.1' },
  });
  assert.strictEqual(extractClientIp(dummyReq), '203.0.113.195');

  console.log('  ✔ API Rate Limiting tests passed.');
}
