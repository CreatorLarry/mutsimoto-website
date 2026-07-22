create or replace function private.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
    and active = true;
$$;

create or replace function private.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active = true
  );
$$;

create or replace function private.has_staff_role(allowed_roles public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active = true
      and role = any(allowed_roles)
  );
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_staff_role(array['super_admin']::public.staff_role[]);
$$;

create or replace function private.can_manage_products()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_staff_role(array['super_admin', 'product_manager']::public.staff_role[]);
$$;

create or replace function private.can_publish_products()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and active = true
      and (
        role = 'super_admin'
        or (role = 'product_manager' and can_publish_products = true)
      )
  );
$$;

create or replace function private.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_staff_role(array['super_admin', 'content_editor']::public.staff_role[]);
$$;

create or replace function private.can_manage_enquiries()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_staff_role(array['super_admin', 'sales']::public.staff_role[]);
$$;

revoke all on schema private from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_staff_role() to authenticated;
grant execute on function private.is_active_staff() to authenticated;
grant execute on function private.has_staff_role(public.staff_role[]) to authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.can_manage_products() to authenticated;
grant execute on function private.can_publish_products() to authenticated;
grant execute on function private.can_manage_content() to authenticated;
grant execute on function private.can_manage_enquiries() to authenticated;

create or replace function private.enforce_product_publication_permission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.publication_status in ('published', 'archived')
    and (tg_op = 'INSERT' or old.publication_status is distinct from new.publication_status)
    and (select auth.uid()) is not null
    and not private.can_publish_products()
  then
    raise exception 'You do not have permission to publish or archive products.';
  end if;
  return new;
end;
$$;

create trigger products_enforce_publication_permission
before insert or update on public.products
for each row execute function private.enforce_product_publication_permission();

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  record_id text;
  audit_action text;
  audit_metadata jsonb;
begin
  record_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
  audit_action := lower(tg_table_name || '_' || tg_op);
  audit_metadata := jsonb_build_object('operation', tg_op);

  if tg_table_name = 'products' and tg_op = 'UPDATE' then
    audit_metadata := audit_metadata || jsonb_build_object(
      'from_status', old.publication_status,
      'to_status', new.publication_status
    );
    if old.publication_status is distinct from new.publication_status then
      audit_action := 'product_status_changed';
    else
      audit_action := 'product_updated';
    end if;
  elsif tg_table_name = 'enquiries' and tg_op = 'UPDATE' then
    audit_metadata := audit_metadata || jsonb_build_object(
      'from_status', old.status,
      'to_status', new.status,
      'assigned_to', new.assigned_to
    );
    audit_action := 'enquiry_updated';
  elsif tg_table_name = 'profiles' and tg_op = 'UPDATE' then
    audit_metadata := audit_metadata || jsonb_build_object(
      'from_role', old.role,
      'to_role', new.role,
      'active', new.active
    );
    audit_action := 'staff_profile_updated';
  end if;

  insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), audit_action, tg_table_name, record_id, audit_metadata);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger products_audit after insert or update or delete on public.products
for each row execute function private.audit_row_change();
create trigger profiles_audit after update on public.profiles
for each row execute function private.audit_row_change();
create trigger enquiries_audit after update on public.enquiries
for each row execute function private.audit_row_change();
create trigger branches_audit after insert or update or delete on public.branches
for each row execute function private.audit_row_change();
create trigger downloads_audit after insert or update or delete on public.downloads
for each row execute function private.audit_row_change();
create trigger content_pages_audit after insert or update or delete on public.content_pages
for each row execute function private.audit_row_change();
create trigger leadership_profiles_audit after insert or update or delete on public.leadership_profiles
for each row execute function private.audit_row_change();

revoke execute on function private.enforce_product_publication_permission() from public, anon, authenticated;
revoke execute on function private.audit_row_change() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.specifications enable row level security;
alter table public.oem_references enable row level security;
alter table public.vehicle_brands enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.engine_models enable row level security;
alter table public.equipment_types enable row level security;
alter table public.product_vehicle_applications enable row level security;
alter table public.product_equipment_applications enable row level security;
alter table public.branches enable row level security;
alter table public.downloads enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.product_views enable row level security;
alter table public.search_events enable row level security;
alter table public.download_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.content_pages enable row level security;
alter table public.leadership_profiles enable row level security;
alter table public.filter_guides enable row level security;
alter table public.site_settings enable row level security;

