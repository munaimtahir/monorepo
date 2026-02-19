'use client';

import { AdminCard } from '@/components/admin/AdminCard';
import { DataTableShell } from '@/components/admin/DataTableShell';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusPill } from '@/components/admin/StatusPill';

const historyRows = [
  { id: 'job-001', type: 'Import', entity: 'Tests', status: 'success', timestamp: '2026-02-18 10:30' },
  { id: 'job-002', type: 'Export', entity: 'Parameters', status: 'pending', timestamp: '2026-02-18 12:10' },
  { id: 'job-003', type: 'Import', entity: 'Panels', status: 'failed', timestamp: '2026-02-19 09:05' },
];

export default function CatalogImportExportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Import / Export"
        subtitle="XLSX entry points and operation history scaffold."
      />

      <NoticeBanner title="Requires backend contract endpoint" tone="warning">
        Import/export submission and history endpoints are not in current OpenAPI.
      </NoticeBanner>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminCard title="Import XLSX">
          <div className="space-y-3">
            <input type="file" accept=".xlsx" className="block w-full text-sm text-[var(--muted)]" />
            <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">
              Start Import (Scaffold)
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Export XLSX">
          <div className="space-y-3">
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Tests</option>
              <option>Parameters</option>
              <option>Panels</option>
            </select>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)]">
              Generate Export (Scaffold)
            </button>
          </div>
        </AdminCard>
      </div>

      <DataTableShell title="Import / Export History" subtitle="Placeholder history feed" isEmpty={historyRows.length === 0}>
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {historyRows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3">{row.id}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.entity}</td>
                <td className="px-4 py-3">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-4 py-3">{row.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
