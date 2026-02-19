# UI_SCAFFOLD_ADMIN_PANEL
Date: 2026-02-19

## Routes created
- `/admin`
- `/admin/business`
- `/admin/business/branding`
- `/admin/users`
- `/admin/users/invite`
- `/admin/users/[userId]`
- `/admin/catalog`
- `/admin/catalog/tests`
- `/admin/catalog/tests/[testId]`
- `/admin/catalog/parameters`
- `/admin/catalog/parameters/[parameterId]`
- `/admin/catalog/panels`
- `/admin/catalog/panels/[panelId]`
- `/admin/catalog/linking`
- `/admin/catalog/import-export`

## Components created
- `components/admin/AdminNav.tsx`
- `components/admin/AdminLayoutShell.tsx`
- `components/admin/PageHeader.tsx`
- `components/admin/AdminCard.tsx`
- `components/admin/DataTableShell.tsx`
- `components/admin/FieldRow.tsx`
- `components/admin/StatusPill.tsx`
- `components/admin/FeatureGate.tsx`
- `components/admin/NoticeBanner.tsx`
- `components/admin/Divider.tsx`
- `components/admin/SectionTitle.tsx`

## Theme and route wiring
- Added `lib/admin/routes.ts` for admin route constants + nav sections.
- Added `lib/theme/tokens.css` with reusable tokens:
  - `--bg`
  - `--surface`
  - `--border`
  - `--text`
  - `--muted`
  - `--accent`
  - `--accent-foreground`
- Imported tokens in `app/globals.css` and aligned font stack to Inter/system.
- Added admin query keys in `lib/sdk/hooks.ts`.

## SDK endpoints found and used
Used via generated client (`@vexel/contracts`) only:
- `GET /admin/overview`
- `GET /me`
- `GET /me/features`
- `GET /lab/tests`
- `GET /lab/tests/{testId}`
- `GET /lab/tests/{testId}/parameters`

## Missing contract endpoints (TODO)
Business / Branding:
- [ ] `GET /admin/business/profile` (tenant profile + branding summary)
- [ ] `PUT /admin/business/profile`
- [ ] `POST /admin/business/branding/logo`
- [ ] `POST /admin/business/branding/header`
- [ ] `POST /admin/business/branding/footer`

Users / RBAC:
- [ ] `GET /admin/users`
- [ ] `POST /admin/users/invite`
- [ ] `GET /admin/users/{userId}`
- [ ] `POST /admin/users/{userId}:deactivate` (or equivalent command endpoint)
- [ ] `POST /admin/users/{userId}:assign-role` (or equivalent command endpoint)
- [ ] `GET /admin/rbac/permissions-matrix`

Catalog:
- [ ] `GET /lab/panels`
- [ ] `GET /lab/panels/{panelId}`
- [ ] `POST /lab/panels` (if not yet exposed)
- [ ] `GET /lab/parameters`
- [ ] `GET /lab/parameters/{parameterId}`
- [ ] `POST /lab/catalog/linking:preview`
- [ ] `POST /lab/catalog/linking:apply`

Import/Export:
- [ ] `POST /lab/catalog/import`
- [ ] `POST /lab/catalog/export`
- [ ] `GET /lab/catalog/import-export/history`

## Notes
- Tenant isolation: no tenant ID is accepted in admin route params; tenant context stays auth/session derived.
- Feature flags: `FeatureGate` is scaffolded and wrap-ready; backend remains authoritative.
- Security posture: admin area uses `AuthGuard` through `AdminLayoutShell`.
- No ad-hoc `fetch()` calls were added.
