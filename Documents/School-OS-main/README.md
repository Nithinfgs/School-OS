# SchoolOS

SchoolOS is a role-aware school operations workspace for administrators, Heads of School, teachers, students, lab assistants, library assistants, and transport staff.

**Live demo:** [taupe-kitsune-452d47.netlify.app](https://taupe-kitsune-452d47.netlify.app/)  
**Repository:** [github.com/Nithinfgs/School-OS](https://github.com/Nithinfgs/School-OS)

## What is included

- Role-based dashboards for school administration, HOS, teaching, students, laboratory, library, and transport.
- Shared records, tagging, activity events, audit history, visibility rules, and organization scoping.
- Demo workflows for attendance, assignments, grades, inquiries, library loans, lab usage, transport notices, and damage reports.
- Supabase-ready repositories and migrations using the same domain services as demo mode.
- Initial school setup templates: `SchoolOS_Initial_Data_Template.xlsx`, CSV exports, and an import manifest.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Demo mode is the default and provides the role buttons without credentials.

## Build and verify

```bash
npm run build
npx tsc --noEmit
npm run lint
```

## Supabase mode

Copy `.env.example` to a server environment and set `DATA_MODE=supabase`. Configure the Supabase URL, publishable key, secret key, and JWKS URL. Apply the migrations in `supabase/migrations` before signing in. Create Supabase Auth users and link each user to a SchoolOS `profiles` row and role in `user_roles`.

Never commit `.env` files, database passwords, service keys, or other secrets. The secret key is server-only.

## Architecture

The application follows:

```text
UI → domain service → repository interface → data adapter
```

Demo and Supabase adapters implement the same contracts. The UI does not query the database directly. `lib/tracking.ts` defines shared record metadata, tags, visibility, activity events, borrowed assets, and audit entries.

## Data setup

The onboarding workbook and CSV export are generated separately from the source repository. Use the workbook README and `SchoolOS_Import_Manifest.json` for the recommended upload order and relationship rules. Stable IDs are used across students, classes, staff, library, laboratory, transport, and academic records.

## License

SchoolOS is released under the [MIT License](./LICENSE).
