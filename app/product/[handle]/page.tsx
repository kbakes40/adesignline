import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { GridTileImage } from 'components/grid/tile';
import Footer from 'components/layout/footer';
import { Gallery } from 'components/product/gallery';
import { ProductDescription } from 'components/product/product-description';
import { getProduct, getProductRecommendations } from 'lib/bigcommerce';
import { Image } from 'lib/bigcommerce/types';
import { HIDDEN_PRODUCT_TAG } from 'lib/constants';
import { resolvePublicProductDetailImageUrl, resolvePublicProductThumbUrl } from 'lib/supabase/storage';
import Link from 'next/link';

export const runtime = 'edge';

export async function generateMetadata({
  params
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const ogImageUrl = url ? resolvePublicProductDetailImageUrl(url) : undefined;
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable
      }
    },
    openGraph: ogImageUrl
      ? {
          images: [
            {
              url: ogImageUrl,
              width,
              height,
              alt
            }
          ]
        }
      : null
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url
      ? resolvePublicProductDetailImageUrl(product.featuredImage.url)
      : undefined,
    offers: {
      '@type': 'AggregateOffer',
      availability: product.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <div className="mx-auto max-w-screen-2xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-3">
            <Gallery
              images={product.images.map((image: Image) => ({
                src: resolvePublicProductDetailImageUrl(image.url),
                altText: image.altText
              }))}
            />
          </div>

          <div className="min-w-0 max-w-xl pt-0 lg:pt-1">
            <ProductDescription product={product} />
          </div>
        </div>
        <Suspense>
          <RelatedProducts id={product.id} />
        </Suspense>
      </div>
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-black sm:text-base">Related Products</p>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            More branded merchandise and premium product options from A Design Line.
          </p>
        </div>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <li key={product.handle} className="aspect-square w-full">
            <Link className="relative block h-full w-full" href={`${product.handle}`}>
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode
                }}
                src={
                  product.featuredImage?.url
                    ? resolvePublicProductThumbUrl(product.featuredImage.url)
                    : ''
                }
                fill
                quality={90}
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
