create extension if not exists pgcrypto;

create schema if not exists private;

create type public.staff_role as enum (
  'super_admin',
  'product_manager',
  'sales',
  'content_editor',
  'viewer'
);

create type public.product_category as enum ('oil', 'fuel', 'air');
create type public.application_type as enum ('automotive', 'industrial', 'both');
create type public.publication_status as enum ('draft', 'review', 'published', 'archived');
create type public.reference_type as enum ('oem', 'competitor', 'alternative');
create type public.enquiry_status as enum ('new', 'contacted', 'quoted', 'follow_up', 'completed', 'closed');

create or replace function public.normalize_reference(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '', 'g');
$$;

create or replace function public.slugify(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.staff_role not null default 'viewer',
  active boolean not null default true,
  can_publish_products boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug = public.slugify(slug)),
  part_number text not null,
  part_number_normalized text generated always as (public.normalize_reference(part_number)) stored,
  category public.product_category not null,
  short_description text not null check (char_length(short_description) between 10 and 320),
  full_description text not null check (char_length(full_description) between 20 and 5000),
  application_type public.application_type not null,
  availability text not null default 'Contact for availability',
  featured boolean not null default false,
  publication_status public.publication_status not null default 'draft',
  primary_image_url text,
  technical_sheet_url text,
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint products_part_number_normalized_key unique (part_number_normalized),
  constraint products_published_at_check check (
    publication_status <> 'published' or published_at is not null
  )
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null check (char_length(alt_text) between 3 and 240),
  display_order integer not null default 0 check (display_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index product_images_one_primary_idx
  on public.product_images(product_id)
  where is_primary;

create table public.specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  value text not null check (char_length(value) between 1 and 240),
  unit text,
  display_order integer not null default 0 check (display_order >= 0),
  unique (product_id, label)
);

create table public.oem_references (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  manufacturer text not null default 'Unspecified',
  reference_number text not null,
  reference_number_normalized text generated always as (public.normalize_reference(reference_number)) stored,
  reference_type public.reference_type not null default 'oem',
  unique (product_id, reference_type, reference_number_normalized)
);

create table public.vehicle_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug = public.slugify(slug))
);

create table public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  vehicle_brand_id uuid not null references public.vehicle_brands(id) on delete cascade,
  name text not null,
  slug text not null check (slug = public.slugify(slug)),
  unique (vehicle_brand_id, slug)
);

create table public.engine_models (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null default 'Unspecified',
  model text not null,
  slug text not null unique check (slug = public.slugify(slug)),
  unique (manufacturer, model)
);

create table public.equipment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug = public.slugify(slug)),
  industry text not null default 'General'
);

create table public.product_vehicle_applications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  vehicle_model_id uuid not null references public.vehicle_models(id) on delete restrict,
  engine_model_id uuid references public.engine_models(id) on delete restrict,
  year_from integer check (year_from between 1900 and 2200),
  year_to integer check (year_to between 1900 and 2200),
  notes text,
  constraint product_vehicle_year_check check (
    year_from is null or year_to is null or year_from <= year_to
  )
);

create table public.product_equipment_applications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  equipment_type_id uuid not null references public.equipment_types(id) on delete restrict,
  manufacturer text not null default 'Unspecified',
  model text not null default 'All models',
  engine_model_id uuid references public.engine_models(id) on delete restrict,
  notes text
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug = public.slugify(slug)),
  address text not null,
  city text not null,
  phone text not null,
  whatsapp text,
  email text not null,
  opening_hours text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  storage_path text not null unique,
  file_type text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  published boolean not null default false,
  download_count bigint not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.enquiry_number_seq start with 1;

create or replace function public.generate_enquiry_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'MMC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.enquiry_number_seq')::text, 6, '0');
$$;

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_number text not null unique default public.generate_enquiry_number(),
  customer_name text not null,
  company_name text,
  email text not null,
  phone text not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer check (quantity is null or quantity > 0),
  branch_id uuid references public.branches(id) on delete set null,
  message text not null,
  status public.enquiry_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  note text not null check (char_length(note) between 1 and 5000),
  created_at timestamptz not null default now()
);

