import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin seed");
    return;
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { rowCount } = await pool.query(
      `INSERT INTO users (email, name, password_hash, role_id)
       VALUES ($1, 'Admin', $2, (SELECT id FROM roles WHERE name = 'admin'))
       ON CONFLICT (email) DO NOTHING`,
      [email, hash]
    );
    console.log(rowCount ? `Admin created: ${email}` : `Admin already exists: ${email}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});