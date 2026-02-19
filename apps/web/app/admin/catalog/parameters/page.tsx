'use client';

import { useEffect, useMemo, useState } from 'react';
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
type LabTestParameters =
  paths['/lab/tests/{testId}/parameters']['get']['responses'][200]['content']['application/json'];

export default function CatalogParametersPage() {
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  const { data: testsData, error: testsError } = useQuery({
    queryKey: adminKeys.tests(),
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests');
      if (error) throw new Error(parseApiError(error, 'Failed to load tests').message);
      return data as LabTestsResponse;
    },
  });

  useEffect(() => {
    if (!selectedTestId && testsData?.data?.[0]?.id) {
      setSelectedTestId(testsData.data[0].id);
    }
  }, [selectedTestId, testsData]);

  const selectedTest = useMemo(
    () => (testsData?.data ?? []).find((test) => test.id === selectedTestId),
    [selectedTestId, testsData],
  );

  const { data: parametersData, error: parametersError } = useQuery({
    queryKey: adminKeys.testParameters(selectedTestId),
    enabled: selectedTestId.length > 0,
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests/{testId}/parameters', {
        params: {
          path: {
            testId: selectedTestId,
          },
        },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load parameters').message);
      return data as LabTestParameters;
    },
  });

  const parameters = parametersData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Parameters" subtitle="Cross-test parameter management scaffold." />

      <NoticeBanner title="Global parameter endpoints are missing" tone="warning">
        Contract currently supports test-scoped parameter listing only (`GET /lab/tests/:testId/parameters`).
      </NoticeBanner>

      {testsError ? (
        <NoticeBanner title="Unable to load tests" tone="warning">
          {testsError instanceof Error ? testsError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      {parametersError ? (
        <NoticeBanner title="Unable to load parameters for selected test" tone="warning">
          {parametersError instanceof Error ? parametersError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <DataTableShell
        title="Test-Scoped Parameters"
        subtitle="Select a test to inspect parameters until global endpoints are added."
        isEmpty={parameters.length === 0}
        emptyTitle="No parameters found"
        emptyDescription="Add parameter definitions to this test or choose another test."
        toolbar={
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Test
            <select
              value={selectedTestId}
              onChange={(event) => setSelectedTestId(event.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
            >
              {(testsData?.data ?? []).map((test) => (
                <option key={test.id} value={test.id}>
                  {test.code} · {test.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Parameter</th>
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((parameter) => (
              <tr key={parameter.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3">{parameter.name}</td>
                <td className="px-4 py-3">{selectedTest?.name ?? '—'}</td>
                <td className="px-4 py-3">{parameter.unit ?? '—'}</td>
                <td className="px-4 py-3">
                  {parameter.refText ??
                    (parameter.refLow != null || parameter.refHigh != null
                      ? `${parameter.refLow ?? '—'} to ${parameter.refHigh ?? '—'}`
                      : '—')}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={parameter.active ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={adminRoutes.catalogParameterDetail(parameter.id)}
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
