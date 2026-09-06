import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
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
