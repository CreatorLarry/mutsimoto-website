-- Demo catalogue data. Product fitment and technical values must be reviewed by
-- Mutsimoto before production use.
begin;

insert into public.branches (name, slug, address, city, phone, whatsapp, email, opening_hours)
values
  ('Nakuru Head Office', 'nakuru', 'Biashara Street', 'Nakuru', '+254 721 901 129', '+254 721 901 129', 'sales@mutsimoto.com', 'Mon–Fri 8:00–17:00 · Sat 8:30–13:00'),
  ('Nairobi Industrial Area', 'nairobi-industrial-area', '10 Dar Es Salaam Road', 'Nairobi', '+254 726 692 705', '+254 726 692 705', 'iabranch@mutsimoto.com', 'Mon–Fri 8:00–17:00 · Sat 8:30–13:00'),
  ('Nairobi Kirinyaga Road', 'nairobi-kirinyaga-road', 'Kirinyaga Road', 'Nairobi', '+254 713 541 204', '+254 713 541 204', 'krbranch@mutsimoto.com', 'Mon–Fri 8:00–17:00 · Sat 8:30–13:00'),
  ('Mombasa Branch', 'mombasa', 'Jomo Kenyatta Avenue – Station Road', 'Mombasa', '+254 733 550 025', '+254 733 550 025', 'msabranch@mutsimoto.co.ke', 'Mon–Fri 8:00–17:00 · Sat 8:30–13:00')
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  opening_hours = excluded.opening_hours,
  active = true;

insert into public.products (
  name, slug, part_number, category, short_description, full_description,
  application_type, availability, featured, publication_status, primary_image_url,
  seo_title, seo_description
)
values
  ('Sunny Oil Filter', 'pfl-2074-sunny-oil-filter', 'SL 2074', 'oil', 'Full-flow engine oil protection for popular passenger vehicles.', 'A durable full-flow oil filter engineered for dependable contaminant capture, stable oil pressure, and clean starts across everyday service intervals.', 'automotive', 'In stock', true, 'published', '/images/sl-2074-front.png', 'SL 2074 Sunny Oil Filter | Mutsimoto', 'Full-flow Mutsimoto oil filter for selected passenger vehicle applications.'),
  ('Extended Life Oil Filter', 'mf-208-extended-life-oil-filter', 'MF-208', 'oil', 'High-capacity filtration for diesel pickups and commercial fleets.', 'Built for high-mileage diesel service with reinforced construction and increased media capacity for demanding fleet operating cycles.', 'automotive', 'In stock', true, 'published', null, 'MF-208 Extended Life Oil Filter | Mutsimoto', 'High-capacity oil filtration for selected diesel pickup and fleet applications.'),
  ('Precision Oil Filter Element', 'mf-315-cartridge-oil-element', 'MF-315', 'oil', 'Cartridge element for modern European petrol and diesel engines.', 'A precision-fit cartridge element with resilient end caps and high-efficiency media for clean oil circulation in modern engine platforms.', 'automotive', 'Contact for availability', false, 'published', null, 'MF-315 Oil Filter Element | Mutsimoto', 'Precision cartridge oil filter element for selected European engines.'),
  ('Heavy-Duty Lube Filter', 'mf-420-heavy-duty-lube-filter', 'MF-420', 'oil', 'High-capacity lube filter for construction and industrial engines.', 'A robust filter developed for long duty cycles, vibration resistance, and consistent lubrication protection in off-highway equipment.', 'industrial', 'In stock', false, 'published', null, 'MF-420 Heavy-Duty Lube Filter | Mutsimoto', 'Heavy-duty lube filtration for selected construction and industrial engines.'),
  ('Diesel Fuel Filter', 'mff-112-diesel-fuel-filter', 'MFF-112', 'fuel', 'Fine fuel protection for common-rail diesel passenger vehicles.', 'Designed to protect sensitive common-rail components by retaining fine particulates and supporting reliable fuel flow under changing loads.', 'automotive', 'In stock', true, 'published', null, 'MFF-112 Diesel Fuel Filter | Mutsimoto', 'Fine fuel filtration for selected common-rail diesel vehicle applications.'),
  ('Fuel / Water Separator', 'mff-225-water-separator', 'MFF-225', 'fuel', 'Water separation and particle control for commercial diesel engines.', 'Combines efficient particulate filtration with reliable water separation to protect commercial diesel injection systems in varied fuel conditions.', 'automotive', 'In stock', true, 'published', null, 'MFF-225 Fuel Water Separator | Mutsimoto', 'Fuel and water separation for selected commercial diesel applications.'),
  ('Industrial Fuel Filter', 'mff-338-industrial-fuel-filter', 'MFF-338', 'fuel', 'Primary diesel filtration for generators and industrial power units.', 'A serviceable primary fuel filter engineered for steady fuel delivery and dependable contaminant removal in continuous-duty power equipment.', 'industrial', 'In stock', false, 'published', null, 'MFF-338 Industrial Fuel Filter | Mutsimoto', 'Primary diesel fuel filtration for generators and industrial equipment.'),
  ('High-Efficiency Fuel Element', 'mff-446-high-efficiency-fuel-element', 'MFF-446', 'fuel', 'Secondary protection for heavy-duty injection systems.', 'High-efficiency secondary filtration for demanding injection equipment, with consistent performance throughout the service interval.', 'industrial', 'Contact for availability', false, 'published', null, 'MFF-446 Fuel Filter Element | Mutsimoto', 'High-efficiency secondary fuel element for heavy-duty systems.'),
  ('Premium Panel Air Filter', 'maf-130-panel-air-filter', 'MAF-130', 'air', 'Low-restriction intake protection for passenger vehicles.', 'A dimensionally stable panel filter with deep pleats for balanced airflow, dust capacity, and engine protection in everyday driving.', 'automotive', 'In stock', true, 'published', null, 'MAF-130 Panel Air Filter | Mutsimoto', 'Low-restriction panel air filtration for selected passenger vehicles.'),
  ('Round Air Filter Element', 'maf-244-round-air-element', 'MAF-244', 'air', 'Radial-seal air filtration for light commercial vehicles.', 'A rugged radial-seal element that maintains a secure fit and dependable dust loading performance in commercial road conditions.', 'automotive', 'In stock', true, 'published', null, 'MAF-244 Round Air Filter | Mutsimoto', 'Radial-seal air filtration for selected light commercial vehicles.'),
  ('Heavy-Duty Air Filter', 'maf-357-heavy-duty-air-filter', 'MAF-357', 'air', 'High dust-capacity intake filter for construction machinery.', 'Engineered for severe dust environments with durable media, reinforced structure, and high contaminant-holding capacity.', 'industrial', 'In stock', false, 'published', null, 'MAF-357 Heavy-Duty Air Filter | Mutsimoto', 'High dust-capacity intake filtration for construction machinery.'),
  ('Industrial Air Element', 'maf-468-industrial-air-element', 'MAF-468', 'air', 'Primary intake filtration for compressors and generator sets.', 'A high-capacity cylindrical element designed to support steady airflow and equipment protection in stationary industrial installations.', 'industrial', 'Contact for availability', false, 'published', null, 'MAF-468 Industrial Air Element | Mutsimoto', 'Primary intake air filtration for compressors and generators.')
