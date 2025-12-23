'use server';

import { query } from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';

export type SqlResult = {
    success: boolean;
    rows?: any[];
    fields?: string[];
    rowCount?: number | null;
    error?: string;
    message?: string;
};

export async function executeRawSql(sql: string): Promise<SqlResult> {
    try {
        if (!sql || sql.trim().length === 0) {
            return { success: false, error: 'Query is empty' };
        }

        const result = await query(sql);

        return {
            success: true,
            rows: result.rows,
            fields: result.fields?.map(f => f.name),
            rowCount: result.rowCount,
            message: `Query executed successfully. ${result.rowCount !== null ? `${result.rowCount} rows affected.` : ''}`
        };
    } catch (error: any) {
        console.error('SQL Execution Error:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred executing the query.'
        };
    }
}

export async function getSetupScript(): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        const filePath = join(process.cwd(), 'create_tables.sql');
        const content = await readFile(filePath, 'utf-8');
        return { success: true, content };
    } catch (error: any) {
        console.error('Error reading setup script:', error);
        return { success: false, error: 'Failed to read create_tables.sql file.' };
    }
}
