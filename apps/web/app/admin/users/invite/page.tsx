'use client';

import { useState, type FormEvent } from 'react';
import { AdminCard } from '@/components/admin/AdminCard';
import { NoticeBanner } from '@/components/admin/NoticeBanner';
import { PageHeader } from '@/components/admin/PageHeader';

const roleOptions = ['Admin', 'Operator', 'Verifier', 'Viewer'] as const;

export default function InviteUserPage() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite User"
        subtitle="Scaffold for tenant-bound user invitation and role assignment."
      />

      <NoticeBanner title="Requires backend contract endpoint" tone="warning">
        User invitation and creation endpoints are not present in OpenAPI. Form submit is currently a no-op scaffold.
      </NoticeBanner>

      <AdminCard title="Invite / Create User" subtitle="Tenant-scoped RBAC assignment placeholder.">
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Full Name</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Email</span>
            <input
              type="email"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Phone</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--muted)]">Role</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]"
            >
              Send Invite (Scaffold)
            </button>
            {submitted ? (
              <p className="mt-2 text-sm text-[var(--muted)]">Submission captured locally. Backend wiring TODO.</p>
            ) : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Permissions Matrix Placeholder">
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--bg)] text-left text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Permission</th>
                {roleOptions.map((role) => (
                  <th key={role} className="px-4 py-3 font-medium">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['View orders', 'Enter results', 'Verify results', 'Publish reports', 'Manage users'].map((permission) => (
                <tr key={permission} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">{permission}</td>
                  {roleOptions.map((role) => (
                    <td key={`${permission}-${role}`} className="px-4 py-3 text-[var(--muted)]">
                      Placeholder
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
