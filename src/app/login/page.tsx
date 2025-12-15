
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Ship, Phone, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import logo from '@/app/assets/logo.png';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { getUserByPhone } from "@/lib/actions";

const Logo = ({ onClick }: { onClick: () => void }) => (
    <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={onClick}>
         <Image
            src={logo}
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto"
        />
    </div>
);


export default function LoginPage() {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [titleClickCount, setTitleClickCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      // Set the default theme to light when the component mounts
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
  }, []);
  
  useEffect(() => {
      if (logoClickCount === 3) {
          router.push('/admin/login');
      }
      
      let timer: NodeJS.Timeout;
      if (logoClickCount > 0) {
          timer = setTimeout(() => setLogoClickCount(0), 1500); // Reset after 1.5 seconds
      }

      return () => {
          clearTimeout(timer);
      };
  }, [logoClickCount, router]);
  
   useEffect(() => {
      if (titleClickCount === 3) {
          router.push('/representative/login');
      }
      
      let timer: NodeJS.Timeout;
      if (titleClickCount > 0) {
          timer = setTimeout(() => setTitleClickCount(0), 1500); // Reset after 1.5 seconds
      }

      return () => {
          clearTimeout(timer);
      };
  }, [titleClickCount, router]);


  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
  };
  
  const handleTitleClick = () => {
      setTitleClickCount(prev => prev + 1);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({
        title: "خطأ في الإدخال",
        description: "الرجاء إدخال رقم الهاتف وكلمة المرور.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const user = await getUserByPhone(phone);

      if (user && user.password === password) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك، ${user.name}`,
        });
        localStorage.setItem('loggedInUser', JSON.stringify({ id: user.id, type: 'user' }));
        router.push('/dashboard');
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: "رقم الهاتف أو كلمة المرور غير صحيحة.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطأ في الخادم",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary dark:from-slate-900 dark:via-black dark:to-slate-900 p-4">
        <main className="w-full max-w-md mx-auto">
            <div className="bg-card/60 backdrop-blur-lg rounded-2xl border shadow-lg p-8 text-center">

                <Logo onClick={handleLogoClick} />
                
                <div className="mb-6">
                    <h1 onClick={handleTitleClick} className="text-4xl font-bold mb-2 text-foreground cursor-pointer">مرحباً بك</h1>
                    <p className="text-muted-foreground">سجل الدخول للمتابعة</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 mb-6 text-right">
                    <Input 
                        dir="rtl" 
                        type="text" 
                        placeholder="رقم الهاتف" 
                        className="h-12 text-center bg-transparent"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                    />
                    <Input 
                        dir="rtl" 
                        type="password" 
                        placeholder="كلمة السر" 
                        className="h-12 text-center bg-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isLoading}
                    />
                    <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold rounded-lg" disabled={isLoading}>
                         {isLoading ? (
                            <>
                                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                جاري التحقق...
                            </>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </Button>
                </form>

                <div className="grid grid-cols-2 gap-4 mt-8 text-foreground">
                    <Link href="/dashboard/track-shipment" passHref>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors h-full cursor-pointer">
                            <Ship className="w-8 h-8 mb-2 opacity-80" />
                            <span className="text-sm font-medium">تتبع الشحنات</span>
                        </div>
                    </Link>
                    <Link href="/dashboard/calculate-shipment" passHref>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors h-full cursor-pointer">
                            <Package className="w-8 h-8 mb-2 opacity-80" />
                            <span className="text-sm font-medium">حساب الشحنات</span>
                        </div>
                    </Link>
                </div>
            </div>
        </main>
         <footer className="mt-8 text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
                <span>للتواصل معنا وفتح حساب جديد</span>
                <Phone className="w-4 h-4"/>
                <a href="tel:0946691233" className="font-bold text-primary" dir="ltr">
                    0946691233
                </a>
            </p>
        </footer>
    </div>
  );
}

