'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { client } from '@/lib/sdk/client';
import { parseApiError, type FieldErrors } from '@/lib/api-errors';
import { operatorRoutes } from '@/lib/operator/routes';
import type { paths } from '@vexel/contracts';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().optional(),
  refBy: z.string().optional(),
  sampleCollected: z.boolean().optional(),
  sampleCollectedAt: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

type CreatedPatient =
  paths['/patients']['post']['responses'][201]['content']['application/json'];
type CreatedEncounter =
  paths['/encounters']['post']['responses'][201]['content']['application/json'];

export default function OperatorRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<{
    patientId: string;
    regNo: string;
    encounterId?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: 'male',
      sampleCollected: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setFieldErrors({});
    setSuccess(null);

    const { data: patient, error: patientError } = await client.POST('/patients', {
      body: {
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone || undefined,
      },
    });

    if (patientError) {
      const parsed = parseApiError(patientError, 'Failed to register patient');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    const createdPatient = patient as CreatedPatient | undefined;
    if (!createdPatient?.id) {
      setError('Patient created but no ID returned');
      return;
    }

    const { data: encounter, error: encounterError } = await client.POST(
      '/encounters',
      {
        body: {
          patientId: createdPatient.id,
          type: 'LAB',
        },
      }
    );

    if (encounterError) {
      setSuccess({
        patientId: createdPatient.id,
        regNo: createdPatient.regNo ?? '—',
      });
      setError('Patient registered. Encounter creation failed: ' + parseApiError(encounterError, 'Create encounter').message);
      return;
    }

    const createdEncounter = encounter as CreatedEncounter | undefined;
    setSuccess({
      patientId: createdPatient.id,
      regNo: createdPatient.regNo ?? '—',
      encounterId: createdEncounter?.id,
    });
    if (createdEncounter?.id) {
      setTimeout(() => router.push(operatorRoutes.worklistDetail(createdEncounter.id)), 1000);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Registration</h1>
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-800" role="status">
          Patient registered. Reg #: {success.regNo}
          {success.encounterId && (
            <> · Redirecting to worklist…</>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded border bg-white p-6 shadow">
        <section>
          <h2 className="text-lg font-semibold mb-3">Patient</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register('name')}
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              {fieldErrors.name?.map((m) => <p key={m} className="mt-1 text-sm text-red-600">{m}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of birth</label>
              <input type="date" {...register('dob')} className="mt-1 block w-full rounded border border-gray-300 p-2" />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select {...register('gender')} className="mt-1 block w-full rounded border border-gray-300 p-2">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input {...register('phone')} className="mt-1 block w-full rounded border border-gray-300 p-2" />
              {fieldErrors.phone?.map((m) => <p key={m} className="mt-1 text-sm text-red-600">{m}</p>)}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Encounter / Order</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ref by (placeholder)</label>
              <input {...register('refBy')} className="mt-1 block w-full rounded border border-gray-300 p-2" placeholder="Optional" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('sampleCollected')} />
              <span className="text-sm">Sample collected</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sample collected at (placeholder)</label>
              <input type="datetime-local" {...register('sampleCollectedAt')} className="mt-1 block w-full rounded border border-gray-300 p-2" />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Register & create order'}
        </button>
      </form>
    </div>
  );
}
