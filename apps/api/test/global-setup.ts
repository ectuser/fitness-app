import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { TEST_DATABASE_URL } from './test-env'

// Creates the dedicated fitness_test database when it does not exist yet and
// applies the real Drizzle migrations to it.
export default async function setup() {
  const url = new URL(TEST_DATABASE_URL)
  const database = url.pathname.slice(1)
  url.pathname = '/postgres'

  const client = new pg.Client({ connectionString: url.toString() })
  await client.connect()
  try {
    const { rowCount } = await client.query(
      'select 1 from pg_database where datname = $1',
      [database],
    )
    if (!rowCount) {
      await client.query(`create database "${database}"`)
    }
  } finally {
    await client.end()
  }

  const pool = new pg.Pool({ connectionString: TEST_DATABASE_URL })
  try {
    await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  } finally {
    await pool.end()
  }
}
