import { GridTileImage } from 'components/grid/tile';
import { VercelProduct as Product } from 'lib/bigcommerce/types';
import { supplierSkuFromTitle } from 'lib/nike-catalog-data';
import Link from 'next/link';

export function skuForProduct(product: Product): string | undefined {
  return product.catalog?.supplierSku ?? supplierSkuFromTitle(product.title);
}

function productionLine(product: Product): string | undefined {
  if (product.catalog?.productionDays != null) {
    const d = product.catalog.productionDays;
    return d === 1 ? '1 day production time' : `${d} days production time`;
  }
  const m = product.description.match(/^(\d+)\s*day\s+production/i);
  if (m) return `${m[1]} day production time`;
  return undefined;
}

function minQty(product: Product): number {
  return product.catalog?.minQuantity ?? 1;
}

/** Plain text for card blurbs (catalog imports often store HTML in description). */
function plainTextSnippet(htmlOrText: string, maxLen = 120): string {
  const t = htmlOrText
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

export function ProductCard({
  product,
  onSelect,
  imagePriority = false,
  imageLoading = 'lazy'
}: {
  product: Product;
  // eslint-disable-next-line no-unused-vars -- callback signature
  onSelect?: (product: Product) => void;
  /** First screenful: eager load + priority for LCP without loading every row. */
  imagePriority?: boolean;
  imageLoading?: 'lazy' | 'eager';
}) {
  const sku = skuForProduct(product);
  const prodLine = productionLine(product);
  const minP = product.priceRange.minVariantPrice.amount;
  const maxP = product.priceRange.maxVariantPrice.amount;
  const priceLine = minP !== maxP ? `From $${minP} – $${maxP} each` : `$${maxP}`;
  const mq = minQty(product);
  const inner = (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white p-3 shadow-sm transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-neutral-50">
        <GridTileImage
          alt={product.title}
          src={product.featuredImage?.url}
          fill
          priority={imagePriority}
          loading={imageLoading}
          quality={90}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 24vw, (min-width: 768px) 30vw, 45vw"
        />
      </div>
      <div className="mt-3 flex min-h-[7.5rem] flex-1 flex-col gap-1.5 text-left">
        <p className="line-clamp-2 text-[12px] font-semibold uppercase leading-snug tracking-[0.04em] text-black">
          {product.title}
        </p>
        <p className="min-h-[1rem] font-mono text-[10px] tabular-nums text-neutral-500">
          {sku ? <>#{sku}</> : '\u00a0'}
        </p>
        {prodLine ? (
          <p className="line-clamp-1 text-[11px] leading-snug text-neutral-600">{prodLine}</p>
        ) : !prodLine && product.description ? (
          <p className="line-clamp-2 text-[11px] leading-snug text-neutral-500">
            {plainTextSnippet(product.description, 100)}
          </p>
        ) : null}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-neutral-100 pt-2.5">
          <p className="text-[12px] font-medium tabular-nums text-black">{priceLine}</p>
          <p className="text-[10px] tabular-nums text-neutral-500">Min qty {mq}</p>
        </div>
      </div>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="group block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        aria-haspopup="dialog"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      href={product.handle}
    >
      {inner}
    </Link>
  );
}
