begin;

do $$
declare
  has_legacy_categories boolean;
begin
  select exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'product_category'
      and e.enumlabel in ('oil', 'fuel', 'air')
  ) into has_legacy_categories;

  if has_legacy_categories then
    execute 'create type public.product_category_integrated as enum (
      ''oil_element'',
      ''oil_spin_on'',
      ''fuel_elements'',
      ''fuel_spin_on'',
      ''air_cleaners''
    )';

    execute 'alter table public.products
      alter column category type public.product_category_integrated
      using (
        case
          when part_number_normalized = ''mf315'' then ''oil_element''
          when part_number_normalized = ''mff446'' then ''fuel_elements''
          when category::text = ''oil'' then ''oil_spin_on''
          when category::text = ''fuel'' then ''fuel_spin_on''
          when category::text = ''air'' then ''air_cleaners''
          else category::text
        end
      )::public.product_category_integrated';

    execute 'alter table public.filter_guides
      alter column category type public.product_category_integrated
      using (
        case
          when category::text = ''oil'' then ''oil_spin_on''
          when category::text = ''fuel'' then ''fuel_spin_on''
          when category::text = ''air'' then ''air_cleaners''
          else category::text
        end
      )::public.product_category_integrated';

    execute 'drop type public.product_category';
    execute 'alter type public.product_category_integrated rename to product_category';
  end if;
end
$$;

do $$
declare
  realtime_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach realtime_table in array array[
      'products',
      'product_images',
      'specifications',
      'oem_references',
      'product_vehicle_applications',
      'product_equipment_applications',
      'branches',
      'downloads',
      'content_pages',
      'leadership_profiles'
    ]
    loop
      if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = realtime_table
      ) then
        execute format(
          'alter publication supabase_realtime add table public.%I',
          realtime_table
        );
      end if;
    end loop;
  end if;
end
$$;

insert into public.site_settings (key, value)
values (
  'catalogue_integration',
  jsonb_build_object(
    'version', 1,
    'categories', 'five-family',
    'realtime', true,
    'applied_at', now()
  )
)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

commit;
