insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enquiry-attachments',
  'enquiry-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_enquiry_staff_read on storage.objects;
create policy storage_enquiry_staff_read on storage.objects
for select to authenticated
using (
  bucket_id = 'enquiry-attachments'
  and (select private.can_manage_enquiries())
);
