'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/api';
import { useState } from 'react';

// Define FormData structure based on openapi schema if possible, or manual
type FormData = {
    email: string;
    pass: string;
    tenantId: string;
};

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const router = useRouter();
    const [error, setError] = useState('');

    const onSubmit = async (data: FormData) => {
        // We send tenantId in header (or set it in localStorage before request)
        // For login, we need to pass tenantId somehow.
        // Our API AuthGuard checks header.
        // So we manually store it temporarily? 
        // Wait, client.POST uses middleware which reads from localStorage.
        // So we need to set localStorage BEFORE request if we rely on middleware.
        localStorage.setItem('vexel_tenant_id', data.tenantId);

        const { data: resData, error: apiError } = await client.POST('/auth/login', {
            body: {
                email: data.email,
                password: data.pass,
            },
        });

        if (apiError) {
            setError('Login failed');
            return;
        }

        if (resData && resData.access_token) {
            localStorage.setItem('vexel_token', resData.access_token);
            // user info...
            router.push('/patients');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-6">Login to Vexel</h1>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Tenant ID (UUID)</label>
                        <input
                            {...register('tenantId', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            placeholder="Enter Tenant ID"
                        />
                        {errors.tenantId && <span className="text-red-500 text-sm">Required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            {...register('email', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            placeholder="user@example.com"
                        />
                        {errors.email && <span className="text-red-500 text-sm">Required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            {...register('pass', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                        />
                        {errors.pass && <span className="text-red-500 text-sm">Required</span>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
