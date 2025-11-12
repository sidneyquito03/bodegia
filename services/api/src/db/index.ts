import { Pool, QueryResult, QueryResultRow,types } from "pg";
types.setTypeParser(1700, (val: string) => (val === null ? null : parseFloat(val)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T> {
  const r: QueryResult<T> = await pool.query<T>(text, params);
  if (r.rows.length === 0) throw new Error("No rows");
  return r.rows[0];
}

async function oneOrNone<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const r: QueryResult<T> = await pool.query<T>(text, params);
  return r.rows[0] ?? null;
}

/** Devuelve cero o más filas */
async function manyOrNone<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const r: QueryResult<T> = await pool.query<T>(text, params);
  return r.rows;
}

/** Ejecuta sin resultado */
async function none(text: string, params?: any[]): Promise<void> {
  await pool.query(text, params);
}

/** Transacción simple */
async function tx<T>(fn: (q: Pool) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await fn(client as unknown as Pool);
    await client.query("COMMIT");
    return res;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

const db = { one, oneOrNone, manyOrNone, none, tx, pool };
export default db;