on conflict (part_number_normalized) do update set
  name = excluded.name,
  slug = excluded.slug,
  category = excluded.category,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  application_type = excluded.application_type,
  availability = excluded.availability,
  featured = excluded.featured,
  publication_status = excluded.publication_status,
  primary_image_url = excluded.primary_image_url,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

delete from public.specifications
where product_id in (select id from public.products where part_number_normalized in ('sl2074', 'mf208', 'mf315', 'mf420', 'mff112', 'mff225', 'mff338', 'mff446', 'maf130', 'maf244', 'maf357', 'maf468'));

insert into public.specifications (product_id, label, value, unit, display_order)
select p.id, sample.label, sample.value, sample.unit, sample.display_order
from (values
  ('SL 2074', 'Height', '75', 'mm', 0), ('SL 2074', 'Outer diameter', '68', 'mm', 1), ('SL 2074', 'Thread size', '3/4-16 UNF', null, 2),
  ('MF-208', 'Height', '102', 'mm', 0), ('MF-208', 'Outer diameter', '94', 'mm', 1), ('MF-208', 'Thread size', 'M26 × 1.5', null, 2),
  ('MF-315', 'Height', '105', 'mm', 0), ('MF-315', 'Outer diameter', '65', 'mm', 1), ('MF-315', 'Filter media', 'Synthetic cellulose', null, 2),
  ('MF-420', 'Height', '260', 'mm', 0), ('MF-420', 'Outer diameter', '135', 'mm', 1), ('MF-420', 'Filter media', 'Microglass blend', null, 2),
  ('MFF-112', 'Height', '123', 'mm', 0), ('MFF-112', 'Outer diameter', '86', 'mm', 1), ('MFF-112', 'Nominal rating', '10', 'micron', 2),
  ('MFF-225', 'Height', '172', 'mm', 0), ('MFF-225', 'Outer diameter', '93', 'mm', 1), ('MFF-225', 'Thread size', 'M20 × 1.5', null, 2),
  ('MFF-338', 'Height', '165', 'mm', 0), ('MFF-338', 'Outer diameter', '96', 'mm', 1), ('MFF-338', 'Thread size', '1-14 UNS', null, 2),
  ('MFF-446', 'Height', '155', 'mm', 0), ('MFF-446', 'Outer diameter', '84', 'mm', 1), ('MFF-446', 'Nominal rating', '5', 'micron', 2),
  ('MAF-130', 'Height', '38', 'mm', 0), ('MAF-130', 'Envelope', '282 × 198', 'mm', 1), ('MAF-130', 'Filter media', 'Embossed cellulose', null, 2),
  ('MAF-244', 'Height', '310', 'mm', 0), ('MAF-244', 'Outer diameter', '160', 'mm', 1), ('MAF-244', 'Inner diameter', '88', 'mm', 2),
  ('MAF-357', 'Height', '420', 'mm', 0), ('MAF-357', 'Outer diameter', '235', 'mm', 1), ('MAF-357', 'Filter media', 'Nanofibre cellulose', null, 2),
  ('MAF-468', 'Height', '498', 'mm', 0), ('MAF-468', 'Outer diameter', '275', 'mm', 1), ('MAF-468', 'Filter media', 'High-capacity cellulose', null, 2)
) as sample(part_number, label, value, unit, display_order)
join public.products p on p.part_number_normalized = public.normalize_reference(sample.part_number);

