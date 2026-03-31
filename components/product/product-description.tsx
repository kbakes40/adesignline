import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { ProductCatalogTabs } from 'components/product/product-catalog-tabs';
import { VercelProduct as Product } from 'lib/bigcommerce/types';
import { catalogHasQuantityPricing } from 'lib/quantity-pricing';
import { VariantSelector } from './variant-selector';

function productQualifier(product: Product) {
  if (product.tags.includes('patches')) return 'Patches';
  const title = product.title;
  if (title.toLowerCase().includes('nike')) return 'Nike';
  if (title.toLowerCase().includes('gift')) return 'Gift Ideas';
  if (title.toLowerCase().includes('hoodie')) return 'Apparel';
  if (title.toLowerCase().includes('program')) return 'Custom Program';
  return 'Promotional Product';
}

export function ProductDescription({ product }: { product: Product }) {
  const c = product.catalog;

  return (
    <>
      <div className="mb-5 flex flex-col border-b border-neutral-200 pb-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">{productQualifier(product)}</p>
        <h1 className="mb-2 text-[2.1rem] font-medium leading-[1.1] tracking-[-0.04em] text-black md:text-[2.35rem] lg:text-[2.75rem]">
          {product.title}
        </h1>
        {c?.supplierSku ? (
          <p className="mb-4 font-mono text-[13px] text-neutral-600">
            #{c.supplierSku}
          </p>
        ) : null}
        <div className="mr-auto flex flex-wrap items-center gap-2">
          {catalogHasQuantityPricing(c) ? (
            <div className="rounded-full bg-black px-4 py-2 text-[12px] text-white">
              <span className="tabular-nums">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: product.priceRange.maxVariantPrice.currencyCode,
                  currencyDisplay: 'narrowSymbol'
                }).format(
                  Math.min(...c.quantityPrices.map((x) => x.unitPrice))
                )}
              </span>
              <span className="mx-1 opacity-75">–</span>
              <span className="tabular-nums">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: product.priceRange.maxVariantPrice.currencyCode,
                  currencyDisplay: 'narrowSymbol'
                }).format(
                  Math.max(...c.quantityPrices.map((x) => x.unitPrice))
                )}
              </span>
              <span className="ml-1.5 text-[11px] font-normal opacity-90">each by qty</span>
            </div>
          ) : (
            <div className="rounded-full bg-black px-4 py-2 text-[12px] text-white">
              <Price
                amount={product.priceRange.maxVariantPrice.amount}
                currencyCode={product.priceRange.maxVariantPrice.currencyCode}
              />
            </div>
          )}
        </div>
      </div>

      {c?.featureBullets?.length ? (
        <ul className="mb-4 list-disc space-y-1 pl-5 text-[13px] leading-snug text-neutral-700">
          {c.featureBullets.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}

      {(c?.productionDays != null || c?.minQuantity != null || c?.weightDisplay || c?.dimensionsDisplay) ? (
        <dl className="mb-5 grid gap-2.5 rounded-sm border border-neutral-200 bg-[#f8f7f4] p-3.5 text-[12px] sm:grid-cols-2">
          {c?.productionDays != null ? (
            <div>
              <dt className="text-neutral-500">Normal production time</dt>
              <dd className="mt-0.5 font-medium text-black">
                {c.productionDays} working day{c.productionDays === 1 ? '' : 's'}
              </dd>
            </div>
          ) : null}
          {c?.minQuantity != null ? (
            <div>
              <dt className="text-neutral-500">Minimum quantity</dt>
              <dd className="mt-0.5 font-medium text-black">{c.minQuantity}</dd>
            </div>
          ) : null}
          {c?.weightDisplay ? (
            <div>
              <dt className="text-neutral-500">Weight</dt>
              <dd className="mt-0.5 font-medium text-black">{c.weightDisplay}</dd>
            </div>
          ) : null}
          {c?.dimensionsDisplay ? (
            <div>
              <dt className="text-neutral-500">Product size</dt>
              <dd className="mt-0.5 font-medium text-black">{c.dimensionsDisplay}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {product.options.length ? <VariantSelector options={product.options} variants={product.variants} /> : null}

      <div className="mb-5">
        <ProductCatalogTabs
          product={product}
          descriptionSlot={
            product.descriptionHtml ? (
              <Prose compact className="text-neutral-700" html={product.descriptionHtml} />
            ) : undefined
          }
          productOptionsSlot={
            product.catalog?.productOptionsHtml ? (
              <Prose compact className="text-neutral-700" html={product.catalog.productOptionsHtml} />
            ) : undefined
          }
          inventorySlot={
            product.catalog?.inventoryHtml ? (
              <Prose compact className="text-neutral-700" html={product.catalog.inventoryHtml} />
            ) : undefined
          }
          salesToolsSlot={
            product.catalog?.salesToolsHtml ? (
              <Prose compact className="text-neutral-700" html={product.catalog.salesToolsHtml} />
            ) : undefined
          }
        />
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 text-[13px] leading-snug text-neutral-600">
        <p className="text-black">Why brands choose A Design Line</p>
        <p className="mt-2">
          Premium product presentation, guided ordering support, and programs that help branded merchandise feel more
          elevated and intentional.
        </p>
      </div>

      <AddToCart
        variants={product.variants}
        availableForSale={product.availableForSale}
        imageUrl={product.featuredImage?.url}
      />
    </>
  );
}
