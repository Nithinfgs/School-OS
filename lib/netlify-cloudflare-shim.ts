import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';

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
  async execute(client = getDatabase().pool) {
    return client.query(postgresQuery(this.query), this.values);
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

const netlifyDatabase = {
  prepare(query: string) {
    return new NetlifyStatement(query);
  },
  async batch(statements: NetlifyStatement[]) {
    const client = await getDatabase().pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const statement of statements) {
        const result = await statement.execute(client);
        results.push({ meta: { changes: result.rowCount || 0 } });
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
const netlifyFiles = {
  async put(key: string, value: ArrayBuffer) {
    await getStore({ name: 'schoolos-files', consistency: 'strong' }).set(
      key,
      value,
    );
  },
  async get(key: string) {
    const body = await getStore({
      name: 'schoolos-files',
      consistency: 'strong',
    }).get(key, { type: 'arrayBuffer' });
    return body ? { body } : null;
  },
};
export const env = { DB: netlifyDatabase, FILES: netlifyFiles };
