# Bella del Gelato Inventory — setup and deployment

## What is in this project

- Next.js App Router + TypeScript responsive PWA.
- Supabase Auth with cookie-based sessions. There is no public sign-up screen.
- Supabase Postgres migration with owner-only RLS, movement ledger, recipes, base batches, and production history.
- Transactional database functions deduct stock for base and gelato production.
- Owner-only weekly Excel workbook download and scheduled email route.
- Vercel cron is scheduled for Monday at 03:00 UTC (08:30 India Standard Time).

## 1. Create the Supabase project and owner account

1. Create a Supabase project. Use a strong database password and save it in a password manager.
2. In **Authentication → Users**, add the single owner account using the requested owner email and set a unique password in the secure dashboard form. Do not put the password in this repository, a SQL file, or a Vercel build log.
3. In **Authentication → Settings**, turn off **Allow new users to sign up**. Add the production Vercel URL to the allowed redirect URLs, plus `http://localhost:3000/**` for local development.
4. In **Project Settings → API**, copy the project URL and the **publishable** key. The app must use the publishable key in the browser. The service-role key is only for the scheduled email route.
5. Open **SQL Editor** and run `supabase/migrations/202610310001_initial.sql`.
6. In **Authentication → Users**, copy the owner's UUID. In SQL Editor, link that one account and set the recipient email (replace the UUID and email values):

   ```sql
   update public.app_settings
   set owner_id = 'OWNER-USER-UUID',
       owner_email = 'OWNER-EMAIL',
       business_name = 'Bella del Gelato Inventory'
   where id is true;
   ```

   The database has a single fixed owner slot. Other signed-in or anonymous users cannot see or change its data under the included policies.

## 2. Run locally

1. Install Node.js 22 or newer (the repo is pinned to Node 24).
2. Copy `.env.example` to `.env.local` and fill in only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to run the app. `.env.local` is ignored by Git.
3. Run `npm install`, then `npm run dev`, and open `http://localhost:3000`.

## 3. Deploy to Vercel

1. Push this project directory to a private Git repository and import it into Vercel.
2. In **Vercel → Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose it to browser code)
   - `CRON_SECRET` (generate and store a long random value in a password manager)
   - `RESEND_API_KEY`
   - `REPORT_FROM_EMAIL` (an address on a domain verified with Resend)
3. Redeploy after adding environment variables. Vercel reads `vercel.json` and schedules the weekly report route. Cron schedules use UTC.
4. Verify the production domain in Supabase Auth's allowed redirect URLs. Turn on **Automatic email** in the app’s Settings only after the Resend sender is verified and the Vercel mail environment variables are configured.
5. Test the weekly email once using Vercel's cron controls or a request with `Authorization: Bearer <CRON_SECRET>` before relying on the scheduled send.

## Security notes

- No account password, Supabase secret, Resend key, or cron secret is stored in source code.
- The service-role key bypasses RLS. It is used only in the server-side weekly email route and must remain a Vercel server environment variable.
- All operational tables have RLS. A private helper checks the configured owner UUID; the SQL functions also check owner authorization and lock stock rows before making deductions.
- Browser-facing data changes use the signed-in user's session and the database policies. Authenticated users cannot insert/change the stock ledger or production history directly; database functions write those records.
- Set a unique, long owner password in Supabase Auth. The app's sign-in form does not store it.
- Supabase and Vercel free-plan limits and availability can change. Configure database backups and confirm the production plan fits the shop's operational requirements.
