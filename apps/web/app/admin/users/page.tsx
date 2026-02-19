'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DataTableShell } from '@/components/admin/DataTableShell';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusPill } from '@/components/admin/StatusPill';
import { adminRoutes } from '@/lib/admin/routes';
import { parseApiError } from '@/lib/api-errors';
import { client } from '@/lib/sdk/client';
import { adminKeys } from '@/lib/sdk/hooks';
import type { paths } from '@vexel/contracts';

type MeResponse = paths['/me']['get']['responses'][200]['content']['application/json'];

export default function UsersListPage() {
  const { data: meData, isLoading, error } = useQuery({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      const { data, error: apiError } = await client.GET('/me');
      if (apiError) throw new Error(parseApiError(apiError, 'Failed to load user context').message);
      return data as MeResponse;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Tenant user management scaffold with RBAC placeholders."
        actions={
          <Link
            href={adminRoutes.usersInvite}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Invite User
          </Link>
        }
      />

      <NoticeBanner title="Requires backend contract endpoint" tone="warning">
        OpenAPI does not yet define tenant user list/invite/deactivate endpoints (for example `GET /admin/users`, `POST /admin/users/invite`).
      </NoticeBanner>

      {error ? (
        <NoticeBanner title="Unable to load current user" tone="warning">
          {error instanceof Error ? error.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <DataTableShell
        title="Users List"
        subtitle="Current tenant member list (scaffold)."
        isEmpty={!meData && !isLoading}
        emptyTitle="No tenant users returned"
        emptyDescription="Connect a users list endpoint to populate this table."
        toolbar={<p className="text-sm text-[var(--muted)]">Showing authenticated user as placeholder row.</p>}
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meData ? (
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3">{meData.name ?? 'Current User'}</td>
                <td className="px-4 py-3">{meData.email ?? '—'}</td>
                <td className="px-4 py-3">Admin (placeholder)</td>
                <td className="px-4 py-3">
                  <StatusPill status="active" />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={adminRoutes.userDetail(meData.id ?? 'current-user')}
                    className="text-sm font-medium text-[var(--accent)]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
