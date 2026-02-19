'use client';

import Link from 'next/link';
import { StatusPill } from './StatusPill';

export type WorklistRow = {
  encounterId: string;
  regNo: string;
  patientName: string;
  encounterCode: string;
  /** Backend status (e.g. labEncounterStatus or status) */
  status: string | null | undefined;
  updated: string;
};

type WorklistTableProps = {
  rows: WorklistRow[];
  detailHref: (encounterId: string) => string;
  emptyMessage?: string;
};

export function WorklistTable({
  rows,
  detailHref,
  emptyMessage = 'No items.',
}: WorklistTableProps) {
  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Reg #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Visit / Encounter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row) => (
            <tr key={row.encounterId} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {row.regNo || '—'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {row.patientName || '—'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                {row.encounterCode || '—'}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusPill status={row.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {row.updated}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <Link
                  href={detailHref(row.encounterId)}
                  className="text-blue-600 hover:underline"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
