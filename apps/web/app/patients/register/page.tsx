'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/api';
import { useState } from 'react';

type PatientForm = {
    name: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    phone: string;
};

export default function RegisterPatientPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<PatientForm>();
    const router = useRouter();
    const [error, setError] = useState('');

    const onSubmit = async (data: PatientForm) => {
        const { error: apiError } = await client.POST('/patients', {
            body: data
        });

        if (apiError) {
            setError('Failed to register patient');
            return;
        }

        router.push('/patients');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Register Patient</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 shadow rounded">
                <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input
                        {...register('name', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.name && <span className="text-red-500 text-sm">Required</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Date of Birth</label>
                    <input
                        type="date"
                        {...register('dob', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.dob && <span className="text-red-500 text-sm">Required</span>}
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
                </div>

                <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                        {...register('phone')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
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
