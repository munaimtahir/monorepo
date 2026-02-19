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

export default function OperatorSamplesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['operator', 'samples', 'encounters'],
    queryFn: async () => {
      const { data: res, error: apiError } = await client.GET('/encounters', {
        params: { query: { type: 'LAB' } },
      });
      if (apiError) {
        throw new Error(parseApiError(apiError, 'Failed to load samples list').message);
      }
      return res as EncountersResponse;
    },
  });

  const encounters = (data?.data ?? []) as Encounter[];
  const rows: WorklistRow[] = encounters.map((enc) => ({
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
        <h1 className="text-2xl font-bold mb-4">Samples</h1>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Samples</h1>
        <p className="text-red-600">{error instanceof Error ? error.message : 'Error loading list'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Samples</h1>
      <p className="text-gray-600 mb-4">
        Encounters requiring sample action. TODO: filter by backend when contract supports (e.g. sample received).
      </p>
      <WorklistTable
        rows={rows}
        detailHref={operatorRoutes.samplesDetail}
        emptyMessage="No encounters."
      />
    </div>
  );
}
