begin;

create type public.product_category_v2 as enum (
  'oil_element',
  'oil_spin_on',
  'fuel_elements',
  'fuel_spin_on',
  'air_cleaners'
);

alter table public.products
  alter column category type public.product_category_v2
  using (
    case
      when part_number_normalized = 'mf315' then 'oil_element'
      when part_number_normalized = 'mff446' then 'fuel_elements'
      when category::text = 'oil' then 'oil_spin_on'
      when category::text = 'fuel' then 'fuel_spin_on'
      when category::text = 'air' then 'air_cleaners'
      when category::text = 'oil_element' then 'oil_element'
      when category::text = 'oil_spin_on' then 'oil_spin_on'
      when category::text = 'fuel_elements' then 'fuel_elements'
      when category::text = 'fuel_spin_on' then 'fuel_spin_on'
      else 'air_cleaners'
    end
  )::public.product_category_v2;

alter table public.filter_guides
  alter column category type public.product_category_v2
  using (
    case
      when category::text in ('oil', 'oil_element', 'oil_spin_on') then 'oil_spin_on'
      when category::text in ('fuel', 'fuel_elements', 'fuel_spin_on') then 'fuel_spin_on'
      else 'air_cleaners'
    end
  )::public.product_category_v2;

drop type public.product_category;
alter type public.product_category_v2 rename to product_category;

commit;
