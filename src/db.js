const fs = require("node:fs");
const { Pool } = require("pg");

function getDatabasePassword() {
  if (process.env.DB_PASSWORD_FILE) {
    return fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf8").trim();
  }

  return process.env.DB_PASSWORD || "postgres";
}

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: getDatabasePassword(),
      database: process.env.DB_NAME || "dshma",
    };

const pool = new Pool(config);

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = {
  pool,
  initDatabase,
};