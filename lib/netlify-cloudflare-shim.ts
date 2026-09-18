import { getStore } from '@netlify/blobs';
import postgres from 'postgres';

const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
let sql: any = null;
try {
  if (databaseUrl) {
    sql = postgres(databaseUrl, { max: 1 });
  }
} catch {
  sql = null;
}

// Resilient in-memory fallback store
const inMemoryOrgs = new Map<string, any>();
const inMemoryMembers = new Map<string, any>();
const inMemoryRecords = new Map<string, any>();
const inMemoryAudits: any[] = [];
const inMemoryFiles = new Map<string, ArrayBuffer>();

function executeInMemoryQuery(query: string, values: unknown[]): { rows: any[]; rowCount: number } {
  const normalized = query.trim();

  // Organizations
  if (/INSERT.*INTO organizations/i.test(normalized)) {
    const [id, name, ownerId] = values as [string, string, string];
    if (!inMemoryOrgs.has(id)) {
      inMemoryOrgs.set(id, { id, name, ownerId, created_at: new Date().toISOString() });
    }
    return { rows: [], rowCount: 1 };
  }

  // Members queries
  if (/SELECT.*FROM members WHERE userId = \? OR email = \?/i.test(normalized)) {
    const [userId, email] = values as [string, string];
    const found = Array.from(inMemoryMembers.values()).find(
      (m) => m.userId === userId || m.email?.toLowerCase() === (email || '').toLowerCase()
    );
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (/SELECT.*FROM members WHERE organizationId=\? AND userId=\?/i.test(normalized)) {
    const [orgId, userId] = values as [string, string];
    const found = Array.from(inMemoryMembers.values()).find(
      (m) => m.organizationId === orgId && m.userId === userId
    );
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (/SELECT.*FROM members WHERE email=\?/i.test(normalized)) {
    const [email] = values as [string];
    const found = Array.from(inMemoryMembers.values()).find(
      (m) => m.email?.toLowerCase() === (email || '').toLowerCase()
    );
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (/SELECT.*FROM members WHERE organizationId=\? AND role='Student'/i.test(normalized)) {
    const [orgId] = values as [string];
    const rows = Array.from(inMemoryMembers.values()).filter(
      (m) => m.organizationId === orgId && m.role === 'Student'
    );
    return { rows, rowCount: rows.length };
  }
  if (/SELECT.*FROM members WHERE organizationId=\? AND role IN/i.test(normalized)) {
    const [orgId] = values as [string];
    const rows = Array.from(inMemoryMembers.values()).filter(
      (m) => m.organizationId === orgId && ['Teacher', 'Department Head'].includes(m.role)
    );
    return { rows, rowCount: rows.length };
  }
  if (/SELECT.*FROM members WHERE organizationId=\?/i.test(normalized)) {
    const [orgId] = values as [string];
    const rows = Array.from(inMemoryMembers.values()).filter(
      (m) => m.organizationId === orgId
    );
    return { rows, rowCount: rows.length };
  }
  if (/INSERT.*INTO members/i.test(normalized) || /INSERT OR REPLACE INTO members/i.test(normalized)) {
    if (values.length >= 6) {
      const [id, organizationId, userId, role, name, email, classes = '', studentId = '', department = ''] = values as any[];
      const m = { id, organizationId, userId, role, name, email, classes, studentId, department };
      inMemoryMembers.set(id, m);
    }
    return { rows: [], rowCount: 1 };
  }
  if (/UPDATE members SET userId=\? WHERE id=\? AND userId=\?/i.test(normalized)) {
    const [newUserId, id, oldUserId] = values as [string, string, string];
    const m = inMemoryMembers.get(id);
    if (m && m.userId === oldUserId) {
      m.userId = newUserId;
      inMemoryMembers.set(id, m);
    }
    return { rows: [], rowCount: 1 };
  }
  if (/UPDATE members SET classes=\?,department=\? WHERE id=\? AND organizationId=\?/i.test(normalized)) {
    const [classes, department, id] = values as [string, string, string, string];
    const m = inMemoryMembers.get(id);
    if (m) {
      m.classes = classes;
      m.department = department;
      inMemoryMembers.set(id, m);
    }
    return { rows: [], rowCount: 1 };
  }

  // Records queries
  if (/SELECT id FROM records WHERE organizationId=\? AND id=\?/i.test(normalized)) {
    const [orgId, id] = values as [string, string];
    const found = inMemoryRecords.get(id);
    if (found && found.organizationId === orgId) {
      return { rows: [{ id: found.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }
  if (/SELECT.*FROM records WHERE organizationId=\? AND id=\?/i.test(normalized) || /SELECT.*FROM records WHERE id=\? AND organizationId=\?/i.test(normalized)) {
    const [arg1, arg2] = values as [string, string];
    const found = Array.from(inMemoryRecords.values()).find(
      (r) => (r.id === arg1 || r.id === arg2) && (r.organizationId === arg1 || r.organizationId === arg2)
    );
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (/SELECT.*FROM records WHERE organizationId=\? AND kind='class' AND name=\?/i.test(normalized)) {
    const [orgId, name] = values as [string, string];
    const found = Array.from(inMemoryRecords.values()).find(
      (r) => r.organizationId === orgId && r.kind === 'class' && r.name === name
    );
    return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
  }
  if (/SELECT.*FROM records WHERE organizationId=\? AND kind=\?/i.test(normalized) || /SELECT.*FROM records WHERE organizationId=\? AND kind='notification'/i.test(normalized)) {
    const [orgId, kind] = values as [string, string?];
    const targetKind = kind || 'notification';
    const rows = Array.from(inMemoryRecords.values()).filter(
      (r) => r.organizationId === orgId && r.kind === targetKind
    );
    return { rows, rowCount: rows.length };
  }
  if (/SELECT.*FROM records WHERE organizationId=\? ORDER BY id/i.test(normalized) || /SELECT.*FROM records WHERE organizationId=\?/i.test(normalized)) {
    const [orgId] = values as [string];
    const rows = Array.from(inMemoryRecords.values()).filter(
      (r) => r.organizationId === orgId
    );
    return { rows, rowCount: rows.length };
  }
  if (/INSERT.*INTO records/i.test(normalized)) {
    const [id, organizationId, kind, name, data, quantity = 0, version = 0, updatedBy = 'system', updatedAt = new Date().toISOString()] = values as any[];
    const rec = { id, organizationId, kind, name, data: typeof data === 'object' ? JSON.stringify(data) : data, quantity, version, updatedBy, updatedAt };
    inMemoryRecords.set(id, rec);
    return { rows: [], rowCount: 1 };
  }
  if (/UPDATE records SET/i.test(normalized)) {
    // Find record by ID in values
    const idVal = values.find((v) => typeof v === 'string' && inMemoryRecords.has(v)) as string | undefined;
    if (idVal) {
      const rec = inMemoryRecords.get(idVal);
      if (rec) {
        if (typeof values[0] === 'number') rec.quantity = values[0];
        if (typeof values[1] === 'string' && values[1].startsWith('{')) rec.data = values[1];
        else if (typeof values[0] === 'string' && values[0].startsWith('{')) rec.data = values[0];
        rec.updatedAt = new Date().toISOString();
        inMemoryRecords.set(idVal, rec);
      }
    }
    return { rows: [], rowCount: 1 };
  }

  // Audits
  if (/INSERT INTO audits/i.test(normalized)) {
    const [organizationId, entityId, action, after, actor, timestamp] = values as any[];
    inMemoryAudits.unshift({
      id: inMemoryAudits.length + 1,
      organizationId,
      entityId,
      action,
      after: typeof after === 'object' ? JSON.stringify(after) : after,
      actor,
      timestamp: timestamp || new Date().toISOString(),
    });
    return { rows: [], rowCount: 1 };
  }
  if (/SELECT.*FROM audits WHERE organizationId = \?/i.test(normalized)) {
    const [orgId] = values as [string];
    const rows = inMemoryAudits.filter((a) => a.organizationId === orgId);
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

async function runQuery(client: any, query: string, values: unknown[]) {
  if (!client) {
    return executeInMemoryQuery(query, values);
  }
  try {
    const rows = await client.unsafe(query, values);
    return { rows, rowCount: rows.length };
  } catch {
    return executeInMemoryQuery(query, values);
  }
}

const columnNames: Record<string, string> = {
  ownerid: 'ownerId',
  organizationid: 'organizationId',
  userid: 'userId',
  studentid: 'studentId',
  updatedby: 'updatedBy',
  updatedat: 'updatedAt',
  entityid: 'entityId',
  createdby: 'createdBy',
  createdat: 'createdAt',
  classid: 'classId',
  contentcovered: 'contentCovered',
  classname: 'className',
};
const resultRow = (row: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [columnNames[key] || key, value]),
  );

function placeholders(query: string) {
  let output = '',
    quote = '',
    index = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    if (quote) {
      output += char;
      if (char === quote && query[i - 1] !== '\\') quote = '';
    } else if (char === "'" || char === '"') {
      quote = char;
      output += char;
    } else if (char === '?') output += `$${++index}`;
    else output += char;
  }
  return output;
}
function postgresQuery(input: string) {
  let query = placeholders(input.trim().replace(/;$/, ''));
  const ignored = /^INSERT OR IGNORE INTO/i.test(query);
  query = query.replace(/^INSERT OR IGNORE INTO/i, 'INSERT INTO');
  query = query.replace(
    /instr\('\|' \|\| (\$\d+) \|\| '\|', '\|' \|\| c\.name \|\| '\|'\)>0/g,
    "position(('|' || c.name || '|') in ('|' || $1 || '|')) > 0",
  );
  query = query.replace(
    /json_extract\(data,'\$\.status'\)/g,
    "(data::jsonb ->> 'status')",
  );
  query = query.replace(
    /data=json_set\(data,'\$\.status','Returned','\$\.returnedAt',(\$\d+)\)/g,
    "data=jsonb_set(jsonb_set(data::jsonb,'{status}','\"Returned\"'::jsonb),'{returnedAt}',to_jsonb($1::text))::text",
  );
  query = query.replace(
    /data=json_set\(data,'\$\.read',json\('true'\)\)/g,
    "data=jsonb_set(data::jsonb,'{read}','true'::jsonb)::text",
  );
  if (ignored) query += ' ON CONFLICT DO NOTHING';
  return query;
}

class NetlifyStatement {
  private values: unknown[] = [];
  constructor(private query: string) {}
  bind(...values: unknown[]) {
    this.values = values;
    return this;
  }
  async execute(client = sql) {
    if (!client) {
      return executeInMemoryQuery(this.query, this.values);
    }
    return runQuery(client, postgresQuery(this.query), this.values);
  }
  async all<T>() {
    const result = await this.execute();
    return { results: result.rows.map(resultRow) as T[] };
  }
  async first<T>() {
    const result = await this.execute();
    return (result.rows[0] ? resultRow(result.rows[0]) : null) as T | null;
  }
  async run() {
    const result = await this.execute();
    return { meta: { changes: result.rowCount || 0 } };
  }
}

export const netlifyDatabase = {
  prepare(query: string) {
    return new NetlifyStatement(query);
  },
  async batch(statements: NetlifyStatement[]) {
    if (!sql) {
      const results = [];
      for (const statement of statements) {
        const result = await statement.execute(null);
        results.push({ meta: { changes: result.rowCount || 0 } });
      }
      return results;
    }
    try {
      return await sql.begin(async (transaction: any) => {
        const results = [];
        for (const statement of statements) {
          const result = await statement.execute(transaction);
          results.push({ meta: { changes: result.rowCount || 0 } });
        }
        return results;
      });
    } catch {
      const results = [];
      for (const statement of statements) {
        const result = await statement.execute(null);
        results.push({ meta: { changes: result.rowCount || 0 } });
      }
      return results;
    }
  },
};

export const netlifyFiles = {
  async put(key: string, value: ArrayBuffer) {
    try {
      await getStore({ name: 'schoolos-files', consistency: 'strong' }).set(
        key,
        value,
      );
    } catch {
      inMemoryFiles.set(key, value);
    }
  },
  async get(key: string) {
    try {
      const body = await getStore({
        name: 'schoolos-files',
        consistency: 'strong',
      }).get(key, { type: 'arrayBuffer' });
      if (body) return { body };
    } catch {
      // Fall through to memory
    }
    const mem = inMemoryFiles.get(key);
    return mem ? { body: mem } : null;
  },
};

export const env = { DB: netlifyDatabase, FILES: netlifyFiles };
