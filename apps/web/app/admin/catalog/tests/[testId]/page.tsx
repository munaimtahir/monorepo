'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminCard } from '@/components/admin/AdminCard';
import { DataTableShell } from '@/components/admin/DataTableShell';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusPill } from '@/components/admin/StatusPill';
import { parseApiError } from '@/lib/api-errors';
import { client } from '@/lib/sdk/client';
import { adminKeys } from '@/lib/sdk/hooks';
import type { paths } from '@vexel/contracts';

type LabTest = paths['/lab/tests/{testId}']['get']['responses'][200]['content']['application/json'];
type LabTestParameters =
  paths['/lab/tests/{testId}/parameters']['get']['responses'][200]['content']['application/json'];

const detailTabs = ['Details', 'Reference Ranges', 'Audit', 'History'] as const;

export default function CatalogTestDetailPage() {
  const params = useParams<{ testId: string }>();
  const testId = typeof params.testId === 'string' ? params.testId : '';

  const { data: testData, error: testError } = useQuery({
    queryKey: adminKeys.test(testId),
    enabled: testId.length > 0,
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests/{testId}', {
        params: { path: { testId } },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load test detail').message);
      return data as LabTest;
    },
  });

  const { data: parametersData, error: paramsError } = useQuery({
    queryKey: adminKeys.testParameters(testId),
    enabled: testId.length > 0,
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests/{testId}/parameters', {
        params: { path: { testId } },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load test parameters').message);
      return data as LabTestParameters;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Detail"
        subtitle="Summary, parameters, and workflow placeholders for a single test definition."
        actions={
          <>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              Edit
            </button>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              Archive
            </button>
            <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">
              Export
            </button>
          </>
        }
      />

      {testError ? (
        <NoticeBanner title="Unable to load test detail" tone="warning">
          {testError instanceof Error ? testError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      {paramsError ? (
        <NoticeBanner title="Unable to load parameters" tone="warning">
          {paramsError instanceof Error ? paramsError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <AdminCard title="Summary">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">ID</p>
            <p className="mt-1 text-sm font-medium">{testData?.id ?? testId ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Code</p>
            <p className="mt-1 text-sm font-medium">{testData?.code ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Name</p>
            <p className="mt-1 text-sm font-medium">{testData?.name ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</p>
            <div className="mt-1">
              <StatusPill status={testData?.active ? 'active' : 'inactive'} />
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Tabs Placeholder">
        <div className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => (
            <button
              key={tab}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </AdminCard>

      <DataTableShell
        title="Parameters"
        subtitle="Contract endpoint: `GET /lab/tests/{testId}/parameters`"
        isEmpty={(parametersData?.data ?? []).length === 0}
        emptyTitle="No parameters for this test"
        emptyDescription="Add parameters through backend command flows when enabled."
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Range</th>
              <th className="px-4 py-3 font-medium">Display Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(parametersData?.data ?? []).map((parameter) => (
              <tr key={parameter.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3">{parameter.name}</td>
                <td className="px-4 py-3">{parameter.unit ?? '—'}</td>
                <td className="px-4 py-3">
                  {parameter.refLow != null || parameter.refHigh != null
                    ? `${parameter.refLow ?? '—'} to ${parameter.refHigh ?? '—'}`
                    : parameter.refText ?? '—'}
                </td>
                <td className="px-4 py-3">{parameter.displayOrder}</td>
                <td className="px-4 py-3">
                  <StatusPill status={parameter.active ? 'active' : 'inactive'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