create policy profiles_self_select on public.profiles
for select to authenticated
using (id = (select auth.uid()));
create policy profiles_super_admin_select on public.profiles
for select to authenticated
using ((select private.is_super_admin()));
create policy profiles_super_admin_update on public.profiles
for update to authenticated
using ((select private.is_super_admin()))
with check ((select private.is_super_admin()));

create policy products_public_select on public.products
for select to anon, authenticated
using (publication_status = 'published');
create policy products_staff_select on public.products
for select to authenticated
using ((select private.is_active_staff()));
create policy products_manager_insert on public.products
for insert to authenticated
with check ((select private.can_manage_products()) and created_by = (select auth.uid()));
create policy products_manager_update on public.products
for update to authenticated
using ((select private.can_manage_products()))
with check ((select private.can_manage_products()) and updated_by = (select auth.uid()));
create policy products_super_admin_delete on public.products
for delete to authenticated
using ((select private.is_super_admin()));

create policy product_images_public_select on public.product_images
for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = product_images.product_id
    and products.publication_status = 'published'
));
create policy product_images_staff_select on public.product_images
for select to authenticated
using ((select private.is_active_staff()));
create policy product_images_manager_insert on public.product_images
for insert to authenticated
with check ((select private.can_manage_products()));
create policy product_images_manager_update on public.product_images
for update to authenticated
using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy product_images_manager_delete on public.product_images
for delete to authenticated
using ((select private.can_manage_products()));

create policy specifications_public_select on public.specifications
for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = specifications.product_id
    and products.publication_status = 'published'
));
create policy specifications_staff_select on public.specifications
for select to authenticated
using ((select private.is_active_staff()));
create policy specifications_manager_insert on public.specifications
for insert to authenticated
with check ((select private.can_manage_products()));
create policy specifications_manager_update on public.specifications
for update to authenticated
using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy specifications_manager_delete on public.specifications
for delete to authenticated
using ((select private.can_manage_products()));

create policy references_public_select on public.oem_references
for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = oem_references.product_id
    and products.publication_status = 'published'
));
create policy references_staff_select on public.oem_references
for select to authenticated
using ((select private.is_active_staff()));
create policy references_manager_insert on public.oem_references
for insert to authenticated
with check ((select private.can_manage_products()));
create policy references_manager_update on public.oem_references
for update to authenticated
using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy references_manager_delete on public.oem_references
for delete to authenticated
using ((select private.can_manage_products()));

create policy vehicle_brands_public_select on public.vehicle_brands
for select to anon, authenticated using (true);
create policy vehicle_brands_manager_insert on public.vehicle_brands
for insert to authenticated with check ((select private.can_manage_products()));
create policy vehicle_brands_manager_update on public.vehicle_brands
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy vehicle_brands_manager_delete on public.vehicle_brands
for delete to authenticated using ((select private.is_super_admin()));

create policy vehicle_models_public_select on public.vehicle_models
for select to anon, authenticated using (true);
create policy vehicle_models_manager_insert on public.vehicle_models
for insert to authenticated with check ((select private.can_manage_products()));
create policy vehicle_models_manager_update on public.vehicle_models
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy vehicle_models_manager_delete on public.vehicle_models
for delete to authenticated using ((select private.is_super_admin()));

create policy engine_models_public_select on public.engine_models
for select to anon, authenticated using (true);
create policy engine_models_manager_insert on public.engine_models
for insert to authenticated with check ((select private.can_manage_products()));
create policy engine_models_manager_update on public.engine_models
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy engine_models_manager_delete on public.engine_models
for delete to authenticated using ((select private.is_super_admin()));

create policy equipment_types_public_select on public.equipment_types
for select to anon, authenticated using (true);
create policy equipment_types_manager_insert on public.equipment_types
for insert to authenticated with check ((select private.can_manage_products()));
create policy equipment_types_manager_update on public.equipment_types
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy equipment_types_manager_delete on public.equipment_types
for delete to authenticated using ((select private.is_super_admin()));

create policy vehicle_apps_public_select on public.product_vehicle_applications
for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = product_vehicle_applications.product_id
    and products.publication_status = 'published'
));
create policy vehicle_apps_staff_select on public.product_vehicle_applications
for select to authenticated using ((select private.is_active_staff()));
create policy vehicle_apps_manager_insert on public.product_vehicle_applications
for insert to authenticated with check ((select private.can_manage_products()));
create policy vehicle_apps_manager_update on public.product_vehicle_applications
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy vehicle_apps_manager_delete on public.product_vehicle_applications
for delete to authenticated using ((select private.can_manage_products()));