create table public.product_views (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  session_id text not null,
  viewed_at timestamptz not null default now()
);

create table public.search_events (
  id bigint generated always as identity primary key,
  query text not null,
  result_count integer not null check (result_count >= 0),
  selected_product_id uuid references public.products(id) on delete set null,
  session_id text not null,
  searched_at timestamptz not null default now()
);

create table public.download_events (
  id bigint generated always as identity primary key,
  download_id uuid not null references public.downloads(id) on delete cascade,
  session_id text not null,
  downloaded_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = public.slugify(slug)),
  title text not null,
  eyebrow text,
  summary text,
  sections jsonb not null default '[]'::jsonb,
  publication_status public.publication_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.leadership_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text not null,
  biography text not null,
  message text,
  photo_storage_path text,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.filter_guides (
  id uuid primary key default gen_random_uuid(),
  category public.product_category not null unique,
  title text not null,
  summary text not null,
  purpose text not null,
  protects text not null,
  applications jsonb not null default '[]'::jsonb,
  replacement_signs jsonb not null default '[]'::jsonb,
  maintenance_notes text,
  publication_status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index products_publication_status_idx on public.products(publication_status);
create index products_category_idx on public.products(category);
create index products_featured_idx on public.products(featured) where featured;
create index products_updated_at_idx on public.products(updated_at desc);
create index product_images_product_order_idx on public.product_images(product_id, display_order);
create index specifications_product_order_idx on public.specifications(product_id, display_order);
create index oem_references_normalized_idx on public.oem_references(reference_number_normalized);
create index oem_references_product_idx on public.oem_references(product_id);
create index vehicle_models_brand_idx on public.vehicle_models(vehicle_brand_id);
create index product_vehicle_product_idx on public.product_vehicle_applications(product_id);
create index product_vehicle_model_idx on public.product_vehicle_applications(vehicle_model_id);
create index product_vehicle_engine_idx on public.product_vehicle_applications(engine_model_id);
create index product_equipment_product_idx on public.product_equipment_applications(product_id);
create index product_equipment_type_idx on public.product_equipment_applications(equipment_type_id);
create index enquiries_status_idx on public.enquiries(status);
create index enquiries_branch_idx on public.enquiries(branch_id);
create index enquiries_assigned_idx on public.enquiries(assigned_to);
create index enquiries_created_at_idx on public.enquiries(created_at desc);
create index enquiry_notes_enquiry_idx on public.enquiry_notes(enquiry_id, created_at desc);
create index product_views_product_date_idx on public.product_views(product_id, viewed_at desc);
create index search_events_query_date_idx on public.search_events(query, searched_at desc);
create index search_events_no_results_idx on public.search_events(searched_at desc) where result_count = 0;
create index download_events_download_date_idx on public.download_events(download_id, downloaded_at desc);
create index audit_logs_date_idx on public.audit_logs(created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function private.set_updated_at();
create trigger branches_set_updated_at before update on public.branches
for each row execute function private.set_updated_at();
create trigger downloads_set_updated_at before update on public.downloads
for each row execute function private.set_updated_at();
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function private.set_updated_at();
create trigger content_pages_set_updated_at before update on public.content_pages
for each row execute function private.set_updated_at();
create trigger leadership_profiles_set_updated_at before update on public.leadership_profiles
for each row execute function private.set_updated_at();
create trigger filter_guides_set_updated_at before update on public.filter_guides
for each row execute function private.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function private.set_updated_at();

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_created_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.publication_status = 'published'
    and (tg_op = 'INSERT' or old.publication_status is distinct from 'published')
  then
    new.published_at = coalesce(new.published_at, now());
  elsif new.publication_status <> 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger products_set_published_at
before insert or update on public.products
for each row execute function private.set_published_at();

create trigger content_pages_set_published_at
before insert or update on public.content_pages
for each row execute function private.set_published_at();
