
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
    const connectionString = process.env.DATABASE_URL;
    const status = {
        envVarPresent: !!connectionString,
        connectionStringPrefix: connectionString ? connectionString.split(':')[0] : 'N/A',
        tables: [] as string[],
        error: null as any
    };

    if (!connectionString) {
        return NextResponse.json(status);
    }

    const pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Force SSL for Supabase
    });

    try {
        // List all tables in public schema
        const res = await pool.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);
        status.tables = res.rows.map(r => r.tablename);
    } catch (e: any) {
        console.error("Diag DB Error:", e);
        status.error = {
            message: e.message,
            code: e.code,
            detail: e.detail
        };
    } finally {
        await pool.end();
    }

    return NextResponse.json(status);
}
