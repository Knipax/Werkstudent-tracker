import { createClient } from "@libsql/client";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    if (process.env.TURSO_DATABASE_URL) {
      _client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    } else {
      // Local dev: SQLite file, no install needed
      _client = createClient({ url: "file:jobs.db" });
    }
  }
  return _client;
}

export async function initDb() {
  const client = getClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      company    TEXT NOT NULL,
      link       TEXT,
      status     TEXT NOT NULL DEFAULT 'applied',
      notes      TEXT,
      location   TEXT,
      salary     TEXT,
      applied_at TEXT NOT NULL
    )
  `);
}

export async function getAllJobs() {
  const client = getClient();
  await initDb();
  const result = await client.execute(
    "SELECT * FROM jobs ORDER BY applied_at DESC"
  );
  return result.rows;
}

export async function createJob(job: {
  id: string;
  title: string;
  company: string;
  link?: string;
  status: string;
  notes?: string;
  location?: string;
  salary?: string;
  applied_at: string;
}) {
  const client = getClient();
  await initDb();
  await client.execute({
    sql: `INSERT INTO jobs (id, title, company, link, status, notes, location, salary, applied_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      job.id,
      job.title,
      job.company,
      job.link ?? null,
      job.status,
      job.notes ?? null,
      job.location ?? null,
      job.salary ?? null,
      job.applied_at,
    ],
  });
}

export async function updateJob(
  id: string,
  fields: Partial<{
    title: string;
    company: string;
    link: string;
    status: string;
    notes: string;
    location: string;
    salary: string;
  }>
) {
  const client = getClient();
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (!entries.length) return;
  const setClauses = entries.map(([k]) => `${k} = ?`).join(", ");
  const values = entries.map(([, v]) => v ?? null);
  await client.execute({
    sql: `UPDATE jobs SET ${setClauses} WHERE id = ?`,
    args: [...values, id],
  });
}

export async function deleteJob(id: string) {
  const client = getClient();
  await client.execute({ sql: "DELETE FROM jobs WHERE id = ?", args: [id] });
}