delete from public.oem_references
where product_id in (select id from public.products where part_number_normalized in ('sl2074', 'mf208', 'mf315', 'mf420', 'mff112', 'mff225', 'mff338', 'mff446', 'maf130', 'maf244', 'maf357', 'maf468'));

insert into public.oem_references (product_id, manufacturer, reference_number, reference_type)
select p.id, sample.manufacturer, sample.reference_number, 'oem'
from (values
  ('SL 2074', 'Mitsubishi', 'ME034611'), ('SL 2074', 'Mitsubishi', 'ME034605'),
  ('MF-208', 'Isuzu', '8-98075-676-0'), ('MF-208', 'Mazda', 'WL51-14-302'),
  ('MF-315', 'BMW', '11428507683'), ('MF-315', 'Peugeot', '1109.AY'),
  ('MF-420', 'Caterpillar', '1R-1807'), ('MF-420', 'Perkins', '2654403'),
  ('MFF-112', 'Toyota', '23390-0L041'), ('MFF-112', 'Nissan', '16405-EB70A'),
  ('MFF-225', 'Isuzu', '8-98037-481-0'), ('MFF-225', 'Hino', '23304-EV023'),
  ('MFF-338', 'Cummins', 'FF5052'), ('MFF-338', 'Perkins', '26560163'),
  ('MFF-446', 'Volvo CE', '20430751'), ('MFF-446', 'Deutz', '01181245'),
  ('MAF-130', 'Toyota', '17801-0D060'), ('MAF-130', 'Subaru', '16546-AA120'),
  ('MAF-244', 'Isuzu', '8-98071-423-0'), ('MAF-244', 'Fuso', 'ME017242'),
  ('MAF-357', 'Caterpillar', '227-7448'), ('MAF-357', 'Komatsu', '600-185-4100'),
  ('MAF-468', 'Atlas Copco', '1613955900'), ('MAF-468', 'Cummins', 'AF25248')
) as sample(part_number, manufacturer, reference_number)
join public.products p on p.part_number_normalized = public.normalize_reference(sample.part_number);

insert into public.vehicle_brands (name, slug)
values ('Mitsubishi', 'mitsubishi'), ('Isuzu', 'isuzu'), ('BMW', 'bmw'), ('Toyota', 'toyota')
on conflict (name) do update set slug = excluded.slug;

insert into public.vehicle_models (vehicle_brand_id, name, slug)
select brand.id, sample.model, public.slugify(sample.model)
from (values ('Mitsubishi', 'Passenger Vehicle'), ('Isuzu', 'D-Max'), ('Isuzu', 'N-Series'), ('BMW', '3 Series'), ('Toyota', 'Hilux'), ('Toyota', 'Corolla')) as sample(brand, model)
join public.vehicle_brands brand on brand.name = sample.brand
on conflict (vehicle_brand_id, slug) do update set name = excluded.name;

