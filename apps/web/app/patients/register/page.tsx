'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/api';
import { useState } from 'react';
import { parseApiError, type FieldErrors } from '@/lib/api-errors';
import type { paths } from '@vexel/contracts';

type PatientForm = {
    name: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    phone: string;
};

type CreatedPatient = paths['/patients']['post']['responses'][201]['content']['application/json'];

export default function RegisterPatientPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<PatientForm>();
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [successMessage, setSuccessMessage] = useState('');

    const onSubmit = async (data: PatientForm) => {
        setError('');
        setFieldErrors({});
        setSuccessMessage('');

        const { data: created, error: apiError } = await client.POST('/patients', {
            body: data
        });

        if (apiError) {
            const parsed = parseApiError(apiError, 'Failed to register patient');
            setError(parsed.message);
            setFieldErrors(parsed.fieldErrors);
            return;
        }

        if (!created) {
            setError('Failed to register patient');
            return;
        }

        setSuccessMessage(`Patient registered. Reg #: ${created.regNo ?? '—'}`);
        if (created.id) {
            setTimeout(() => router.push(`/patients/${created.id}`), 800);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Register Patient</h1>
            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700" role="alert">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-800" role="status">
                    {successMessage} Redirecting to patient detail…
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 shadow rounded">
                <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input
                        {...register('name', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.name && <span className="text-red-500 text-sm">Required</span>}
                    {fieldErrors.name?.map((message) => (
                        <span key={message} className="text-red-500 text-sm block">{message}</span>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium">Date of Birth</label>
                    <input
                        type="date"
                        {...register('dob', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.dob && <span className="text-red-500 text-sm">Required</span>}
                    {fieldErrors.dob?.map((message) => (
                        <span key={message} className="text-red-500 text-sm block">{message}</span>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select
                        {...register('gender', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.gender && <span className="text-red-500 text-sm">Required</span>}
                    {fieldErrors.gender?.map((message) => (
                        <span key={message} className="text-red-500 text-sm block">{message}</span>
                    ))}
                </div>

                <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                        {...register('phone')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {fieldErrors.phone?.map((message) => (
                        <span key={message} className="text-red-500 text-sm block">{message}</span>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Register
                </button>
            </form>
        </div>
    );
}
