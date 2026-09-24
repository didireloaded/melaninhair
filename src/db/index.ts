import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

export type AppDatabase = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __appDbInstance?: AppDatabase;
  __arenaNextJsPostgresqlPool?: Pool;
  __appPgliteClient?: PGlite;
};

function createDatabase(): AppDatabase {
  if (globalForDb.__appDbInstance) {
    return globalForDb.__appDbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }

    const instance = drizzleNodePg(pool, { schema });
    globalForDb.__appDbInstance = instance;
    return instance;
  }

  // Fallback: embedded local PostgreSQL engine via PGlite
  const dbDir = path.join(process.cwd(), "storage", "db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const client = globalForDb.__appPgliteClient ?? new PGlite(dbDir);
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__appPgliteClient = client;
  }

  const instance = drizzlePglite(client, { schema });
  globalForDb.__appDbInstance = instance;
  return instance;
}

export const db: AppDatabase = createDatabase();
export const pool = globalForDb.__arenaNextJsPostgresqlPool;
