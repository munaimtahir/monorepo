import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { ConditionalAuth } from '@/components/auth/ConditionalAuth';

export const metadata: Metadata = {
    title: 'Vexel Health',
    description: 'Vexel Health Platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <nav className="border-b bg-gray-50 px-4 py-2 flex gap-4 text-sm">
                    <Link href="/patients" className="text-blue-600 hover:underline">
                        Patients
                    </Link>
                    <Link href="/operator/worklist" className="text-blue-600 hover:underline">
                        Operator
                    </Link>
                    <Link href="/verification" className="text-blue-600 hover:underline">
                        Verification
                    </Link>
                    <Link href="/admin" className="text-blue-600 hover:underline">
                        Admin
                    </Link>
                </nav>
                <Providers>
                    <Suspense fallback={<>{children}</>}>
                        <ConditionalAuth>{children}</ConditionalAuth>
                    </Suspense>
                </Providers>
            </body>
        </html>
    );
}
