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
  before_row jsonb;
  after_row jsonb;
  changed_fields jsonb;
  entity_label text;
  actor_name text;
  actor_email text;
begin
  before_row := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  after_row := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  record_id := coalesce(after_row ->> 'id', before_row ->> 'id');
  audit_action := lower(tg_table_name || '_' || tg_op);

  select coalesce(jsonb_agg(changes.key order by changes.key), '[]'::jsonb)
  into changed_fields
  from (
    select coalesce(before_entry.key, after_entry.key) as key
    from jsonb_each(coalesce(before_row, '{}'::jsonb)) before_entry
    full outer join jsonb_each(coalesce(after_row, '{}'::jsonb)) after_entry using (key)
    where before_entry.value is distinct from after_entry.value
      and coalesce(before_entry.key, after_entry.key) <> 'updated_at'
  ) changes;

  entity_label := coalesce(
    after_row ->> 'name',
    before_row ->> 'name',
    after_row ->> 'title',
    before_row ->> 'title',
    after_row ->> 'full_name',
    before_row ->> 'full_name',
    after_row ->> 'part_number',
    before_row ->> 'part_number',
    after_row ->> 'enquiry_number',
    before_row ->> 'enquiry_number',
    after_row ->> 'slug',
    before_row ->> 'slug',
    record_id
  );

  select profile.full_name, auth_user.email
  into actor_name, actor_email
  from public.profiles profile
  left join auth.users auth_user on auth_user.id = profile.id
  where profile.id = (select auth.uid());

  audit_metadata := jsonb_build_object(
    'operation', tg_op,
    'entity_label', entity_label,
    'changed_fields', changed_fields,
    'actor_name', actor_name,
    'actor_email', actor_email,
    'before', before_row,
    'after', after_row
  );

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

revoke execute on function private.audit_row_change() from public, anon, authenticated;

insert into public.branches (
  name,
  slug,
  address,
  city,
  phone,
  whatsapp,
  email,
  opening_hours,
  active
)
values
  (
    'Nakuru Head Office',
    'nakuru',
    'Biashara Street',
    'Nakuru',
    '+254 721 901 129',
    '+254 721 901 129',
    'sales@mutsimoto.com',
    'Mon–Fri 8:00–17:00 · Sat 8:30–13:00',
    true
  ),
  (
    'Nairobi Industrial Area',
    'nairobi-industrial-area',
    '10 Dar Es Salaam Road',
    'Nairobi',
    '+254 726 692 705',
    '+254 726 692 705',
    'iabranch@mutsimoto.com',
    'Mon–Fri 8:00–17:00 · Sat 8:30–13:00',
    true
  ),
  (
    'Nairobi Kirinyaga Road',
    'nairobi-kirinyaga-road',
    'Kirinyaga Road',
    'Nairobi',
    '+254 713 541 204',
    '+254 713 541 204',
    'krbranch@mutsimoto.com',
    'Mon–Fri 8:00–17:00 · Sat 8:30–13:00',
    true
  ),
  (
    'Mombasa Branch',
    'mombasa',
    'Jomo Kenyatta Avenue - Station Road',
    'Mombasa',
    '+254 733 550 025',
    '+254 733 550 025',
    'msabranch@mutsimoto.co.ke',
    'Mon–Fri 8:00–17:00 · Sat 8:30–13:00',
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  opening_hours = excluded.opening_hours,
  active = true,
  updated_at = now();
