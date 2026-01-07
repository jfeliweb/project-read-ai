#!/usr/bin/env node

/**
 * Script to apply migration 009_fix_handle_new_user_trigger.sql
 * This fixes the handle_new_user trigger to include the name field
 */

const { readFileSync } = require('fs');
const { join } = require('path');
const postgres = require('postgres');
const { config } = require('dotenv');

// Get the project root (parent of scripts directory)
const scriptDir = __dirname || process.cwd();
const projectRoot = scriptDir.includes('scripts')
  ? join(scriptDir, '..')
  : scriptDir;

// Load environment variables
config({ path: join(projectRoot, '.env.production.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment');
  console.error(
    '   Make sure .env.production.local exists and contains DATABASE_URL',
  );
  process.exit(1);
}

const migrationFile = join(
  projectRoot,
  'migrations',
  '009_fix_handle_new_user_trigger.sql',
);

console.log('📄 Reading migration file...');
const migrationSQL = readFileSync(migrationFile, 'utf-8');

console.log('🔌 Connecting to database...');
const sql = postgres(DATABASE_URL, {
  max: 1,
  onnotice: (notice) => {
    if (notice.message) {
      console.log(`ℹ️  ${notice.message}`);
    }
  },
});

async function applyMigration() {
  try {
    console.log('🚀 Applying migration...');
    await sql.unsafe(migrationSQL);
    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('The handle_new_user() trigger has been updated to:');
    console.log(
      "  - Extract name from user metadata (raw_user_meta_data->>'name')",
    );
    console.log('  - Fall back to email username if no name is provided');
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    if (error.detail) {
      console.error('   Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyMigration();
