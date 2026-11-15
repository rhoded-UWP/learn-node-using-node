// Learn Node on Node: the database connection (APC 440, Module 11)
//
// This is the only file that talks to Postgres. It makes one pool of
// connections and shares it. Other files import query() and setupDatabase().

import pg from 'pg';

// The connection string is a secret. It comes only from the environment:
// .env on your computer (npm run dev), or Render's Environment settings.
const { DATABASE_URL } = process.env;

// On Render, the Internal URL needs no SSL. Anywhere else we use the
// External URL, and Render requires SSL on it.
const ssl = process.env.RENDER ? false : { rejectUnauthorized: false };

// A pool keeps a few connections open and lends one to each query.
// With no DATABASE_URL there is no pool, and the site runs without a database.
// connectionTimeoutMillis: give up after 5 seconds instead of hanging a page.
const pool = DATABASE_URL
  ? new pg.Pool({ connectionString: DATABASE_URL, ssl, connectionTimeoutMillis: 5000 })
  : null;

// If an idle connection breaks (for example, the database restarts), log it
// instead of letting the error crash the server.
pool?.on('error', (error) => {
  console.error('Database connection error:', error.message);
});

// Run one SQL statement. Values go in the values array as $1, $2, and so on,
// never joined into the SQL text.
export async function query(text, values = []) {
  if (!pool) throw new Error('No database: DATABASE_URL is not set.');
  return pool.query(text, values);
}

// Runs once, before the server starts listening. Creates the site_stats
// table if it is missing, and its one row, named 'requests'.
// Returns true if the database is ready, false if it is not.
export async function setupDatabase() {
  if (!pool) {
    console.error('DATABASE_URL is not set. Starting without a database.');
    return false;
  }
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS site_stats (
        name  TEXT PRIMARY KEY,
        value BIGINT NOT NULL DEFAULT 0
      )
    `);
    // ON CONFLICT DO NOTHING: if the row is already there, keep its value.
    await query(
      'INSERT INTO site_stats (name, value) VALUES ($1, 0) ON CONFLICT (name) DO NOTHING',
      ['requests'],
    );
    return true;
  } catch (error) {
    // error.message, not the whole error, so the connection string never prints.
    console.error('Database setup failed. Starting without a database:', error.message);
    return false;
  }
}
