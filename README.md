# Atithi Careers Premium

Responsive React + Supabase job application portal for Atithi Pure Veg Calgary.

## Included

- Premium mobile and desktop careers page
- Job cards for all poster positions
- Simple application form
- Canadian phone formatting and validation
- Canadian Citizen / Permanent Resident eligibility filter
- Resume upload (PDF, DOC, DOCX; max 5 MB)
- Private Supabase Storage bucket
- Owner email only for eligible applicants
- Private owner login and application dashboard
- Resume preview via short-lived signed URL
- Accept / reject / review status
- Direct call and email buttons

## 1. Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. In Authentication > Users, create the restaurant owner's email/password account.
5. Add your project URL and anon key to `.env.local`.

## 3. Resend email

1. Create a Resend account and verify a sending domain.
2. Deploy this project to Vercel.
3. Add these environment variables in Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
OWNER_EMAIL
FROM_EMAIL
```

Never put the service role key or Resend API key inside a `VITE_` variable.

## 4. Routes

```text
/                 Public careers page
/apply            Application form
/admin/login      Owner login
/admin            Owner dashboard
```

## Important production note

The supplied RLS rules treat every authenticated Supabase user as an owner. Create only the owner's account. For multiple staff accounts, add an `admin_profiles` table and role-based policy before production use.
