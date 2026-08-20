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
3. `migrations/202607230001_product_categories.sql`
4. `migrations/202607240001_catalogue_integration.sql`
5. `migrations/202607250001_leadership_images.sql`
6. `migrations/202607300001_audit_log_details.sql`
7. `migrations/202607310001_retain_company_branches.sql`
8. `migrations/202608190001_filter_request_attachments.sql`
9. `migrations/202608200001_public_product_images.sql`
10. `seed.sql`

The seed is repeatable and provides twelve clearly marked demo products plus the four branch records. Product fitment and technical values must be reviewed before production use.

For an existing demo database that already contains the twelve original products, run only `migrations/202607240001_catalogue_integration.sql`. It upgrades the product categories without removing products and enables live public catalogue refresh events.

Run `migrations/202607250001_leadership_images.sql` on an existing connected database to add staff and public-read policies for leadership portrait uploads. The application also creates signed portrait URLs server-side.

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

The `product-images` bucket is public so catalogue photos use stable, highly cacheable URLs. Product image uploads, changes, and deletions remain restricted to authorized staff. Technical sheets remain private and public visitors receive time-limited links for published product assets.
