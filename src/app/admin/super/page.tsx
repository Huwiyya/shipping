
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateLicense, getActiveLicenses } from "@/lib/actions"; // Need to export these
import { Loader2, Key, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [licenses, setLicenses] = useState<any[]>([]);
    const { toast } = useToast();

    const fetchLicenses = async () => {
        // Simple client-side check for UI feedback
        const userStr = localStorage.getItem('loggedInUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            // In a real app, rely on server action security (which we have) and middleware.
            // But this helps redirect unauthorized users quickly.
            if (user.type !== 'admin') { // Or specific check if we had tenantId in local storage
                // We don't store tenantId in local storage explicitly in previous steps (just id, type).
                // But let's assume if actions fail, we show error.
            }
        }

        const data = await getActiveLicenses();
        if (data.length === 0) {
            // Maybe unauthorized?
        }
        setLicenses(data);
    };

    useEffect(() => {
        fetchLicenses();
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await generateLicense(14); // 14 days default
        if (result && result.success && result.key) {
            setGeneratedKey(result.key);
            fetchLicenses();
            toast({ title: "تم إنشاء السيريال بنجاح", description: result.key });
        } else {
            toast({
                title: "خطأ في الإنشاء",
                description: result?.error || "فشل إنشاء السيريال. تحقق من الصلاحيات.",
                variant: "destructive"
            });
        }
        setIsLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "تم النسخ", description: "تم نسخ السيريال للحافظة" });
    };

    return (
        <div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-3xl font-bold mb-8">لوحة تحكم النظام (Super Admin)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Generator Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-6 h-6 text-primary" />
                            توليد كود تفعيل
                        </CardTitle>
                        <CardDescription>
                            إنشاء كود جديد لمدة 14 يوم (تجريبي)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full">
                                {isLoading ? <Loader2 className="animate-spin" /> : "توليد كود جديد"}
                            </Button>

                            {generatedKey && (
                                <div className="bg-secondary p-4 rounded-lg flex justify-between items-center border border-primary/20">
                                    <div className="font-mono text-xl font-bold tracking-wider">{generatedKey}</div>
                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedKey)}>
                                        <Copy className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>حالة النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>عدد الأكواد النشطة: {licenses.filter(l => l.status === 'active').length}</p>
                        <p>عدد الشركات المسجلة: {licenses.filter(l => l.status === 'used').length}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">سجل الأكواد</h2>
                <div className="bg-card rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الكود</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                                <TableHead className="text-right">تستخدم بواسطة</TableHead>
                                <TableHead className="text-right">نسخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {licenses.sort((a, b) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()).map((license) => (
                                <TableRow key={license.id}>
                                    <TableCell className="font-mono">{license.key}</TableCell>
                                    <TableCell>
                                        <Badge variant={license.status === 'active' ? 'default' : license.status === 'used' ? 'secondary' : 'destructive'}>
                                            {license.status === 'active' ? 'نشط' : license.status === 'used' ? 'مستخدم' : 'منتهي'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(license.created_at || license.createdAt).toLocaleDateString('en-GB')}</TableCell>
                                    <TableCell>{license.used_by_tenant_id || license.usedByTenantId ? <span className="text-xs font-mono">{license.used_by_tenant_id || license.usedByTenantId}</span> : '-'}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(license.key)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
