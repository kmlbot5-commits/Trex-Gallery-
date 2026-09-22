# Trex Gallery 🦖 — Supabase version

Public image gallery + private Admin upload/delete using Supabase.

## 1. Add your Supabase keys
Open `public/supabase-config.js` and replace:

- `PASTE_YOUR_PROJECT_URL_HERE` with your Supabase Project URL
- `PASTE_YOUR_PUBLISHABLE_KEY_HERE` with your Supabase Publishable key (`sb_publishable_...`)

Never put an `sb_secret_...` key in this file.

## 2. Supabase Storage
Bucket name must be exactly:

`Trex Gallery`

Bucket should be **Public** and MIME type `image/*` is recommended.

Policies already planned for the admin UID:
`7cc10853-fcce-4a85-aea1-8d7678d2d8ed`

You need these Storage policies on `storage.objects`:

### SELECT (public gallery listing)
Target role: `anon` (or public/appropriate anonymous role in the Supabase policy UI)
USING expression:
```sql
(bucket_id = 'Trex Gallery'::text)
```

### INSERT (admin upload)
Target role: `authenticated`
WITH CHECK expression:
```sql
(bucket_id = 'Trex Gallery'::text)
AND (auth.uid() = '7cc10853-fcce-4a85-aea1-8d7678d2d8ed'::uuid)
```

### DELETE (admin delete)
Target role: `authenticated`
USING expression:
```sql
(bucket_id = 'Trex Gallery'::text)
AND (auth.uid() = '7cc10853-fcce-4a85-aea1-8d7678d2d8ed'::uuid)
```

## 3. Admin login
The admin page uses Supabase Email/Password Auth. The account's Auth user ID must match the Admin UID above.

## 4. Deploy
Upload the contents of the `public` folder to a static host, or deploy the project root with a host configured to serve `public` as the site directory.

## Important
The Publishable key is intended for browser use. Keep Secret keys and passwords private.
