'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminCard } from '@/components/admin/AdminCard';
import { FieldRow } from '@/components/admin/FieldRow';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusPill } from '@/components/admin/StatusPill';
import { parseApiError } from '@/lib/api-errors';
import { client } from '@/lib/sdk/client';
import { adminKeys } from '@/lib/sdk/hooks';
import type { paths } from '@vexel/contracts';

type MeResponse = paths['/me']['get']['responses'][200]['content']['application/json'];

const roleOptions = ['Admin', 'Operator', 'Verifier', 'Viewer'] as const;

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = typeof params.userId === 'string' ? params.userId : 'unknown-user';

  const { data: meData, error } = useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: async () => {
      const { data, error: apiError } = await client.GET('/me');
      if (apiError) throw new Error(parseApiError(apiError, 'Failed to load user profile').message);
      return data as MeResponse;
    },
  });

  const viewingSelf = meData?.id != null && meData.id === userId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Detail"
        subtitle="Roles and permissions scaffold for tenant user management."
        actions={
          <>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              Deactivate
            </button>
            <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">
              Save Role Mapping
            </button>
          </>
        }
      />

      <NoticeBanner title="Requires backend contract endpoint" tone="warning">
        User detail, role assignment, and deactivate endpoints are not yet present in OpenAPI.
      </NoticeBanner>

      {error ? (
        <NoticeBanner title="Unable to load current session user" tone="warning">
          {error instanceof Error ? error.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AdminCard title="Summary" className="xl:col-span-1">
          <dl>
            <FieldRow label="User ID" value={userId} />
            <FieldRow label="Name" value={viewingSelf ? (meData?.name ?? '—') : 'Pending endpoint'} />
            <FieldRow label="Email" value={viewingSelf ? (meData?.email ?? '—') : 'Pending endpoint'} />
            <FieldRow label="Status" value={<StatusPill status="active" />} />
          </dl>
        </AdminCard>

        <AdminCard title="Role Assignment" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {roleOptions.map((role) => (
              <label
                key={role}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
              >
                <span className="text-sm font-medium">{role}</span>
                <input type="checkbox" className="h-4 w-4" defaultChecked={role === 'Admin' && viewingSelf} />
              </label>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Permissions Matrix Placeholder">
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Capability</th>
                <th className="px-4 py-3 font-medium">Grant</th>
              </tr>
            </thead>
            <tbody>
              {['Manage Branding', 'Manage Users', 'Manage Catalog', 'Publish Reports', 'View Audit Logs'].map((capability) => (
                <tr key={capability} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">{capability}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">Placeholder</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
