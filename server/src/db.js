import initSqlJs from 'sql.js';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const SQL = await initSqlJs({ locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm') });

export async function createDatabase(path = process.env.DATABASE_PATH || './data/students.sqlite') {
  const filename = path === ':memory:' ? path : resolve(process.cwd(), path);
  if (filename !== ':memory:') await mkdir(dirname(filename), { recursive: true });
  let database = new SQL.Database();
  if (filename !== ':memory:') {
    try { database = new SQL.Database(await readFile(filename)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const persist = async () => { if (filename !== ':memory:') await writeFile(filename, database.export()); };
  const query = {
    async run(sql, params = []) { database.run(sql, params); const changes = database.getRowsModified(); const idResult = database.exec('SELECT last_insert_rowid() AS id'); await persist(); return { lastID: idResult[0]?.values[0]?.[0], changes }; },
    async get(sql, params = []) { const statement = database.prepare(sql, params); const row = statement.step() ? statement.getAsObject() : undefined; statement.free(); return row; },
    async all(sql, params = []) { const statement = database.prepare(sql, params); const rows = []; while (statement.step()) rows.push(statement.getAsObject()); statement.free(); return rows; },
    async close() { await persist(); database.close(); }
  };
  await query.run('PRAGMA foreign_keys = ON');
  await query.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, enrollment_number TEXT NOT NULL UNIQUE,
    branch TEXT NOT NULL, semester INTEGER NOT NULL, marks REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
  )`);
  await query.run(`CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, student_id INTEGER,
    student_name TEXT, enrollment_number TEXT, summary TEXT NOT NULL, snapshot TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  return query;
}
