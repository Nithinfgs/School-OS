# SchoolOS Supabase backend

SchoolOS keeps the current demo mode as its default. Set `DATA_MODE=supabase` only after applying the migration and configuring server-only environment values from `.env.example`.

1. Install the Supabase CLI and authenticate on a trusted developer machine.
2. Link this directory to the intended project: `supabase link --project-ref <project-ref>`.
3. Apply the schema: `supabase db push`.
4. Load the coherent demo graph if desired: `supabase db reset --linked` or run `supabase/seed.sql` through the SQL editor.
5. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SUPABASE_JWKS_URL` in the server environment. Never place the secret in a client-prefixed variable.

The migration defines normalized tables for SchoolOS workflows and `tracked_records` for cross-module tagging, event, audit, search, and reporting metadata. RLS is enabled, including additional ownership rules for student records, submissions, attendance, transport notices, damage, borrowed assets, inquiries, and storage.

The application uses the same `DataPlatform` repository contracts in demo and Supabase modes. UI components remain independent of Supabase; service code selects the adapter through `DATA_MODE`.
