'use client';

import { useParams } from 'next/navigation';
import { AdminCard } from '@/components/admin/AdminCard';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusPill } from '@/components/admin/StatusPill';

const detailTabs = ['Details', 'Reference Ranges', 'Audit', 'History'] as const;

export default function PanelDetailPage() {
  const params = useParams<{ panelId: string }>();
  const panelId = typeof params.panelId === 'string' ? params.panelId : 'unknown-panel';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Detail"
        subtitle="Panel composition scaffold for tests and result grouping."
        actions={
          <>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              Edit
            </button>
            <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium">
              Archive
            </button>
            <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">
              Export
            </button>
          </>
        }
      />

      <NoticeBanner title="Requires backend contract endpoint" tone="warning">
        Panel detail endpoint is not available in OpenAPI.
      </NoticeBanner>

      <AdminCard title="Summary">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">ID</p>
            <p className="mt-1 text-sm font-medium">{panelId}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Code</p>
            <p className="mt-1 text-sm font-medium">Pending endpoint</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Name</p>
            <p className="mt-1 text-sm font-medium">Pending endpoint</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</p>
            <div className="mt-1">
              <StatusPill status="pending" />
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Tabs Placeholder">
        <div className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => (
            <button key={tab} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              {tab}
            </button>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
