# SQL Migrations

This directory holds schema changes that should be tracked in git and applied in order.

## Public Snapshot API

The public landing-page data path is defined by these migrations:

- `002_ms_public_schema.sql`
- `003_ms_public_pg_cron.sql`

`002_ms_public_schema.sql` creates the `ms_public` schema, the public dashboard materialized views, the `snapshot_meta` table, and the `ms_public.refresh_public_dashboard()` refresh function.

`003_ms_public_pg_cron.sql` schedules the refresh function with `pg_cron`. This migration assumes the PostgreSQL host already has the `pg_cron` extension binaries installed and enabled through `shared_preload_libraries`.

## Notes

- Public API queries should read only from `ms_public.*`.
- The landing page should use `/api/public/*` endpoints rather than the paid/default dashboard endpoints.
- `pg_cron` setup is a host-level prerequisite and is not handled by SQL alone.
