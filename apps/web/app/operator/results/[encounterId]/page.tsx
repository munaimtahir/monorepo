'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/sdk/client';
import { parseApiError } from '@/lib/api-errors';
import { operatorRoutes } from '@/lib/operator/routes';
import { operatorKeys } from '@/lib/sdk/hooks';
import { EncounterHeader } from '@/components/operator/EncounterHeader';
import { StatusPill } from '@/components/operator/StatusPill';
import { mapIdentityHeader } from '@/lib/identity/mapIdentity';
import type { paths } from '@vexel/contracts';

type Encounter = paths['/encounters/{id}']['get']['responses'][200]['content']['application/json'];
type Patient = paths['/patients/{id}']['get']['responses'][200]['content']['application/json'];
type EncounterLabTestsResponse =
  paths['/encounters/{id}/lab-tests']['get']['responses'][200]['content']['application/json'];
type OrderedTest = EncounterLabTestsResponse['data'][number];
type EnterLabResultsRequest =
  NonNullable<
    paths['/encounters/{id}:lab-enter-results']['post']['requestBody']
  >['content']['application/json'];

type ResultDraftMap = Record<string, Record<string, string>>;

function formatReferenceRange(orderedTest: OrderedTest, parameterId: string): string {
  const parameter = orderedTest.parameters.find((item) => item.id === parameterId);
  if (!parameter) {
    return '—';
  }
  if (parameter.refText && parameter.refText.trim().length > 0) {
    return parameter.refText;
  }
  const low = parameter.refLow;
  const high = parameter.refHigh;
  if (low == null && high == null) {
    return '—';
  }
  if (low != null && high != null) {
    return `${low} - ${high}`;
  }
  if (low != null) {
    return `>= ${low}`;
  }
  return `<= ${high}`;
}

