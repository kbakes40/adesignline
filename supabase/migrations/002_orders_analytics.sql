-- Analytics: orders + order_items
-- Line items reference public.product_listings(id) for titles/categories in the app catalog.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  total numeric(14, 2) not null default 0,
  channel text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text references public.product_listings (id) on delete set null,
  quantity int not null default 1 check (quantity >= 0),
  unit_price numeric(14, 2) not null default 0,
  unit_cost numeric(14, 2)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Allow anon read orders" on public.orders;
create policy "Allow anon read orders" on public.orders for select using (true);

drop policy if exists "Allow anon read order_items" on public.order_items;
create policy "Allow anon read order_items" on public.order_items for select using (true);

comment on table public.orders is 'Order headers — total, channel, created_at (paid/completed rows drive revenue).';
comment on table public.order_items is 'Line items — unit_price/unit_cost for profit; product_id → product_listings.id';
