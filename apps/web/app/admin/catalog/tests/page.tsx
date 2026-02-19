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

type LabTestsResponse = paths['/lab/tests']['get']['responses'][200]['content']['application/json'];

export default function CatalogTestsPage() {
  const { data, error } = useQuery({
    queryKey: adminKeys.tests(),
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests');
      if (error) throw new Error(parseApiError(error, 'Failed to load tests').message);
      return data as LabTestsResponse;
    },
  });

  const tests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Tests" subtitle="Tenant LAB test catalog list." />

      {error ? (
        <NoticeBanner title="Unable to load tests" tone="warning">
          {error instanceof Error ? error.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <DataTableShell
        title="Test Definitions"
        subtitle="Contract endpoint: `GET /lab/tests`"
        isEmpty={tests.length === 0}
        emptyTitle="No tests found"
        emptyDescription="Create tests via backend command endpoints or API tooling."
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-medium">{test.code}</td>
                <td className="px-4 py-3">{test.name}</td>
                <td className="px-4 py-3">{test.department}</td>
                <td className="px-4 py-3">
                  <StatusPill status={test.active ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-3">{new Date(test.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link
                    href={adminRoutes.catalogTestDetail(test.id)}
                    className="text-sm font-medium text-[var(--accent)]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