create policy equipment_apps_public_select on public.product_equipment_applications
for select to anon, authenticated
using (exists (
  select 1 from public.products
  where products.id = product_equipment_applications.product_id
    and products.publication_status = 'published'
));
create policy equipment_apps_staff_select on public.product_equipment_applications
for select to authenticated using ((select private.is_active_staff()));
create policy equipment_apps_manager_insert on public.product_equipment_applications
for insert to authenticated with check ((select private.can_manage_products()));
create policy equipment_apps_manager_update on public.product_equipment_applications
for update to authenticated using ((select private.can_manage_products()))
with check ((select private.can_manage_products()));
create policy equipment_apps_manager_delete on public.product_equipment_applications
for delete to authenticated using ((select private.can_manage_products()));

create policy branches_public_select on public.branches
for select to anon, authenticated using (active = true);
create policy branches_staff_select on public.branches
for select to authenticated using ((select private.is_active_staff()));
create policy branches_content_insert on public.branches
for insert to authenticated with check ((select private.can_manage_content()));
create policy branches_content_update on public.branches
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy branches_super_delete on public.branches
for delete to authenticated using ((select private.is_super_admin()));

create policy downloads_public_select on public.downloads
for select to anon, authenticated using (published = true);
create policy downloads_staff_select on public.downloads
for select to authenticated using ((select private.is_active_staff()));
create policy downloads_content_insert on public.downloads
for insert to authenticated with check ((select private.can_manage_content()));
create policy downloads_content_update on public.downloads
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy downloads_super_delete on public.downloads
for delete to authenticated using ((select private.is_super_admin()));

create policy enquiries_sales_select on public.enquiries
for select to authenticated using ((select private.can_manage_enquiries()));
create policy enquiries_sales_update on public.enquiries
for update to authenticated using ((select private.can_manage_enquiries()))
with check ((select private.can_manage_enquiries()));
create policy enquiries_super_delete on public.enquiries
for delete to authenticated using ((select private.is_super_admin()));

create policy enquiry_notes_sales_select on public.enquiry_notes
for select to authenticated using ((select private.can_manage_enquiries()));
create policy enquiry_notes_sales_insert on public.enquiry_notes
for insert to authenticated
with check ((select private.can_manage_enquiries()) and user_id = (select auth.uid()));
create policy enquiry_notes_sales_update on public.enquiry_notes
for update to authenticated
using ((select private.can_manage_enquiries()) and user_id = (select auth.uid()))
with check ((select private.can_manage_enquiries()) and user_id = (select auth.uid()));
create policy enquiry_notes_super_delete on public.enquiry_notes
for delete to authenticated using ((select private.is_super_admin()));

create policy product_views_staff_select on public.product_views
for select to authenticated using ((select private.is_active_staff()));
create policy search_events_staff_select on public.search_events
for select to authenticated using ((select private.is_active_staff()));
create policy download_events_staff_select on public.download_events
for select to authenticated using ((select private.is_active_staff()));

create policy audit_logs_super_select on public.audit_logs
for select to authenticated using ((select private.is_super_admin()));

create policy content_pages_public_select on public.content_pages
for select to anon, authenticated using (publication_status = 'published');
create policy content_pages_staff_select on public.content_pages
for select to authenticated using ((select private.is_active_staff()));
create policy content_pages_content_insert on public.content_pages
for insert to authenticated with check ((select private.can_manage_content()));
create policy content_pages_content_update on public.content_pages
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy content_pages_super_delete on public.content_pages
for delete to authenticated using ((select private.is_super_admin()));

create policy leadership_public_select on public.leadership_profiles
for select to anon, authenticated using (published = true);
create policy leadership_staff_select on public.leadership_profiles
for select to authenticated using ((select private.is_active_staff()));
create policy leadership_content_insert on public.leadership_profiles
for insert to authenticated with check ((select private.can_manage_content()));
create policy leadership_content_update on public.leadership_profiles
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy leadership_super_delete on public.leadership_profiles
for delete to authenticated using ((select private.is_super_admin()));

create policy filter_guides_public_select on public.filter_guides
for select to anon, authenticated using (publication_status = 'published');
create policy filter_guides_staff_select on public.filter_guides
for select to authenticated using ((select private.is_active_staff()));
create policy filter_guides_content_insert on public.filter_guides
for insert to authenticated with check ((select private.can_manage_content()));
create policy filter_guides_content_update on public.filter_guides
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy filter_guides_super_delete on public.filter_guides
for delete to authenticated using ((select private.is_super_admin()));

