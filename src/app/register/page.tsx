
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, UserPlus, Key } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import logo from '@/app/assets/logo.png';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { registerTenant } from "@/lib/actions";
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        username: '', // email
        password: '',
        phone: '',
        licenseKey: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.username || !formData.password || !formData.licenseKey) {
            toast({
                title: "بيانات ناقصة",
                description: "الرجاء تعبئة جميع الحقول المطلوبة.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Call server action
            const result = await registerTenant({
                name: formData.name,
                username: formData.username,
                password: formData.password,
                phone: formData.phone
            }, formData.licenseKey);

            if (result.success) {
                toast({
                    title: "تم التسجيل بنجاح",
                    description: "يمكنك الآن تسجيل الدخول.",
                });
                router.push('/admin/login');
            } else {
                toast({
                    title: "فشل التسجيل",
                    description: result.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast({
                title: "خطأ في الخادم",
                description: "حدث خطأ غير متوقع.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
                <div className="text-center mb-8">
                    <Image src={logo} alt="Logo" width={100} height={100} className="mx-auto mb-4 drop-shadow-xl" />
                    <h1 className="text-3xl font-bold text-white mb-2">تسجيل شركة جديدة</h1>
                    <p className="text-slate-400">ابدأ فترتك التجريبية الآن</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">اسم الشركة / المدير</label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="مثال: شركة الأفق"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">اسم المستخدم (للدخول)</label>
                        <Input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">رقم الهاتف</label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="09xxxxxxxx"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
                        <Input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="********"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4">
                        <label className="block text-sm font-medium text-primary mb-1 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            رقم السيريال (Serial Number)
                        </label>
                        <Input
                            name="licenseKey"
                            value={formData.licenseKey}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-primary/50 text-white placeholder:text-slate-500"
                            placeholder="XXXX-XXXX-XXXX"
                        />
                        <p className="text-xs text-slate-500 mt-1">احصل عليه من المزود للبدء.</p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 mt-6 h-12 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "تسجيل وانطلاق"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/admin/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                        لديك حساب بالفعل؟ تسجيل الدخول
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
