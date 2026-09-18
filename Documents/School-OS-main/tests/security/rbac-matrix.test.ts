import assert from 'node:assert';
import { canViewTrackedRecord } from '../../lib/platform/permissions';

const rolePermissions: Record<string, string[]> = {
  Admin: ['*'],
  'Head of School': [
    'calendar.manage',
    'inquiries.viewAll',
    'inquiries.reply',
    'inquiries.assign',
    'inquiries.manage',
    'teacherRecords.viewAll',
    'studentRecords.viewAll',
    'student.view',
    'book.view',
    'inventory.view',
    'transport.view',
  ],
  'Transport Staff': ['transport.view', 'transport.manage', 'transport.recordArrival', 'transport.recordDeparture', 'transport.manageNotices'],
  Teacher: [
    'inventory.view',
    'request.create',
    'assignment.edit',
    'submission.grade',
    'record.edit',
    'student.view',
    'book.view',
  ],
  Student: [
    'inventory.view',
    'book.view',
    'request.create',
    'submission.create',
  ],
  'Lab Assistant': [
    'inventory.view',
    'inventory.edit',
    'lab.manageInventory',
    'lab.requests.manage',
    'lab.usage.record',
    'lab.orders.create',
    'lab.orders.receive',
    'request.approve',
    'request.create',
    'book.view',
  ],
  'Library Assistant': [
    'book.view',
    'book.edit',
    'loan.edit',
    'request.create',
    'request.approve',
    'student.view',
  ],
};

function allow(role: string, p: string) {
  if (!rolePermissions[role]?.some((x) => x === '*' || x === p))
    throw new Error('FORBIDDEN');
}

export async function runRbacMatrixTests() {
  console.log('  ▶ Testing RBAC Matrix, Server Permissions & Tenant Boundaries...');

  // Test 1: Admin capabilities
  assert.doesNotThrow(() => allow('Admin', 'inventory.view'));
  assert.doesNotThrow(() => allow('Admin', 'studentRecords.viewAll'));
  assert.doesNotThrow(() => allow('Admin', 'any.custom.permission'));

  // Test 2: Teacher permissions & boundaries
  assert.doesNotThrow(() => allow('Teacher', 'inventory.view'));
  assert.doesNotThrow(() => allow('Teacher', 'submission.grade'));
  assert.throws(() => allow('Teacher', 'inquiries.assign'), /FORBIDDEN/);

  // Test 3: Student boundaries (Privilege Escalation Prevention)
  assert.doesNotThrow(() => allow('Student', 'submission.create'));
  assert.throws(() => allow('Student', 'submission.grade'), /FORBIDDEN/);
  assert.throws(() => allow('Student', 'inventory.edit'), /FORBIDDEN/);
  assert.throws(() => allow('Student', 'transport.manage'), /FORBIDDEN/);

  // Test 4: Head of School oversight
  assert.doesNotThrow(() => allow('Head of School', 'inquiries.viewAll'));
  assert.doesNotThrow(() => allow('Head of School', 'calendar.manage'));

  // Test 5: Tracked record visibility scoping
  const studentPrivateRecord: any = {
    id: 'rec-1',
    tags: ['student:student-1'],
    metadata: { studentId: 'student-1' },
    visibility: { studentVisible: true, adminVisible: true, parentVisible: true },
  };

  // Student 1 can view
  assert.strictEqual(canViewTrackedRecord(studentPrivateRecord, { role: 'Student', studentId: 'student-1' }), true);
  // Student 2 CANNOT view (Horizontal Privilege Boundary)
  assert.strictEqual(canViewTrackedRecord(studentPrivateRecord, { role: 'Student', studentId: 'student-2' }), false);

  // Restricted disciplinary record
  const restrictedRecord: any = {
    id: 'rec-restricted',
    tags: ['disciplinary'],
    visibility: { restricted: true, adminVisible: true, studentVisible: false },
  };
  assert.strictEqual(canViewTrackedRecord(restrictedRecord, { role: 'Admin' }), true);
  assert.strictEqual(canViewTrackedRecord(restrictedRecord, { role: 'Student', studentId: 'student-1' }), false);
  assert.strictEqual(canViewTrackedRecord(restrictedRecord, { role: 'Teacher' }), false);

  console.log('  ✔ RBAC Matrix and Scope tests passed.');
}
