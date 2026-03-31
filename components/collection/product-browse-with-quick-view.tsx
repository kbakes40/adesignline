'use client';

import ProductGridItems from 'components/layout/product-grid-items';
import ProductQuickViewModal from 'components/product/product-quick-view-modal';
import type { VercelProduct } from 'lib/bigcommerce/types';
import { findProductByUrlParam, productSlugForUrl } from 'lib/product-public-url';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ProductBrowseWithQuickView({
  products,
  catalogMode = 'memory'
}: {
  products: VercelProduct[];
  /** `supabase`: grid has listing stubs — fetch full product for modal. */
  catalogMode?: 'supabase' | 'memory';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<VercelProduct | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const productParam = searchParams.get('product');

  useEffect(() => {
    if (!productParam) {
      setSelected(null);
      setDetailLoading(false);
      return;
    }

    if (catalogMode !== 'supabase') {
      setSelected(findProductByUrlParam(products, productParam) ?? null);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    fetch(`/api/catalog/product/${encodeURIComponent(productParam)}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((j: { product?: VercelProduct }) => {
        if (!cancelled) setSelected(j.product ?? null);
      })
      .catch(() => {
        if (!cancelled) setSelected(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productParam, products, catalogMode]);

  const openProduct = useCallback(
    (p: VercelProduct) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('product', productSlugForUrl(p));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const closeModal = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('product');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <>
      <ProductGridItems products={products} onProductSelect={openProduct} />
      <ProductQuickViewModal
        product={selected}
        loading={detailLoading}
        open={!!productParam}
        onClose={closeModal}
      />
    </>
  );
}
