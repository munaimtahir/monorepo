'use client';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/api';
import Link from 'next/link';

export default function PatientsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const { data, error } = await client.GET('/patients', {});
            if (error) throw error;
            return data;
        },
    });

    if (isLoading) return <div className="p-8">Loading patients...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading patients</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Patients</h1>
                <Link
                    href="/patients/register"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Register New
                </Link>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.data?.map((patient: any) => (
                            <tr key={patient.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.mrn || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{patient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize">{patient.gender || '-'}</td>
                            </tr>
                        ))}
                        {(!data?.data || data.data.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No patients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
