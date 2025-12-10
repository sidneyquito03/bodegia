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

/** Transacción con métodos de BD */
interface TxContext {
  one<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
  ): Promise<T>;
  oneOrNone<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
  ): Promise<T | null>;
  manyOrNone<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
  ): Promise<T[]>;
  none(text: string, params?: any[]): Promise<void>;
}

async function tx<T>(fn: (t: TxContext) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const txContext: TxContext = {
      async one<R extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<R> {
        const result = await client.query<R>(text, params);
        if (result.rows.length === 0) throw new Error("No rows");
        return result.rows[0];
      },
      async oneOrNone<R extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<R | null> {
        const result = await client.query<R>(text, params);
        return result.rows[0] ?? null;
      },
      async manyOrNone<R extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<R[]> {
        const result = await client.query<R>(text, params);
        return result.rows;
      },
      async none(text: string, params?: any[]): Promise<void> {
        await client.query(text, params);
      }
    };
    
    const res = await fn(txContext);
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
