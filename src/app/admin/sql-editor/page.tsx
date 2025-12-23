'use client';

import { useState, useTransition } from 'react';
import { executeRawSql, getSetupScript } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Play, FileCode, AlertCircle, CheckCircle } from 'lucide-react';

export default function SqlEditorPage() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleExecute = () => {
        setError(null);
        setResult(null);
        startTransition(async () => {
            const res = await executeRawSql(query);
            if (res.success) {
                setResult(res);
            } else {
                setError(res.error || 'Unknown error occurred');
            }
        });
    };

    const handleLoadSetupScript = () => {
        startTransition(async () => {
            const res = await getSetupScript();
            if (res.success && res.content) {
                setQuery(res.content);
                setError(null);
            } else {
                setError(res.error || 'Failed to load script');
            }
        });
    };

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SQL Editor</h1>
                    <p className="text-muted-foreground">Execute raw SQL queries or run system setup scripts.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleLoadSetupScript}
                        disabled={isPending}
                    >
                        <FileCode className="mr-2 h-4 w-4" />
                        Load Setup Script
                    </Button>
                    <Button
                        onClick={handleExecute}
                        disabled={isPending || !query.trim()}
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Run Query
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Query Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="SELECT * FROM public.users_v4;"
                            className="min-h-[200px] font-mono text-sm"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && result.success && (
                    <div className="space-y-4">
                        <Alert className="bg-green-50/50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>

                        {result.rows && result.rows.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Results ({result.rowCount} rows)</CardTitle>
                                </CardHeader>
                                <CardContent className="overflow-auto max-h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {result.fields?.map((field: string) => (
                                                    <TableHead key={field} className="whitespace-nowrap font-bold">
                                                        {field}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.rows.map((row: any, i: number) => (
                                                <TableRow key={i}>
                                                    {result.fields?.map((field: string) => (
                                                        <TableCell key={`${i}-${field}`} className="whitespace-nowrap">
                                                            {typeof row[field] === 'object'
                                                                ? JSON.stringify(row[field])
                                                                : String(row[field])}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {result.rows && result.rows.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No rows returned.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
