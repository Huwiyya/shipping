import type { Metadata } from "next";
import { Cairo } from 'next/font/google';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: "هوية",
  description: "منظومة هوية لإدارة الشحنات والعملاء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        {/* Next.js will automatically handle the favicon if it's placed in the app directory. */}
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
