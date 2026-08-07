# Lobby — Booking Link

A hosted inquiry page per business: structured form → saves to DB → hands the guest off to WhatsApp with a pre-filled message to the owner. No WhatsApp API, no ban risk. See `docs/spec.md` for the full build spec.

**Stack:** Next.js (App Router) + Prisma + Postgres. Server actions handle writes — no separate backend.

## Getting started

Requires a local Postgres instance (or point `DATABASE_URL` at a hosted one).

```bash
npm install
npx prisma migrate dev --name init   # creates the schema
npm run db:seed                       # seeds the demo "Imani Stays" business
npm run dev                           # http://localhost:3000
```

Then visit `http://localhost:3000/b/imani-stays`.

## Environment

Copy `.env.example` to `.env` and set `DATABASE_URL`. For local dev this points at a Postgres instance on your machine; for production, swap in a hosted Postgres URL (Supabase/Neon) with connection pooling — nothing else in the app changes.

## Project structure

- `app/b/[slug]/page.tsx` — public inquiry page, fetches the `Business` by slug (404 if missing)
- `app/b/[slug]/InquiryForm.tsx` — the form + result screen (vertical-aware: SHORTLET vs REAL_ESTATE)
- `app/b/[slug]/actions.ts` — server action: validates input, saves the `Inquiry`, returns the wa.me link
- `lib/wa.ts` — builds the `wa.me` link from an inquiry
- `prisma/schema.prisma` — `Business` / `Inquiry` models
- `prisma/seed.ts` — seeds the demo business

## Deploying

Deploys to [Vercel](https://vercel.com) — it's a stock Next.js app, so no custom infra is needed. `postinstall` runs `prisma generate` on install, which Vercel needs since the generated client isn't committed to git. Set `DATABASE_URL` as a project environment variable in the Vercel dashboard (never in `vercel.json`), pointing at your hosted Postgres instance.
