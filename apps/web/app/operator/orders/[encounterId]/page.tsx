'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/sdk/client';
import { parseApiError } from '@/lib/api-errors';
import { operatorRoutes } from '@/lib/operator/routes';
import { EncounterHeader } from '@/components/operator/EncounterHeader';
import { mapIdentityHeader } from '@/lib/identity/mapIdentity';
import type { paths } from '@vexel/contracts';

type Encounter = paths['/encounters/{id}']['get']['responses'][200]['content']['application/json'];
type Patient = paths['/patients/{id}']['get']['responses'][200]['content']['application/json'];
type ListLabTestsResponse =
  paths['/lab/tests']['get']['responses'][200]['content']['application/json'];
type ListEncounterLabTestsResponse =
  paths['/encounters/{id}/lab-tests']['get']['responses'][200]['content']['application/json'];
type AddTestToEncounterRequest =
  NonNullable<
    paths['/encounters/{id}:lab-add-test']['post']['requestBody']
  >['content']['application/json'];

export default function OperatorOrdersDetailPage() {
  const params = useParams<{ encounterId: string }>();
  const router = useRouter();
  const encounterId = typeof params?.encounterId === 'string' ? params.encounterId : '';
  const queryClient = useQueryClient();

  const [selectedLabTestId, setSelectedLabTestId] = useState('');
  const [addTestError, setAddTestError] = useState('');

  const { data: encounter, isLoading: encLoading, error: encError } = useQuery({
    queryKey: ['encounter', encounterId],
    enabled: !!encounterId,
    queryFn: async () => {
      const { data, error } = await client.GET('/encounters/{id}', {
        params: { path: { id: encounterId } },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load encounter').message);
      if (!data) throw new Error('Encounter not found');
      return data as Encounter;
    },
  });

  const { data: patient } = useQuery({
    queryKey: ['patient', encounter?.patientId],
    enabled: !!encounter?.patientId,
    queryFn: async () => {
      const { data, error } = await client.GET('/patients/{id}', {
        params: { path: { id: encounter!.patientId } },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load patient').message);
      return data as Patient;
    },
  });

  const { data: labCatalog, isLoading: labCatalogLoading } = useQuery<ListLabTestsResponse>({
    queryKey: ['lab-catalog-tests'],
    enabled: Boolean(encounterId && encounter?.type === 'LAB'),
    queryFn: async () => {
      const { data, error } = await client.GET('/lab/tests');
      if (error) throw new Error(parseApiError(error, 'Failed to load LAB catalog').message);
      return data ?? { data: [], total: 0 };
    },
  });

  const { data: encounterLabTests, refetch: refetchEncounterLabTests } = useQuery<ListEncounterLabTestsResponse>({
    queryKey: ['encounter-lab-tests', encounterId],
    enabled: Boolean(encounterId && encounter?.type === 'LAB'),
    queryFn: async () => {
      if (!encounterId) return { data: [], total: 0 };
      const { data, error } = await client.GET('/encounters/{id}/lab-tests', {
        params: { path: { id: encounterId } },
      });
      if (error) throw new Error(parseApiError(error, 'Failed to load ordered tests').message);
      return data ?? { data: [], total: 0 };
    },
  });

  useEffect(() => {
    if (labCatalog?.data?.length && !selectedLabTestId) {
      setSelectedLabTestId(labCatalog.data[0].id);
    }
  }, [labCatalog?.data, selectedLabTestId]);

  const addLabTest = useMutation({
    mutationFn: async () => {
      if (!encounterId || !selectedLabTestId) {
        throw new Error('Select a test to add');
      }
      const body: AddTestToEncounterRequest = {
        testId: selectedLabTestId,
      };
      const { error } = await client.POST('/encounters/{id}:lab-add-test', {
        params: { path: { id: encounterId } },
        body,
      });
      if (error) {
        throw new Error(parseApiError(error, 'Failed to add test').message);
      }
    },
    onSuccess: async () => {
      setAddTestError('');
      await refetchEncounterLabTests();
      await queryClient.invalidateQueries({ queryKey: ['encounter', encounterId] });
    },
    onError: (error) => {
      setAddTestError(error instanceof Error ? error.message : 'Failed to add test');
    },
  });

  const identityProps = mapIdentityHeader({
    patient: patient as unknown as Record<string, unknown>,
    encounter: encounter as unknown as Record<string, unknown>,
  });
  const status = encounter?.labEncounterStatus ?? encounter?.status ?? null;
  const orderedTests = encounterLabTests?.data ?? [];

  if (encLoading || !encounterId) {
    return (
      <div>
        <p className="text-gray-500">Loading encounter…</p>
      </div>
    );
  }

  if (encError || !encounter) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Encounter not found</h1>
        <p className="text-red-600">{encError instanceof Error ? encError.message : 'Not found'}</p>
        <Link href={operatorRoutes.worklist} className="mt-4 inline-block text-blue-600 hover:underline">
          Back to worklist
        </Link>
      </div>
    );
  }

  if (encounter.type !== 'LAB') {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Invalid Encounter Type</h1>
        <p className="text-red-600">This page is only for LAB encounters.</p>
        <Link href={operatorRoutes.worklist} className="mt-4 inline-block text-blue-600 hover:underline">
          Back to worklist
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders · Add Tests</h1>
        <Link href={operatorRoutes.worklist} className="text-blue-600 hover:underline">
          Back to worklist
        </Link>
      </div>
      <div className="mb-6">
        <EncounterHeader {...identityProps} status={status} />
      </div>
      <div className="rounded border bg-white p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Add LAB Tests to Order</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select tests from the catalog and add them to this encounter. After adding tests, proceed to sample collection.
        </p>

        {addTestError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {addTestError}
          </div>
        )}

        {labCatalogLoading ? (
          <p className="text-sm text-gray-600">Loading LAB catalog…</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1">
                <label className="block text-sm font-medium mb-1">Catalog test</label>
                <select
                  value={selectedLabTestId}
                  onChange={(e) => {
                    setSelectedLabTestId(e.target.value);
                    setAddTestError('');
                  }}
                  className="block w-full rounded border border-gray-300 p-2 text-sm"
                >
                  {(labCatalog?.data ?? []).map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.department} – {test.name} ({test.code})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => addLabTest.mutate()}
                disabled={addLabTest.isPending || !selectedLabTestId}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {addLabTest.isPending ? 'Adding…' : 'Add to order'}
              </button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Ordered tests ({orderedTests.length})</p>
              {orderedTests.length === 0 ? (
                <p className="text-sm text-gray-500">No tests added yet. Add at least one test before proceeding to sample collection.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {orderedTests.map((item) => (
                    <li key={item.orderItem.id}>
                      {item.test.name} ({item.test.code})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {orderedTests.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Tests have been added to the order. You can now proceed to sample collection.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={operatorRoutes.samplesDetail(encounterId)}
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Continue to Sample Collection →
                  </Link>
                  <Link
                    href={`/encounters/${encounterId}`}
                    className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
                  >
                    View Full Encounter
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