create policy site_settings_public_select on public.site_settings
for select to anon, authenticated
using (key in ('company_public', 'contact_public', 'social_public'));
create policy site_settings_staff_select on public.site_settings
for select to authenticated using ((select private.is_active_staff()));
create policy site_settings_content_insert on public.site_settings
for insert to authenticated with check ((select private.can_manage_content()));
create policy site_settings_content_update on public.site_settings
for update to authenticated using ((select private.can_manage_content()))
with check ((select private.can_manage_content()));
create policy site_settings_super_delete on public.site_settings
for delete to authenticated using ((select private.is_super_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('technical-sheets', 'technical-sheets', false, 15728640, array['application/pdf']),
  ('catalogues', 'catalogues', true, 26214400, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy storage_staff_read on storage.objects
for select to authenticated
using (
  bucket_id in ('product-images', 'technical-sheets', 'catalogues')
  and (select private.is_active_staff())
);

create policy storage_published_product_images_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.storage_path = name
      and p.publication_status = 'published'
  )
);

create policy storage_published_technical_sheets_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'technical-sheets'
  and exists (
    select 1
    from public.products p
    where p.technical_sheet_url = name
      and p.publication_status = 'published'
  )
);

create policy storage_product_manager_insert on storage.objects
for insert to authenticated
with check (
  bucket_id in ('product-images', 'technical-sheets')
  and (select private.can_manage_products())
);

create policy storage_product_manager_update on storage.objects
for update to authenticated
using (
  bucket_id in ('product-images', 'technical-sheets')
  and (select private.can_manage_products())
)
with check (
  bucket_id in ('product-images', 'technical-sheets')
  and (select private.can_manage_products())
);

create policy storage_product_manager_delete on storage.objects
for delete to authenticated
using (
  bucket_id in ('product-images', 'technical-sheets')
  and (select private.can_manage_products())
);

create policy storage_content_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'catalogues'
  and (select private.can_manage_content())
);

create policy storage_content_update on storage.objects
for update to authenticated
using (
  bucket_id = 'catalogues'
  and (select private.can_manage_content())
)
with check (
  bucket_id = 'catalogues'
  and (select private.can_manage_content())
);

create policy storage_content_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'catalogues'
  and (select private.can_manage_content())
);

create or replace function public.search_published_products(
  search_term text,
  result_limit integer default 24,
  result_offset integer default 0
)
returns table (product_id uuid, relevance integer)
language sql
stable
security invoker
set search_path = ''
as $$
  with normalized as (
    select
      trim(lower(coalesce(search_term, ''))) as text_query,
      public.normalize_reference(search_term) as reference_query
  )
  select ranked.product_id, ranked.relevance
  from (
    select distinct
      p.id as product_id,
      p.part_number,
      case
        when p.part_number_normalized = normalized.reference_query then 100
        when p.part_number_normalized like normalized.reference_query || '%' then 90
        when lower(p.name) = normalized.text_query then 80
        when lower(p.name) like '%' || normalized.text_query || '%' then 60
        else 30
      end as relevance
    from public.products p
    cross join normalized
    where p.publication_status = 'published'
      and normalized.text_query <> ''
      and (
        lower(p.name) like '%' || normalized.text_query || '%'
        or p.part_number_normalized like '%' || normalized.reference_query || '%'
        or exists (
          select 1 from public.oem_references r
          where r.product_id = p.id
            and r.reference_number_normalized like '%' || normalized.reference_query || '%'
        )
        or exists (
          select 1
          from public.product_vehicle_applications pva
          join public.vehicle_models vm on vm.id = pva.vehicle_model_id
          join public.vehicle_brands vb on vb.id = vm.vehicle_brand_id
          left join public.engine_models em on em.id = pva.engine_model_id
          where pva.product_id = p.id
            and (
              lower(vb.name) like '%' || normalized.text_query || '%'
              or lower(vm.name) like '%' || normalized.text_query || '%'
              or lower(coalesce(em.model, '')) like '%' || normalized.text_query || '%'
            )
        )
        or exists (
          select 1
          from public.product_equipment_applications pea
          join public.equipment_types et on et.id = pea.equipment_type_id
          left join public.engine_models em on em.id = pea.engine_model_id
          where pea.product_id = p.id
            and (
              lower(et.name) like '%' || normalized.text_query || '%'
              or lower(pea.manufacturer) like '%' || normalized.text_query || '%'
              or lower(pea.model) like '%' || normalized.text_query || '%'
              or lower(coalesce(em.model, '')) like '%' || normalized.text_query || '%'
            )
        )
      )
  ) as ranked
  order by ranked.relevance desc, ranked.part_number asc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
$$;

grant execute on function public.search_published_products(text, integer, integer) to anon, authenticated;
