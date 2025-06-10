import type { MigrationMeta } from "drizzle-orm/migrator";
import type { db } from "./drizzle";
import { logDebug, logError } from "../log";

async function ensureMigrationsTable(db: db) {
  await db.execute(`
      create table if not exists drizzle_migrations (
        hash text primary key,
        created_at timestamp not null default NOW()
      )
    `);
}

async function getMigratedHashes(db: db) {
  const raw = await db.execute(`
      select hash from drizzle_migrations
    `);
  return raw.rows.map((row) => row.hash as string);
}

async function recordMigration(db: db, hash: string) {
  await db.execute(`
      insert into drizzle_migrations (hash, created_at)
      values ('${hash}', NOW())
      on conflict do nothing
    `);
}

export async function migrateSchema(db: db, migrations: Array<MigrationMeta>) {
  logDebug("🚀 Starting pglite migration...");

  // Ensure migrations table exists
  await ensureMigrationsTable(db);

  // Get already executed migrations
  const executedHashes = await getMigratedHashes(db);

  // Filter and execute pending migrations
  const pendingMigrations = migrations.filter(
    (migration) => !executedHashes.includes(migration.hash)
  );

  if (pendingMigrations.length === 0) {
    logDebug("✨ No pending migrations found.");
    return;
  }

  logDebug(`📦 Found ${pendingMigrations.length} pending migrations`);

  // Execute migrations in sequence
  for (const migration of pendingMigrations) {
    logDebug(`⚡ Executing migration: ${migration.hash}`);
    try {
      // Execute each SQL statement in sequence
      for (const sql of migration.sql) {
        await db.execute(sql);
      }

      // Record successful migration
      await recordMigration(db, migration.hash);
      logDebug(`✅ Successfully completed migration: ${migration.hash}`);
    } catch (error) {
      logError(`❌ Failed to execute migration ${migration.hash}:`, error);
      throw error;
    }
  }

  logDebug("🎉 All migrations completed successfully");
}
