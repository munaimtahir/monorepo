'use client';

import Link from 'next/link';
import { DataTableShell } from '@/components/admin/DataTableShell';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { adminRoutes } from '@/lib/admin/routes';

export default function CatalogPanelsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Panels"
        subtitle="Panel definitions scaffold."
        actions={
          <button className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]">
            Create Panel
          </button>
        }
      />

      <NoticeBanner title="Requires backend contract endpoints" tone="warning">
        Panel list/detail/create endpoints are missing from current OpenAPI contract.
      </NoticeBanner>

      <DataTableShell
        title="Panel Definitions"
        subtitle="Scaffold table"
        isEmpty
        emptyTitle="No panel API yet"
        emptyDescription="Add panel contract endpoints to populate this page."
      />

      <div>
        <Link href={adminRoutes.catalogPanelDetail('panel-placeholder')} className="text-sm font-medium text-[var(--accent)]">
          Open placeholder panel detail
        </Link>
      </div>
    </div>
  );
}
