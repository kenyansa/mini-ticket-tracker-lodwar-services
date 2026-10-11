import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

async function applySchema(label: string, connectionString: string | undefined) {
  if (!connectionString) {
    console.log(`Skipping ${label}: no connection string set`);
    return;
  }
  const pool = new Pool({ connectionString });
  try {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(sql);
    console.log(`Schema applied to ${label}`);
  } finally {
    await pool.end();
  }
}

async function main() {
  await applySchema("dev database", process.env.DATABASE_URL);
  await applySchema("test database", process.env.TEST_DATABASE_URL);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});