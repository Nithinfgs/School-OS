import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

const migrationPath = path.resolve(process.cwd(), 'netlify/database/migrations/0001_schoolos.sql');
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  console.error('\x1b[31m[Error]\x1b[0m No database connection string found.');
  console.error('Please set NETLIFY_DATABASE_URL or DATABASE_URL before running this script.');
  console.error('Example: NETLIFY_DATABASE_URL="postgres://user:pass@host:5432/db" npm run db:migrate:netlify');
  process.exit(1);
}

async function runMigration() {
  console.log('\x1b[36m[SchoolOS]\x1b[0m Connecting to database...');
  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    console.log('\x1b[36m[SchoolOS]\x1b[0m Applying migration: netlify/database/migrations/0001_schoolos.sql...');
    await sql.unsafe(migrationSql);
    console.log('\x1b[32m✔ Migration applied successfully!\x1b[0m');
  } catch (err) {
    console.error('\x1b[31m[Migration Failed]\x1b[0m', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
