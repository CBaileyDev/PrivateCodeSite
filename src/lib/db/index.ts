import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, features } from "@/lib/env";
import * as schema from "@/lib/db/schema";

export { schema };
export type Database = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: Database | null = null;

/**
 * Lazily-initialised Drizzle client. Importing this module is always safe;
 * the connection is only opened on first use. Configured for serverless +
 * Supabase's transaction pooler (`prepare: false`, small pool).
 */
export function getDb(): Database {
  if (!features.database) {
    throw new Error(
      "Database is not configured: set DATABASE_URL to a Postgres/Supabase connection string.",
    );
  }
  if (!dbInstance) {
    client = postgres(env.DATABASE_URL!, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export const isDatabaseConfigured = features.database;
