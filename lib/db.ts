import { Pool } from "pg";

declare global {
  var _trackMePool: Pool | undefined;
}

export const pool =
  global._trackMePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global._trackMePool = pool;
}
