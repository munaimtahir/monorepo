'use client';

import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sdk/client';
import { parseApiError } from '@/lib/api-errors';
import { operatorRoutes } from '@/lib/operator/routes';
import { WorklistTable, type WorklistRow } from '@/components/operator/WorklistTable';
import type { paths } from '@vexel/contracts';

type EncountersResponse =
  paths['/encounters']['get']['responses'][200]['content']['application/json'];
type Encounter = NonNullable<NonNullable<EncountersResponse['data']>[number]>;

export default function OperatorPublishedReportsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['operator', 'reports', 'published'],
    queryFn: async () => {
      const { data: res, error: apiError } = await client.GET('/encounters', {
        params: { query: { type: 'LAB' } },
      });
      if (apiError) {
        throw new Error(parseApiError(apiError, 'Failed to load reports').message);
      }
      return res as EncountersResponse;
    },
  });

  const allEncounters = (data?.data ?? []) as Encounter[];
  const published = allEncounters.filter(
    (enc) => enc.labEncounterStatus === 'PUBLISHED' || enc.status === 'DOCUMENTED'
  );
  const rows: WorklistRow[] = published.map((enc) => ({
    encounterId: enc.id,
    regNo: '—',
    patientName: '—',
    encounterCode: enc.encounterCode ?? '—',
    status: enc.labEncounterStatus ?? enc.status,
    updated: enc.createdAt ? new Date(enc.createdAt).toLocaleString() : '—',
  }));

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Published reports</h1>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Published reports</h1>
        <p className="text-red-600">{error instanceof Error ? error.message : 'Error loading list'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Published reports</h1>
      <p className="text-gray-600 mb-4">
        LAB encounters with published reports. TODO: dedicated endpoint for published reports list when available.
      </p>
      <WorklistTable
        rows={rows}
        detailHref={operatorRoutes.publishedReportDetail}
        emptyMessage="No published reports."
      />
    </div>
  );
}
