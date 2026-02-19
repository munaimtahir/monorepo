'use client';

import { AdminCard } from '@/components/admin/AdminCard';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { SectionTitle } from '@/components/admin/SectionTitle';

export default function CatalogLinkingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Linking Workflow"
        subtitle="Scaffold flow for linking tests, parameters, and reference ranges."
      />

      <NoticeBanner title="Workflow APIs pending" tone="warning">
        No dedicated linking endpoints are currently exposed in OpenAPI.
      </NoticeBanner>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AdminCard title="Step 1 · Select Test">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Test</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Placeholder test selector</option>
            </select>
          </label>
        </AdminCard>

        <AdminCard title="Step 2 · Select Parameters">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Parameters</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Placeholder parameter selector</option>
            </select>
          </label>
        </AdminCard>

        <AdminCard title="Step 3 · Set Reference Ranges">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Range Profile</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              <option>Placeholder range selector</option>
            </select>
          </label>
        </AdminCard>
      </div>

      <AdminCard title="Linking Notes">
        <SectionTitle title="Workflow" subtitle="Define link mappings between tests, parameter sets, and age/sex-specific ranges." />
        <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>Select a test or panel context.</li>
          <li>Attach parameters and order.</li>
          <li>Assign reference range profiles.</li>
          <li>Preview validation and publish changes.</li>
        </ol>
      </AdminCard>
    </div>
  );
}
