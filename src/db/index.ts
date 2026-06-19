import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple instances in development (Next.js hot reload)
declare global {
  var _db: ReturnType<typeof drizzle> | undefined;
}

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Supabase Transaction Pooler (port 6543)
  });

  return drizzle(client, { schema });
}

export const db = global._db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  global._db = db;
}
