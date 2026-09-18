import crypto from 'crypto';

/**
 * Enterprise AES-256-GCM Cryptographic Utility for SchoolOS.
 * Provides authenticated encryption for sensitive payloads, tokens, PII, and API secrets.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM recommended
const AUTH_TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Derives a consistent 32-byte encryption key from environment secret or system fallback.
 */
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) throw new Error('ENCRYPTION_SECRET must be configured before encryption can be used.');
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext string or object using AES-256-GCM with authentication tag and random IV.
 * Format: `<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`
 */
export function encryptPayload(data: string | Record<string, unknown>, customKey?: Buffer): string {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  const key = customKey || getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string and verifies authentication integrity.
 * Returns decrypted plaintext or parsed object.
 */
export function decryptPayload<T = string>(encryptedString: string, customKey?: Buffer): T {
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:ciphertext');
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = customKey || getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted) as T;
  } catch {
    return decrypted as unknown as T;
  }
}

/**
 * Securely masks sensitive API keys and secrets for safe logging/display.
 * e.g. "sb_secret_983719827398127398" -> "sb_sec...27398"
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '*** NOT CONFIGURED ***';
  if (secret.length <= 8) return '********';
  const prefix = secret.slice(0, 6);
  const suffix = secret.slice(-5);
  return `${prefix}...${suffix} (Encrypted/Redacted)`;
}

/**
 * Generates a high-entropy cryptographically secure random token (e.g. for API keys or one-time tokens).
 */
export function generateSecureKey(prefix = 'sk_live_', bytes = 32): string {
  return `${prefix}${crypto.randomBytes(bytes).toString('hex')}`;
}
