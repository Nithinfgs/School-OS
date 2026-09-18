import assert from 'node:assert';
import { encryptPayload, decryptPayload, maskSecret, generateSecureKey } from '../../lib/security/encryption';

export async function runEncryptionTests() {
  console.log('  ▶ Testing AES-256-GCM Field-Level Encryption & Redaction...');

  process.env.ENCRYPTION_SECRET = 'schoolos-test-secret-key-32-chars-long-2026!';

  // Test 1: Plaintext roundtrip
  const secretText = 'Confidential Student Psychological Evaluation Notes';
  const encrypted = encryptPayload(secretText);
  assert.ok(encrypted.includes(':'), 'Encrypted payload must contain iv:authTag:ciphertext format');
  const decrypted = decryptPayload<string>(encrypted);
  assert.strictEqual(decrypted, secretText, 'Decrypted text must exactly match original');

  // Test 2: Structured JSON object roundtrip (PII/Medical record)
  const piiObject = {
    studentId: 'std-98214',
    medicalAllergies: ['Peanuts', 'Penicillin'],
    emergencyContact: '+91 98765 43210',
    specialNeedsFlag: true,
  };
  const encObj = encryptPayload(piiObject);
  const decObj = decryptPayload<typeof piiObject>(encObj);
  assert.deepStrictEqual(decObj, piiObject, 'Decrypted JSON object must match original structured PII');

  // Test 3: Auth Tag Tampering Detection (GCM Authentication)
  const parts = encObj.split(':');
  const tamperedCiphertext = parts[0] + ':' + parts[1] + ':' + parts[2].slice(0, -2) + 'aa';
  assert.throws(
    () => decryptPayload(tamperedCiphertext),
    /Unsupported state or unable to authenticate data|Invalid encrypted payload/i,
    'Tampered ciphertext must fail authentication check'
  );

  // Test 4: Mask Secret
  assert.strictEqual(maskSecret('sb_secret_983719827398127398'), 'sb_sec...27398 (Encrypted/Redacted)');
  assert.strictEqual(maskSecret(null), '*** NOT CONFIGURED ***');

  // Test 5: Secure Random Key Generation
  const token = generateSecureKey('sk_live_', 16);
  assert.ok(token.startsWith('sk_live_'), 'Generated key must have proper prefix');
  assert.strictEqual(token.length, 8 + 32, 'Generated key must have correct length');

  console.log('  ✔ AES-256-GCM Encryption tests passed.');
}
