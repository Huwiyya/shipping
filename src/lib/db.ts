import { Pool } from 'pg';

let pool: Pool | undefined;

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not defined in environment variables. SQL Editor features will not work.');
}

const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });
    }
    return pool;
}

export const query = async (text: string, params?: any[]) => {
    const p = getPool();
    const start = Date.now();
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    // console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};