insert into public.engine_models (manufacturer, model, slug)
values
  ('Mitsubishi', '1NZ-FE', 'mitsubishi-1nz-fe'), ('Isuzu', '4JJ1', 'isuzu-4jj1'), ('BMW', 'N47', 'bmw-n47'),
  ('Caterpillar', 'C4.4', 'caterpillar-c4-4'), ('Toyota', '1KD-FTV', 'toyota-1kd-ftv'), ('Isuzu', '4HK1', 'isuzu-4hk1'),
  ('Cummins', '6BT5.9', 'cummins-6bt5-9'), ('Volvo CE', 'D6D', 'volvo-ce-d6d'), ('Toyota', '2ZR-FE', 'toyota-2zr-fe'),
  ('Caterpillar', 'C6.6', 'caterpillar-c6-6'), ('Cummins', 'QSL9', 'cummins-qsl9')
on conflict (manufacturer, model) do update set slug = excluded.slug;

delete from public.product_vehicle_applications
where product_id in (select id from public.products where part_number_normalized in ('sl2074', 'mf208', 'mf315', 'mff112', 'mff225', 'maf130', 'maf244'));

insert into public.product_vehicle_applications (product_id, vehicle_model_id, engine_model_id, notes)
select product.id, vehicle.id, engine.id, 'Demo fitment – verify against the vehicle VIN and official application guide.'
from (values
  ('SL 2074', 'Mitsubishi', 'Passenger Vehicle', 'Mitsubishi', '1NZ-FE'),
  ('MF-208', 'Isuzu', 'D-Max', 'Isuzu', '4JJ1'),
  ('MF-315', 'BMW', '3 Series', 'BMW', 'N47'),
  ('MFF-112', 'Toyota', 'Hilux', 'Toyota', '1KD-FTV'),
  ('MFF-225', 'Isuzu', 'N-Series', 'Isuzu', '4HK1'),
  ('MAF-130', 'Toyota', 'Corolla', 'Toyota', '2ZR-FE'),
  ('MAF-244', 'Isuzu', 'N-Series', 'Isuzu', '4JJ1')
) as sample(part_number, brand, model, engine_manufacturer, engine_model)
join public.products product on product.part_number_normalized = public.normalize_reference(sample.part_number)
join public.vehicle_brands brand on brand.name = sample.brand
join public.vehicle_models vehicle on vehicle.vehicle_brand_id = brand.id and vehicle.name = sample.model
join public.engine_models engine on engine.manufacturer = sample.engine_manufacturer and engine.model = sample.engine_model;

insert into public.equipment_types (name, slug, industry)
values
  ('Construction Equipment', 'construction-equipment', 'Construction'),
  ('Generator', 'generator', 'Power generation'),
  ('Industrial Equipment', 'industrial-equipment', 'Industrial')
on conflict (name) do update set industry = excluded.industry;

delete from public.product_equipment_applications
where product_id in (select id from public.products where part_number_normalized in ('mf420', 'mff338', 'mff446', 'maf357', 'maf468'));

insert into public.product_equipment_applications (product_id, equipment_type_id, manufacturer, model, engine_model_id, notes)
select product.id, equipment.id, sample.manufacturer, sample.model, engine.id, 'Demo application – confirm the equipment serial number before supply.'
from (values
  ('MF-420', 'Construction Equipment', 'Caterpillar', 'Selected C4.4 platforms', 'Caterpillar', 'C4.4'),
  ('MFF-338', 'Generator', 'Cummins', 'Selected 6BT5.9 sets', 'Cummins', '6BT5.9'),
  ('MFF-446', 'Construction Equipment', 'Volvo CE', 'Selected D6D platforms', 'Volvo CE', 'D6D'),
  ('MAF-357', 'Construction Equipment', 'Caterpillar', 'Selected C6.6 platforms', 'Caterpillar', 'C6.6'),
  ('MAF-468', 'Industrial Equipment', 'Cummins', 'Selected QSL9 platforms', 'Cummins', 'QSL9')
) as sample(part_number, equipment_type, manufacturer, model, engine_manufacturer, engine_model)
join public.products product on product.part_number_normalized = public.normalize_reference(sample.part_number)
join public.equipment_types equipment on equipment.name = sample.equipment_type
join public.engine_models engine on engine.manufacturer = sample.engine_manufacturer and engine.model = sample.engine_model;

commit;
