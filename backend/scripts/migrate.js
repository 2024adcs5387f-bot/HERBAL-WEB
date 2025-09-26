// backend/scripts/migrate.js
// Simple migration runner for executing SQL files against Supabase/Postgres

import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL or SUPABASE_DB_URL is not set in backend/.env');
    process.exit(1);
  }

  // Choose SQL files to run in order. Start with the existing core schema.
  const sqlFiles = [
    path.join(__dirname, 'supabase-setup.sql'),
    path.join(__dirname, '02_extended_research.sql'),
  ].filter((p) => fs.existsSync(p));

  if (sqlFiles.length === 0) {
    console.error('❌ No SQL files found to run. Expected scripts/supabase-setup.sql');
    process.exit(1);
  }

  console.log('🚀 Starting database migration');
  console.log('📁 SQL files to run:');
  sqlFiles.forEach((f) => console.log('  •', path.basename(f)));

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Run each SQL file inside its own transaction
    for (const filePath of sqlFiles) {
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`\n▶️ Running ${path.basename(filePath)} ...`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Completed ${path.basename(filePath)}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Error running ${path.basename(filePath)}:`, err.message);
        process.exit(1);
      }
    }

    console.log('\n🎉 Migration finished successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

run();
