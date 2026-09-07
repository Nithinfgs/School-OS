import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
export const organizations = sqliteTable('organizations', {
  id: text().primaryKey(),
  name: text().notNull(),
  ownerId: text().notNull(),
});
export const members = sqliteTable('members', {
  id: text().primaryKey(),
  organizationId: text()
    .notNull()
    .references(() => organizations.id),
  userId: text().notNull(),
  role: text().notNull(),
  name: text().notNull(),
  studentId: text(),
  department: text(),
  email: text(),
  classes: text(),
});
export const records = sqliteTable(
  'records',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id),
    kind: text().notNull(),
    name: text().notNull(),
    data: text().notNull(),
    quantity: integer().notNull().default(0),
    version: integer().notNull().default(0),
    updatedBy: text(),
    updatedAt: text().notNull(),
  },
  (t) => [index('idx_records_org_kind').on(t.organizationId, t.kind)],
);
export const audits = sqliteTable(
  'audits',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    organizationId: text().notNull(),
    entityId: text().notNull(),
    action: text().notNull(),
    before: text(),
    after: text(),
    actor: text().notNull(),
    timestamp: text().notNull(),
  },
  (t) => [index('idx_audits_org').on(t.organizationId)],
);
export const teacherClassLogs = sqliteTable(
  'teacher_class_logs',
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id),
    classId: text()
      .notNull()
      .references(() => records.id),
    date: text().notNull(),
    period: text().notNull().default('Daily'),
    activities: text().notNull().default(''),
    topic: text().notNull(),
    contentCovered: text().notNull(),
    notes: text().notNull().default(''),
    homework: text().notNull().default(''),
    resources: text().notNull().default('[]'),
    createdBy: text()
      .notNull()
      .references(() => members.id),
    updatedBy: text()
      .notNull()
      .references(() => members.id),
    createdAt: text().notNull(),
    updatedAt: text().notNull(),
    version: integer().notNull().default(0),
  },
  (t) => [
    uniqueIndex('idx_class_logs_org_class_date_period').on(
      t.organizationId,
      t.classId,
      t.date,
      t.period,
    ),
  ],
);
