'use client';

import { useQuery } from '@tanstack/react-query';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminNav } from '@/components/admin/AdminNav';
import { client } from '@/lib/sdk/client';
import { parseApiError } from '@/lib/api-errors';
import type { paths } from '@vexel/contracts';

type MeResponse = paths['/me']['get']['responses'][200]['content']['application/json'];

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const { data } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => {
      const { data: response, error } = await client.GET('/me');
      if (error) {
        throw new Error(parseApiError(error, 'Failed to load current user').message);
      }
      return response as MeResponse;
    },
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <AdminNav />
          <div className="flex flex-1 flex-col">
            <header className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Tenant-scoped</p>
                  <h2 className="text-lg font-semibold">Administration</h2>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {data?.name ?? data?.email ?? 'Authenticated tenant user'}
                </p>
              </div>
            </header>
            <main className="flex-1 p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
