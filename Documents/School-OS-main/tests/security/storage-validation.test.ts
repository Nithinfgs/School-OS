import assert from 'node:assert';
import {
  sanitizeExtension,
  validateFileMetadata,
  buildStoragePath,
} from '../../lib/platform/storage';

export async function runStorageValidationTests() {
  console.log('  ▶ Testing Storage Upload Controls & Path Traversal Guards...');

  // Test 1: Permitted file extensions
  assert.strictEqual(sanitizeExtension('report.pdf'), 'pdf');
  assert.strictEqual(sanitizeExtension('profile_picture.PNG'), 'png');
  assert.strictEqual(sanitizeExtension('marksheet.docx'), 'docx');

  // Test 2: Reject dangerous executable extensions
  assert.throws(
    () => sanitizeExtension('exploit.exe'),
    /File extension '\.exe' is not permitted/
  );
  assert.throws(
    () => sanitizeExtension('payload.sh'),
    /File extension '\.sh' is not permitted/
  );
  assert.throws(
    () => sanitizeExtension('shell.php'),
    /File extension '\.php' is not permitted/
  );

  // Test 3: Validate file metadata (Size & MIME)
  validateFileMetadata('application/pdf', 1024 * 500, 'doc.pdf'); // Valid 500KB PDF
  assert.throws(
    () => validateFileMetadata('application/x-msdownload', 1024, 'bad.exe'),
    /MIME type 'application\/x-msdownload' is not allowed/
  );
  assert.throws(
    () => validateFileMetadata('application/pdf', 20 * 1024 * 1024, 'huge.pdf'),
    /File size must be between 1 byte and 10 MB/
  );

  // Test 4: Path traversal prevention in storage paths
  const orgId = 'org-12345';
  const rawEntityType = '../../etc';
  const rawEntityId = 'std-987/../../passwd';
  const path = buildStoragePath(orgId, rawEntityType, rawEntityId, 'pdf');

  assert.ok(!path.includes('..'), 'Path traversal sequence .. must be stripped');
  assert.ok(!path.includes('etc/passwd'), 'Path must not escape folder boundaries');
  assert.ok(path.startsWith('org-12345/etc/std-987passwd/'));

  console.log('  ✔ Storage upload validation tests passed.');
}
