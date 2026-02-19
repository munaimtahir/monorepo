'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/sdk/client';
import { parseApiError } from '@/lib/api-errors';
import { operatorRoutes } from '@/lib/operator/routes';
import { EncounterHeader } from '@/components/operator/EncounterHeader';
import { mapIdentityHeader } from '@/lib/identity/mapIdentity';
import { operatorKeys } from '@/lib/sdk/hooks';
import type { paths } from '@vexel/contracts';

type Encounter = paths['/encounters/{id}']['get']['responses'][200]['content']['application/json'];
type Patient = paths['/patients/{id}']['get']['responses'][200]['content']['application/json'];

export default function OperatorVerifyDetailPage() {
  const params = useParams<{ encounterId: string }>();
  const encounterId = typeof params?.encounterId === 'string' ? params.encounterId : '';
  const queryClient = useQueryClient();

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

  const verifyMutation = useMutation({
    mutationFn: async (orderItemId: string) => {
      const { error } = await client.POST('/encounters/{id}:lab-verify', {
        params: { path: { id: encounterId } },
        body: { orderItemId },
      });
      if (error) throw new Error(parseApiError(error, 'Verification failed').message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter', encounterId] });
      queryClient.invalidateQueries({ queryKey: operatorKeys.verificationQueue() });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await client.POST('/encounters/{id}:lab-publish', {
        params: { path: { id: encounterId } },
      });
      if (error) throw new Error(parseApiError(error, 'Publish failed').message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter', encounterId] });
    },
  });

  const identityProps = mapIdentityHeader({
    patient: patient as unknown as Record<string, unknown>,
    encounter: encounter as unknown as Record<string, unknown>,
  });
  const status = encounter?.labEncounterStatus ?? encounter?.status ?? null;

  if (encLoading || !encounterId) {
    return <div><p className="text-gray-500">Loading encounter…</p></div>;
  }

  if (encError || !encounter) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Encounter not found</h1>
        <p className="text-red-600">{encError instanceof Error ? encError.message : 'Not found'}</p>
        <Link href={operatorRoutes.verify} className="mt-4 inline-block text-blue-600 hover:underline">Back to verify</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Verify · Encounter</h1>
        <Link href={operatorRoutes.verify} className="text-blue-600 hover:underline">Back to verify</Link>
      </div>
      <div className="mb-6">
        <EncounterHeader {...identityProps} status={status} />
      </div>
      <div className="rounded border bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold">Verification checklist</h2>
        <p className="text-sm text-gray-600">TODO: List order items and per-item verify action. Command endpoints exist: lab-verify (per order item), lab-publish.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="rounded bg-gray-400 px-4 py-2 text-sm text-white cursor-not-allowed"
            title="Use per–order-item verify on this page or encounter detail; Mark Verified here is a bulk placeholder."
          >
            Mark Verified (TODO: bulk or wire per item)
          </button>
          <button
            type="button"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {publishMutation.isPending ? 'Publishing…' : 'Publish report'}
          </button>
        </div>
        {verifyMutation.isError && (
          <p className="text-sm text-red-600">{verifyMutation.error instanceof Error ? verifyMutation.error.message : 'Verify failed'}</p>
        )}
        {publishMutation.isError && (
          <p className="text-sm text-red-600">{publishMutation.error instanceof Error ? publishMutation.error.message : 'Publish failed'}</p>
        )}
      </div>
    </div>
  );
}
