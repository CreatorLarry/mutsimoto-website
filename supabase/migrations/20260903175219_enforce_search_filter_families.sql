-- Keep the migration version aligned with the deployed Supabase migration.
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
      public.normalize_reference(search_term) as reference_query,
      trim(regexp_replace(lower(coalesce(search_term, '')), '[^a-z0-9]+', ' ', 'g')) as word_query
  ),
  terms as (
    select distinct token.term
    from normalized
    cross join lateral regexp_split_to_table(normalized.word_query, '\s+') as token(term)
    where length(token.term) >= 2
      and token.term not in (
        'a', 'an', 'and', 'catalog', 'catalogue', 'filter', 'filters',
        'filtration', 'for', 'mutsimoto', 'of', 'or', 'product', 'products',
        'the', 'to', 'with'
      )
  ),
  ranked as (
    select
      p.id as product_id,
      p.part_number,
      case
        when normalized.reference_query <> ''
          and p.part_number_normalized = normalized.reference_query then 1000
        when normalized.reference_query <> ''
          and exists (
            select 1
            from public.oem_references reference
            where reference.product_id = p.id
              and reference.reference_number_normalized = normalized.reference_query
          ) then 950
        when exists (
          select 1
          from public.product_vehicle_applications application
          join public.vehicle_models model on model.id = application.vehicle_model_id
          where application.product_id = p.id
            and lower(model.name) = normalized.text_query
        ) then 900
        when exists (
          select 1
          from public.product_vehicle_applications application
          left join public.engine_models engine on engine.id = application.engine_model_id
          where application.product_id = p.id
            and lower(coalesce(engine.model, '')) = normalized.text_query
        ) or exists (
          select 1
          from public.product_equipment_applications application
          left join public.engine_models engine on engine.id = application.engine_model_id
          where application.product_id = p.id
            and lower(coalesce(engine.model, '')) = normalized.text_query
        ) then 850
        when exists (
          select 1
          from terms term
          join public.product_vehicle_applications application on application.product_id = p.id
          join public.vehicle_models model on model.id = application.vehicle_model_id
          join public.vehicle_brands brand on brand.id = model.vehicle_brand_id
          where lower(brand.name) = term.term
        ) then 800
        when lower(p.name) = normalized.text_query then 750
        when normalized.reference_query <> ''
          and p.part_number_normalized like normalized.reference_query || '%' then 700
        when normalized.reference_query <> ''
          and exists (
            select 1
            from public.oem_references reference
            where reference.product_id = p.id
              and reference.reference_number_normalized like normalized.reference_query || '%'
          ) then 650
        else 400
      end as relevance
    from public.products p
    cross join normalized
    where p.publication_status = 'published'
      and normalized.text_query <> ''
      and (
        not exists (select 1 from terms where term in ('oil', 'fuel', 'air'))
        or (exists (select 1 from terms where term = 'oil')
          and p.category::text in ('oil_element', 'oil_spin_on'))
        or (exists (select 1 from terms where term = 'fuel')
          and p.category::text in ('fuel_elements', 'fuel_spin_on'))
        or (exists (select 1 from terms where term = 'air')
          and p.category::text = 'air_cleaners')
      )
      and (
        not exists (select 1 from terms)
        or not exists (
          select 1
          from terms term
          where term.term not in ('oil', 'fuel', 'air')
            and not (
            lower(p.name) like '%' || term.term || '%'
            or lower(replace(p.category::text, '_', ' ')) like '%' || term.term || '%'
            or lower(coalesce(p.short_description, '')) like '%' || term.term || '%'
            or lower(coalesce(p.full_description, '')) like '%' || term.term || '%'
            or p.part_number_normalized like '%' || public.normalize_reference(term.term) || '%'
            or exists (
              select 1
              from public.oem_references reference
              where reference.product_id = p.id
                and (
                  reference.reference_number_normalized like '%' || public.normalize_reference(term.term) || '%'
                  or lower(coalesce(reference.manufacturer, '')) like '%' || term.term || '%'
                )
            )
            or exists (
              select 1
              from public.product_vehicle_applications application
              join public.vehicle_models model on model.id = application.vehicle_model_id
              join public.vehicle_brands brand on brand.id = model.vehicle_brand_id
              left join public.engine_models engine on engine.id = application.engine_model_id
              where application.product_id = p.id
                and (
                  lower(brand.name) like '%' || term.term || '%'
                  or lower(model.name) like '%' || term.term || '%'
                  or lower(coalesce(engine.model, '')) like '%' || term.term || '%'
                  or lower(coalesce(application.notes, '')) like '%' || term.term || '%'
                )
            )
            or exists (
              select 1
              from public.product_equipment_applications application
              join public.equipment_types equipment on equipment.id = application.equipment_type_id
              left join public.engine_models engine on engine.id = application.engine_model_id
              where application.product_id = p.id
                and (
                  lower(equipment.name) like '%' || term.term || '%'
                  or lower(application.manufacturer) like '%' || term.term || '%'
                  or lower(application.model) like '%' || term.term || '%'
                  or lower(coalesce(engine.model, '')) like '%' || term.term || '%'
                  or lower(coalesce(application.notes, '')) like '%' || term.term || '%'
                )
            )
            or exists (
              select 1
              from public.specifications specification
              where specification.product_id = p.id
                and (
                  lower(specification.label) like '%' || term.term || '%'
                  or lower(specification.value) like '%' || term.term || '%'
                )
            )
          )
        )
      )
  )
  select ranked.product_id, ranked.relevance
  from ranked
  order by ranked.relevance desc, ranked.part_number asc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
$$;

grant execute on function public.search_published_products(text, integer, integer) to anon, authenticated;