export default function OperatorResultsEntryDetailPage() {
  const params = useParams<{ encounterId: string }>();
  const encounterId = typeof params?.encounterId === 'string' ? params.encounterId : '';
  const queryClient = useQueryClient();

  const [resultDrafts, setResultDrafts] = useState<ResultDraftMap>({});
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [savingDraftOrderItemId, setSavingDraftOrderItemId] = useState<string | null>(null);
  const [submittingOrderItemId, setSubmittingOrderItemId] = useState<string | null>(null);

  const draftStorageKey = useMemo(
    () => `operator.result-entry.drafts.${encounterId}`,
    [encounterId],
  );

  const { data: encounter, isLoading: encLoading, error: encError } = useQuery({
    queryKey: ['encounter', encounterId],
    enabled: !!encounterId,
    queryFn: async () => {
      const { data, error } = await client.GET('/encounters/{id}', {
        params: { path: { id: encounterId } },
      });
      if (error) {
        throw new Error(parseApiError(error, 'Failed to load encounter').message);
      }
      if (!data) {
        throw new Error('Encounter not found');
      }
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
      if (error) {
        throw new Error(parseApiError(error, 'Failed to load patient').message);
      }
      return data as Patient;
    },
  });

  const {
    data: encounterLabTests,
    isLoading: testsLoading,
    error: testsError,
    refetch: refetchEncounterLabTests,
  } = useQuery({
    queryKey: ['encounter-lab-tests', encounterId],
    enabled: !!encounterId,
    queryFn: async () => {
      const { data, error } = await client.GET('/encounters/{id}/lab-tests', {
        params: { path: { id: encounterId } },
      });
      if (error) {
        throw new Error(parseApiError(error, 'Failed to load ordered tests').message);
      }
      return (data ?? { data: [], total: 0 }) as EncounterLabTestsResponse;
    },
  });

  const orderedTests = encounterLabTests?.data ?? [];

  useEffect(() => {
    if (!orderedTests.length) {
      return;
    }

    let localDrafts: ResultDraftMap = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(draftStorageKey);
        if (saved) {
          localDrafts = JSON.parse(saved) as ResultDraftMap;
        }
      } catch {
        localDrafts = {};
      }
    }

    setResultDrafts((previous) => {
      const nextDrafts: ResultDraftMap = { ...previous };

      for (const orderedTest of orderedTests) {
        const existingDraft = nextDrafts[orderedTest.orderItem.id] ?? {};
        const fromLocal = localDrafts[orderedTest.orderItem.id] ?? {};
        const resultByParameterId = new Map(
          orderedTest.results.map((result) => [result.parameterId, result.value]),
        );

        const mergedDraft: Record<string, string> = {};
        for (const parameter of orderedTest.parameters) {
          if (existingDraft[parameter.id] !== undefined) {
            mergedDraft[parameter.id] = existingDraft[parameter.id];
            continue;
          }
          if (fromLocal[parameter.id] !== undefined) {
            mergedDraft[parameter.id] = fromLocal[parameter.id];
            continue;
          }
          mergedDraft[parameter.id] = resultByParameterId.get(parameter.id) ?? '';
        }

        nextDrafts[orderedTest.orderItem.id] = mergedDraft;
      }

      return nextDrafts;
    });
  }, [orderedTests, draftStorageKey]);

  useEffect(() => {
    if (!encounterId || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(draftStorageKey, JSON.stringify(resultDrafts));
  }, [encounterId, draftStorageKey, resultDrafts]);

  const identityProps = mapIdentityHeader({
    patient: patient as unknown as Record<string, unknown>,
    encounter: encounter as unknown as Record<string, unknown>,
  });
  const status = encounter?.labEncounterStatus ?? encounter?.status ?? null;
  const readyForVerification = orderedTests.length > 0 &&
    orderedTests.every(
      (item) =>
        item.orderItem.status === 'RESULTS_ENTERED' ||
        item.orderItem.status === 'VERIFIED',
    );

  if (encLoading || !encounterId) {
    return <div><p className="text-gray-500">Loading encounter…</p></div>;
  }

  if (encError || !encounter) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Encounter not found</h1>
        <p className="text-red-600">
          {encError instanceof Error ? encError.message : 'Not found'}
        </p>
        <Link href={operatorRoutes.resultsEntry} className="mt-4 inline-block text-blue-600 hover:underline">
          Back to result entry
        </Link>
      </div>
    );
  }

  if (testsError) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Result entry · Encounter</h1>
        <p className="text-red-600">
          {testsError instanceof Error ? testsError.message : 'Failed to load ordered tests'}
        </p>
        <Link href={operatorRoutes.resultsEntry} className="mt-4 inline-block text-blue-600 hover:underline">
          Back to result entry
        </Link>
      </div>
    );
  }

  const updateDraftValue = (orderItemId: string, parameterId: string, value: string) => {
    setResultDrafts((previous) => ({
      ...previous,
      [orderItemId]: {
        ...(previous[orderItemId] ?? {}),
        [parameterId]: value,
      },
    }));
  };

  const buildResultItems = (
    orderedTest: OrderedTest,
    mode: 'draft' | 'submit',
  ): EnterLabResultsRequest['results'] => {
    const draftByParameterId = resultDrafts[orderedTest.orderItem.id] ?? {};
    const items = orderedTest.parameters.map((parameter) => ({
      parameterId: parameter.id,
      value: (draftByParameterId[parameter.id] ?? '').trim(),
    }));

    if (mode === 'draft') {
      return items.filter((item) => item.value.length > 0);
    }

    return items;
  };

  const saveDraft = async (orderedTest: OrderedTest) => {
    if (orderedTest.orderItem.status === 'VERIFIED') {
      setActionError('Results are locked after verification.');
      return;
    }

    const resultItems = buildResultItems(orderedTest, 'draft');
    if (resultItems.length === 0) {
      setActionError('Enter at least one value before saving draft.');
      setActionSuccess('');
      return;
    }

    setActionError('');
    setActionSuccess('');
    setSavingDraftOrderItemId(orderedTest.orderItem.id);

    const body: EnterLabResultsRequest = {
      orderItemId: orderedTest.orderItem.id,
      results: resultItems,
    };

    const { error } = await client.POST('/encounters/{id}:lab-enter-results', {
      params: { path: { id: encounter.id } },
      body,
    });

    setSavingDraftOrderItemId(null);

    if (error) {
      setActionError(parseApiError(error, 'Failed to save draft').message);
      return;
    }

    setActionSuccess(`Draft saved for ${orderedTest.test.name}.`);
    await Promise.all([
      refetchEncounterLabTests(),
      queryClient.invalidateQueries({ queryKey: operatorKeys.resultEntryQueue() }),
    ]);
  };

  const submitForVerification = async (orderedTest: OrderedTest) => {
    if (orderedTest.orderItem.status === 'VERIFIED') {
      setActionError('Results are already verified.');
      return;
    }

    const resultItems = buildResultItems(orderedTest, 'submit');
    const missingCount = resultItems.filter((item) => item.value.length === 0).length;
    if (missingCount > 0) {
      setActionError('Fill all parameter values before submitting for verification.');
      setActionSuccess('');
      return;
    }

    setActionError('');
    setActionSuccess('');
    setSubmittingOrderItemId(orderedTest.orderItem.id);

    const body: EnterLabResultsRequest = {
      orderItemId: orderedTest.orderItem.id,
      results: resultItems,
    };

    const { error } = await client.POST('/encounters/{id}:lab-enter-results', {
      params: { path: { id: encounter.id } },
      body,
    });

    setSubmittingOrderItemId(null);

    if (error) {
      setActionError(parseApiError(error, 'Failed to submit results').message);
      return;
    }

    setActionSuccess(`Results submitted for ${orderedTest.test.name}.`);
    await Promise.all([
      refetchEncounterLabTests(),
      queryClient.invalidateQueries({ queryKey: operatorKeys.resultEntryQueue() }),
      queryClient.invalidateQueries({ queryKey: operatorKeys.verificationQueue() }),
    ]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Result Entry · Encounter</h1>
        <Link href={operatorRoutes.resultsEntry} className="text-blue-600 hover:underline">
          Back to result entry
        </Link>
      </div>
      <div className="mb-6">
        <EncounterHeader {...identityProps} status={status} />
      </div>

      {actionError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="rounded border bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold">Result entry table</h2>
        <p className="text-sm text-gray-600">
          Save Draft stores partial values. Submit for Verification requires all parameters and moves
          test status to RESULTS_ENTERED.
        </p>

        {testsLoading ? (
          <p className="text-sm text-gray-500">Loading ordered tests…</p>
        ) : orderedTests.length === 0 ? (
          <p className="text-sm text-gray-500">No ordered tests found for this encounter.</p>
        ) : (
          <div className="space-y-5">
            {orderedTests.map((orderedTest) => (
              <div key={orderedTest.orderItem.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {orderedTest.test.name} ({orderedTest.test.code})
                    </p>
                    <p className="text-xs text-gray-600">{orderedTest.test.department}</p>
                  </div>
                  <StatusPill status={orderedTest.orderItem.status} />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-3 py-2 text-left font-semibold text-gray-700">Parameter</th>
                        <th className="border px-3 py-2 text-left font-semibold text-gray-700">Unit</th>
                        <th className="border px-3 py-2 text-left font-semibold text-gray-700">Reference</th>
                        <th className="border px-3 py-2 text-left font-semibold text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedTest.parameters.map((parameter) => (
                        <tr key={parameter.id} className="bg-white">
                          <td className="border px-3 py-2 text-gray-700">{parameter.name}</td>
                          <td className="border px-3 py-2 text-gray-700">{parameter.unit ?? '—'}</td>
                          <td className="border px-3 py-2 text-gray-700">
                            {formatReferenceRange(orderedTest, parameter.id)}
                          </td>
                          <td className="border px-3 py-2">
                            <input
                              type="text"
                              value={resultDrafts[orderedTest.orderItem.id]?.[parameter.id] ?? ''}
                              onChange={(event) =>
                                updateDraftValue(
                                  orderedTest.orderItem.id,
                                  parameter.id,
                                  event.target.value,
                                )
                              }
                              disabled={orderedTest.orderItem.status === 'VERIFIED'}
                              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm disabled:bg-gray-100"
                              placeholder="Enter value"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void saveDraft(orderedTest);
                    }}
                    disabled={
                      savingDraftOrderItemId === orderedTest.orderItem.id ||
                      submittingOrderItemId === orderedTest.orderItem.id ||
                      orderedTest.orderItem.status === 'VERIFIED'
                    }
                    className="rounded bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {savingDraftOrderItemId === orderedTest.orderItem.id
                      ? 'Saving Draft…'
                      : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void submitForVerification(orderedTest);
                    }}
                    disabled={
                      savingDraftOrderItemId === orderedTest.orderItem.id ||
                      submittingOrderItemId === orderedTest.orderItem.id ||
                      orderedTest.orderItem.status === 'VERIFIED'
                    }
                    className="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingOrderItemId === orderedTest.orderItem.id
                      ? 'Submitting…'
                      : 'Submit for Verification'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          {readyForVerification ? (
            <Link
              href={operatorRoutes.verifyDetail(encounterId)}
              className="inline-block rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Continue to verification
            </Link>
          ) : (
            <p className="text-sm text-amber-700">
              Complete result entry for all ordered tests before moving to verification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
