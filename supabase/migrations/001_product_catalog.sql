-- A Design Line — catalog listings (lightweight grid) + full detail JSON (modal / PDP)
-- Run in Supabase SQL editor or via supabase db push.

create table if not exists public.product_listings (
  id text primary key,
  handle text not null unique,
  slug text not null,
  title text not null,
  sku text,
  brand text,
  category text,
  subcategory text,
  thumbnail_url text not null,
  hero_url text,
  price_min numeric(12, 2) not null default 0,
  price_max numeric(12, 2) not null default 0,
  currency_code text not null default 'USD',
  short_description text,
  min_qty int,
  tags text[] not null default '{}',
  facet_multi jsonb not null default '{}'::jsonb,
  price_num numeric(12, 4) not null default 0,
  production_days int,
  min_qty_num int,
  width_in numeric(12, 4),
  length_in numeric(12, 4),
  height_in numeric(12, 4),
  updated_at timestamptz not null default now(),
  search_text text,
  merch_category text
);

create index if not exists product_listings_slug_idx on public.product_listings (slug);
create index if not exists product_listings_brand_idx on public.product_listings (brand);
create index if not exists product_listings_category_idx on public.product_listings (category);
create index if not exists product_listings_merch_category_idx on public.product_listings (merch_category);
create index if not exists product_listings_price_num_idx on public.product_listings (price_num);
create index if not exists product_listings_updated_at_idx on public.product_listings (updated_at desc);
create index if not exists product_listings_tags_gin on public.product_listings using gin (tags);
create index if not exists product_listings_facet_multi_gin on public.product_listings using gin (facet_multi);

create table if not exists public.product_details (
  id text primary key references public.product_listings (id) on delete cascade,
  payload jsonb not null
);

create index if not exists product_details_payload_gin on public.product_details using gin (payload);

alter table public.product_listings enable row level security;
alter table public.product_details enable row level security;

-- Public read for catalog (adjust if you need auth-only)
drop policy if exists "Allow public read listings" on public.product_listings;
create policy "Allow public read listings" on public.product_listings for select using (true);

drop policy if exists "Allow public read details" on public.product_details;
create policy "Allow public read details" on public.product_details for select using (true);

-- Service role bypasses RLS for sync scripts / admin

comment on table public.product_listings is 'Lightweight rows for grids; no full variants / HTML blobs.';
comment on table public.product_details is 'Full VercelProduct-compatible JSON for modal + PDP.';
