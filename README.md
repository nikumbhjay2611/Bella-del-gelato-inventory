# Bella del Gelato Inventory

A phone-first Next.js + Supabase inventory and production app for one gelato shop owner. Includes an installable PWA shell, secure owner sign-in, row-level database access, ingredient and base-batch tracking, recipes, production deductions, Excel reports, and an owner-only weekly report email job.

## Start here

Follow [SETUP.md](./SETUP.md) to create the Supabase project, provision the owner, configure secrets, and deploy this directory to Vercel. Do not add actual passwords, service-role keys, mail keys, or cron secrets to source control.

## Development

Requires Node.js 22 or newer (`.nvmrc` specifies 24).

```sh
npm install
npm run dev
```

The database migration is in `supabase/migrations/`. Apply it once to a new Supabase project before signing into the app. Local `.env.local` is ignored by Git.
