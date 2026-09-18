import { db } from './server';
import { demoTrackingRows } from './platform/demo-data';
export async function seedStudentDemo(org: string) {
  if (org !== 'schoolos-dev') return;

  // Tracked records are idempotently added on every seed pass so existing demo
  // databases receive newly introduced report types without a destructive reset.
  const tracked = demoTrackingRows().filter((row) => row.kind !== 'activityEvent') as any[];
  await db().batch(tracked.map((row) => db().prepare(
    'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,1,0,?,?)',
  ).bind(org + ':' + row.id, org, row.kind, row.name, JSON.stringify(row.data), 'system:seed', row.data.updatedAt || new Date().toISOString())));

  if (
    await db()
      .prepare('SELECT id FROM records WHERE id=?')
      .bind(org + ':student-service-policy')
      .first()
  ) return;
  const entries: any[] = [
    [
      'student-handbook',
      'document',
      'Student handbook · 2026–27',
      {
        audience: 'school',
        category: 'Handbooks',
        version: '2026.1',
        date: '2026-09-01',
        description:
          'Arrive before your first lesson. Bring your charged device, books and stationery. Treat people and shared equipment respectfully. Submit assignments through your class page. Ask your teacher before borrowing lab equipment. Contact the school office for attendance corrections or support.',
      },
    ],
    [
      'student-trip',
      'event',
      'Science museum visit',
      {
        class: 'Physics HL',
        date: '2026-09-18',
        startTime: '09:00',
        room: 'Meet at reception',
        description:
          'Bring a packed lunch, water bottle and signed consent form.',
      },
    ],
    [
      'student-menu',
      'meal',
      'Vegetable rice bowl',
      {
        audience: 'school',
        date: '2026-09-07',
        weekdays: [1, 2, 3, 4, 5],
        description:
          'Brown rice, roasted vegetables, chickpeas and tahini dressing.',
        dietary: 'Vegetarian · dairy-free',
        allergens:
          'Sesame. Prepared in a kitchen handling nuts, milk and wheat.',
        available: true,
        orderBy: '2026-09-07T10:00',
      },
    ],
    [
      'student-menu-two',
      'meal',
      'Tomato pasta',
      {
        audience: 'school',
        date: '2026-09-08',
        description: 'Penne with tomato sauce and optional parmesan.',
        dietary: 'Vegetarian',
        allergens: 'Wheat, milk',
        available: true,
      },
    ],
    [
      'student-house',
      'house',
      'House community',
      {
        audience: 'school',
        description:
          'Inter-house science quiz · Friday, 18 September. Sign up with your house tutor.',
        date: '2026-09-18',
        standings: [
          { house: 'Orion', points: 180 },
          { house: 'Phoenix', points: 170 },
          { house: 'Atlas', points: 160 },
          { house: 'Lynx', points: 155 },
        ],
      },
    ],
    [
      'student-slot',
      'appointmentSlot',
      'Counselling availability',
      {
        audience: 'school',
        studentFacing: true,
        date: '2026-09-10',
        description:
          'Thursday · 13:00–14:00. Request your preferred time; the counsellor will confirm.',
      },
    ],
    [
      'student-service-policy',
      'servicePolicy',
      'Student services',
      {
        audience: 'school',
        absenceRequests: true,
        counsellingEnabled: true,
        medicalEnabled: false,
        preordersEnabled: false,
        description:
          'Medical self-service and meal preorders are currently disabled. Contact the school office for medical assistance.',
      },
    ],
  ];
  await db().batch(
    entries.map(([id, kind, name, data]) =>
      db()
        .prepare(
          'INSERT OR IGNORE INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
        )
        .bind(
          org + ':' + id,
          org,
          kind,
          name,
          JSON.stringify(data),
          'system:seed',
          new Date().toISOString(),
        ),
    ),
  );
}
