begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'leadership-images',
  'leadership-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_staff_read on storage.objects;
create policy storage_staff_read on storage.objects
for select to authenticated
using (
  bucket_id in ('product-images', 'leadership-images', 'technical-sheets', 'catalogues')
  and (select private.is_active_staff())
);

drop policy if exists storage_published_leadership_images_read on storage.objects;
create policy storage_published_leadership_images_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'leadership-images'
  and exists (
    select 1
    from public.leadership_profiles leadership
    where leadership.photo_storage_path = name
      and leadership.published = true
  )
);

drop policy if exists storage_content_insert on storage.objects;
create policy storage_content_insert on storage.objects
for insert to authenticated
with check (
  bucket_id in ('catalogues', 'leadership-images')
  and (select private.can_manage_content())
);

drop policy if exists storage_content_update on storage.objects;
create policy storage_content_update on storage.objects
for update to authenticated
using (
  bucket_id in ('catalogues', 'leadership-images')
  and (select private.can_manage_content())
)
with check (
  bucket_id in ('catalogues', 'leadership-images')
  and (select private.can_manage_content())
);

drop policy if exists storage_content_delete on storage.objects;
create policy storage_content_delete on storage.objects
for delete to authenticated
using (
  bucket_id in ('catalogues', 'leadership-images')
  and (select private.can_manage_content())
);

commit;
