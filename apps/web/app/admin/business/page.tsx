'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AdminCard } from '@/components/admin/AdminCard';
import { Divider } from '@/components/admin/Divider';
import { FieldRow } from '@/components/admin/FieldRow';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';
import { SectionTitle } from '@/components/admin/SectionTitle';
import { adminRoutes } from '@/lib/admin/routes';
import { parseApiError } from '@/lib/api-errors';
import { client } from '@/lib/sdk/client';
import { adminKeys } from '@/lib/sdk/hooks';
import type { paths } from '@vexel/contracts';

type MeResponse = paths['/me']['get']['responses'][200]['content']['application/json'];
type FeaturesResponse = paths['/me/features']['get']['responses'][200]['content']['application/json'];

export default function BusinessOverviewPage() {
  const { data: meData, error: meError } = useQuery({
    queryKey: adminKeys.me(),
    queryFn: async () => {
      const { data, error } = await client.GET('/me');
      if (error) throw new Error(parseApiError(error, 'Failed to load profile').message);
      return data as MeResponse;
    },
  });

  const { data: featuresData, error: featuresError } = useQuery({
    queryKey: adminKeys.features(),
    queryFn: async () => {
      const { data, error } = await client.GET('/me/features');
      if (error) throw new Error(parseApiError(error, 'Failed to load features').message);
      return data as FeaturesResponse;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Overview"
        subtitle="Tenant profile and branding readiness for report publishing."
        actions={
          <Link
            href={adminRoutes.businessBranding}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Open Branding
          </Link>
        }
      />

      {meError ? (
        <NoticeBanner title="Failed to load tenant profile" tone="warning">
          {meError instanceof Error ? meError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      {featuresError ? (
        <NoticeBanner title="Failed to load feature flags" tone="warning">
          {featuresError instanceof Error ? featuresError.message : 'Unknown error'}
        </NoticeBanner>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminCard title="Tenant Profile" subtitle="Derived from authenticated session context.">
          <dl>
            <FieldRow label="Tenant ID" value={meData?.tenantId ?? 'Not available'} />
            <Divider />
            <FieldRow label="User Name" value={meData?.name ?? 'Not available'} />
            <Divider />
            <FieldRow label="User Email" value={meData?.email ?? 'Not available'} />
          </dl>
        </AdminCard>

        <AdminCard title="Branding Summary" subtitle="Scaffold values until contract endpoints are available.">
          <SectionTitle title="Report Identity" subtitle="Lab name, address, phone, and header text." />
          <p className="text-sm text-[var(--muted)]">
            Branding persistence endpoint is not available in current OpenAPI contract.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]">
              Logo: Placeholder
            </span>
            <span className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]">
              Header: Optional
            </span>
            <span className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]">
              Footer: Optional
            </span>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Feature Visibility" subtitle="UI remains wrap-ready; backend remains authoritative.">
        <div className="flex flex-wrap gap-2">
          {featuresData && Object.entries(featuresData).length > 0 ? (
            Object.entries(featuresData).map(([key, enabled]) => (
              <span
                key={key}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              >
                <strong>{key}</strong>: {enabled ? 'Enabled' : 'Disabled'}
              </span>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No feature payload returned.</p>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
