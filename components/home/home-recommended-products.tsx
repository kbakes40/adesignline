import { ProductCard } from 'components/product/product-card';
import { getCollectionProducts } from 'lib/bigcommerce';
import type { VercelProduct } from 'lib/bigcommerce/types';
import Link from 'next/link';

const PANEL_LIMIT = 16;

/** Excludes legacy seed items tagged `hidden-homepage-carousel`; home picks come from category catalog only. */
function fromCatalog(pool: VercelProduct[]): VercelProduct[] {
  return pool.filter((p) => !p.tags.includes('hidden-homepage-carousel')).slice(0, PANEL_LIMIT);
}

export default async function HomeRecommendedProducts() {
  const [tshirtPool, outerPool] = await Promise.all([
    getCollectionProducts({
      collection: 'categories',
      query: 't-shirt',
      sortKey: 'CREATED_AT',
      reverse: true
    }),
    getCollectionProducts({
      collection: 'categories',
      query: 'outerwear',
      sortKey: 'CREATED_AT',
      reverse: true
    })
  ]);

  const tshirts = fromCatalog(tshirtPool);
  const outerwear = fromCatalog(outerPool);

  if (!tshirts.length && !outerwear.length) return null;

  return (
    <section className="border-y border-neutral-200 bg-[#fafafa] py-10 sm:py-12 md:py-14 lg:py-16">
      <div className="mx-auto max-w-[min(100%,100rem)] px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-2 sm:mb-10 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-neutral-900 sm:text-3xl">
            Recommended products
          </h2>
          <p className="max-w-xl text-[13px] leading-relaxed text-neutral-600">
            Swipe between T‑shirts and outerwear on mobile; two columns on larger screens.
          </p>
        </div>

        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0">
          <RecommendedColumn
            title="T‑Shirts"
            href="/search/categories?q=t-shirt"
            products={tshirts}
            emptyFallback="No T‑shirt matches in the catalog yet."
          />
          <RecommendedColumn
            title="Outerwear"
            href="/search/categories?q=outerwear"
            products={outerwear}
            emptyFallback="No outerwear matches in the catalog yet."
          />
        </div>
      </div>
    </section>
  );
}

function RecommendedColumn({
  title,
  href,
  products,
  emptyFallback
}: {
  title: string;
  href: string;
  products: VercelProduct[];
  emptyFallback: string;
}) {
  return (
    <div className="flex w-[min(100vw-2rem,28rem)] shrink-0 snap-center flex-col md:w-auto md:min-w-0 md:snap-none">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-[17px] font-bold uppercase tracking-[0.14em] text-neutral-900 md:text-lg">{title}</h3>
        <Link href={href} className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0d4f52] underline-offset-2 hover:underline">
          Shop all
        </Link>
      </div>
      {products.length ? (
        <ul className="flex gap-4 overflow-x-auto pb-2 pt-0.5 [-webkit-overflow-scrolling:touch]">
          {products.map((product, i) => (
            <li key={product.id} className="w-[min(260px,calc(100vw-4rem))] shrink-0 sm:w-[240px]">
              <ProductCard product={product} imagePriority={i < 4} imageLoading={i < 4 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-neutral-500">{emptyFallback}</p>
      )}
    </div>
  );
}
