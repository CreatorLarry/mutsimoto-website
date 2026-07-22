# Supabase demo setup

The frontend continues to use local mock products until both public Supabase environment variables are configured. Once configured, the public catalogue, product details, search, admin dashboard, product editor, and enquiry workflow read and write the Supabase project.

## 1. Create the project

Create a Supabase project for the demo. In **Authentication → URL Configuration**, set the site URL to the local or deployed website URL and add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://your-demo-domain.example/auth/callback`

## 2. Apply the database

Run the SQL files in this order using the Supabase SQL editor:

1. `migrations/202607200001_core_schema.sql`
2. `migrations/202607200002_security_storage.sql`
3. `seed.sql`

The seed is repeatable and provides twelve clearly marked demo products plus the four branch records. Product fitment and technical values must be reviewed before production use.

## 3. Configure the website

Copy `.env.example` to `.env.local` and replace the placeholder values. `SUPABASE_SECRET_KEY` is server-only and must never use the `NEXT_PUBLIC_` prefix.

For a Vercel demo, add the same variables in the Vercel project settings and set `NEXT_PUBLIC_SITE_URL` to the HTTPS deployment URL.

## 4. Create the first administrator

Create or invite a user from **Authentication → Users**. The database trigger automatically creates a viewer profile. Promote that exact email in the SQL editor:

```sql
update public.profiles
set role = 'super_admin',
    active = true,
    can_publish_products = true
where id = (
  select id from auth.users where lower(email) = lower('admin@your-company.example')
);
```

There is intentionally no public staff registration page. Additional staff accounts are created by an administrator and assigned one of these roles: `super_admin`, `product_manager`, `sales`, `content_editor`, or `viewer`.

## 5. Verify the workflow

1. Sign in at `/admin/login`.
2. Create a draft product in `/admin/products/new`.
3. Publish it as a user with publishing permission.
4. Confirm that it appears on `/products` and its dynamic product route works.
5. Submit `/contact`, then update the resulting enquiry in `/admin/enquiries`.

The private `product-images` and `technical-sheets` buckets are created by the security migration. Public visitors receive time-limited signed URLs only for published product assets.
