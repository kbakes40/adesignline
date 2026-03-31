'use client';

import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addItemForm } from 'components/cart/actions';
import { QuickViewAddFormActions } from 'components/cart/quick-view-add-form-actions';
import Price from 'components/price';
import { PatchCustomizationFlow } from 'components/product/patch-customization-flow';
import { ProductOptionSelectors } from 'components/product/product-option-selectors';
import { ModalProductGallery } from 'components/product/modal-product-gallery';
import { ProductCustomizationUpload } from 'components/product/product-customization-upload';
import type {
  LineItemCustomization,
  VercelProduct as Product,
  VercelProductVariant as ProductVariant
} from 'lib/bigcommerce/types';
import { createDefaultLineCustomization } from 'lib/customization-defaults';
import { productSupportsCustomization } from 'lib/product-customization';
import { isPatchProduct } from 'lib/product-patch';
import { usePrefersReducedMotion } from 'hooks/use-prefers-reduced-motion';
import { QUICK_VIEW_IMAGE_ORIGIN_ID, runAddToCartFeedback } from 'lib/add-to-cart-animation';
import { skuForProduct } from 'lib/sku-for-product';
import { maxOrderQuantityForProduct, unitPriceForQuantity } from 'lib/quantity-pricing';
import { resolvePublicProductDetailImageUrl } from 'lib/supabase/storage';
import { useRouter } from 'next/navigation';
import { Fragment, useActionState, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

function plainTextSnippet(htmlOrText: string, maxLen = 320): string {
  const t = htmlOrText
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

function minQty(product: Product): number {
  return product.catalog?.minQuantity ?? 1;
}

function pdpHrefFromHandle(handle: string): string {
  const h = handle.trim();
  if (!h) return '/';
  return h.startsWith('/') ? h : `/${h}`;
}

export default function ProductQuickViewModal({
  product,
  loading = false,
  open,
  onClose
}: {
  product: Product | null;
  /** True while fetching full product (Supabase listing mode). */
  loading?: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [message, formAction] = useActionState(addItemForm, null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [customization, setCustomization] = useState<LineItemCustomization | null>(null);
  const [artworkUploading, setArtworkUploading] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    if (!product) return;
    setQuantity(Math.max(minQty(product), 1));
    setSelectedVariant(product.variants[0]);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = product.images?.length
      ? product.images
      : product.featuredImage?.url
        ? [product.featuredImage]
        : [];
    return list.map((img) => ({
      src: resolvePublicProductDetailImageUrl(img.url),
      altText: img.altText || product.title
    }));
  }, [product]);

  useLayoutEffect(() => {
    if (!product) return;
    setCustomization(
      productSupportsCustomization(product) ? createDefaultLineCustomization(product, galleryImages) : null
    );
  }, [product, galleryImages]);

  const patchCustomization = useCallback((patch: Partial<LineItemCustomization>) => {
    setCustomization((prev) => {
      if (!prev && product && productSupportsCustomization(product)) {
        return { ...createDefaultLineCustomization(product, galleryImages), ...patch };
      }
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  }, [product, galleryImages]);

  const handleVariantChange = useCallback((v: ProductVariant | undefined) => {
    setSelectedVariant(v);
  }, []);

  const displayCustomization = useMemo(() => {
    if (!product || !productSupportsCustomization(product)) return null;
    return customization ?? createDefaultLineCustomization(product, galleryImages);
  }, [product, customization, galleryImages]);

  const customizationJson = useMemo(() => {
    if (!product || !productSupportsCustomization(product)) return '';
    const c = customization ?? createDefaultLineCustomization(product, galleryImages);
    return JSON.stringify(c);
  }, [product, customization, galleryImages]);

  const originImageUrl = useMemo(
    () => galleryImages[0]?.src ?? product?.featuredImage?.url ?? '',
    [galleryImages, product?.featuredImage?.url]
  );

  const handleAddSuccess = useCallback(async () => {
    try {
      await router.refresh();
      runAddToCartFeedback({
        imageUrl: originImageUrl,
        originId: QUICK_VIEW_IMAGE_ORIGIN_ID,
        reducedMotion,
        playSound: !reducedMotion
      });
      setAddedFlash(true);
      window.setTimeout(() => setAddedFlash(false), 1200);
    } catch (e) {
      console.error(e);
    }
  }, [router, originImageUrl, reducedMotion]);

  const displayPrice = useMemo(() => {
    if (!product?.variants?.length) return null;
    const ev = selectedVariant ?? product.variants[0];
    if (!ev) return null;
    const base = ev.price;
    const tiers = product.catalog?.quantityPrices;
    const mq = product.catalog?.minQuantity ?? 1;
    if (tiers?.length && quantity >= mq) {
      const u = unitPriceForQuantity(quantity, tiers);
      if (u != null) return { amount: u.toFixed(2), currencyCode: base.currencyCode };
    }
    return base;
  }, [product, selectedVariant, quantity]);

  const priceRangeDiffers =
    product != null &&
    product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount;

  if (!open) return null;

  if (loading && !product) {
    return (
      <Transition show={open} as={Fragment}>
        <Dialog onClose={onClose} className="relative z-[60]">
          <div className="fixed inset-0 overflow-y-auto bg-black/40" onClick={onClose}>
            <div className="flex min-h-full items-end justify-center md:items-center md:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
                enterTo="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
                leave="ease-in duration-150"
                leaveFrom="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
                leaveTo="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-[#f8f7f4] shadow-2xl md:rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex min-h-[200px] items-center justify-center px-6 py-16">
                    <p className="text-[13px] text-neutral-600">Loading product…</p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  if (!product) {
    return (
      <Transition show={open} as={Fragment}>
        <Dialog onClose={onClose} className="relative z-[60]">
          <div className="fixed inset-0 overflow-y-auto bg-black/40" onClick={onClose}>
            <div className="flex min-h-full items-end justify-center md:items-center md:p-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
                enterTo="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
                leave="ease-in duration-150"
                leaveFrom="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
                leaveTo="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-[#f8f7f4] p-8 shadow-2xl md:rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[13px] text-neutral-600">Product could not be loaded.</p>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  const pdpHref = pdpHrefFromHandle(product.handle);

  const effectiveVariant = selectedVariant ?? product.variants[0];
  const variantId = effectiveVariant?.id;
  const productId = effectiveVariant?.parentId ?? product.id;

  const mq = minQty(product);
  const maxQty = maxOrderQuantityForProduct(product);
  const sku = skuForProduct(product);
  const canAdd =
    product.availableForSale &&
    !!variantId &&
    (effectiveVariant?.availableForSale ?? true);

  const configurationDone =
    !product.options.length ||
    Boolean(variantId && effectiveVariant && (effectiveVariant.availableForSale ?? true));

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[60]">
        <div className="fixed inset-0 overflow-y-auto bg-black/40" onClick={onClose}>
          <div className="flex min-h-full items-end justify-center md:items-center md:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
              enterTo="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100 md:translate-y-0 md:scale-100"
              leaveTo="translate-y-full opacity-95 md:translate-y-4 md:scale-95"
            >
              <Dialog.Panel
                className="flex max-h-[min(94vh,960px)] w-full max-w-[min(100%,88rem)] flex-col overflow-hidden rounded-t-2xl bg-[#f8f7f4] shadow-2xl md:max-h-[92vh] md:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-4 py-3 md:px-6">
                  <Dialog.Title className="line-clamp-2 pr-8 text-left text-[13px] font-semibold text-black md:text-[15px]">
                    {product.title}
                  </Dialog.Title>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-200/80 hover:text-black"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
                  <div className="shrink-0 border-neutral-200/80 bg-white p-3 sm:p-4 md:w-[min(62%,min(92vw,760px))] md:border-r md:p-5 lg:w-[min(56%,min(92vw,820px))]">
                    <ModalProductGallery
                      images={galleryImages}
                      productTitle={product.title}
                      customization={productSupportsCustomization(product) ? displayCustomization ?? undefined : undefined}
                      onCustomizationChange={
                        productSupportsCustomization(product) ? patchCustomization : undefined
                      }
                      showArtworkOverlay={productSupportsCustomization(product)}
                    />
                  </div>

                  {productSupportsCustomization(product) ? (
                    isPatchProduct(product) ? (
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
                        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 md:p-6 md:pb-28 lg:pb-8">
                          <div className="space-y-5 md:space-y-6">
                            {sku ? (
                              <p className="font-mono text-[12px] text-neutral-500">
                                SKU <span className="text-neutral-800">#{sku}</span>
                              </p>
                            ) : null}

                            <div className="flex flex-wrap items-baseline gap-2">
                              {displayPrice ? (
                                <span className="rounded-full bg-black px-3 py-1.5 text-[13px] text-white">
                                  <Price amount={displayPrice.amount} currencyCode={displayPrice.currencyCode} />
                                </span>
                              ) : null}
                              {priceRangeDiffers ? (
                                <span className="text-[12px] text-neutral-500">Price varies by option</span>
                              ) : null}
                            </div>

                            <p className="text-[13px] leading-relaxed text-neutral-600">
                              {plainTextSnippet(product.descriptionHtml || product.description, 400)}
                            </p>

                            {product.catalog?.minQuantity != null ? (
                              <p className="text-[12px] text-neutral-500">Minimum order quantity: {mq}</p>
                            ) : null}

                            {product.catalog?.quantityPrices && product.catalog.quantityPrices.length > 0 ? (
                              <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
                                <p className="border-b border-neutral-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                                  Quantity pricing (USD)
                                </p>
                                <table className="w-full min-w-[240px] border-collapse text-left text-[12px]">
                                  <thead>
                                    <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-wide text-neutral-500">
                                      <th className="py-2 pl-3 pr-2 font-medium">Quantity</th>
                                      <th className="py-2 pr-3 font-medium">Each</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.catalog.quantityPrices.map((row) => (
                                      <tr key={row.quantity} className="border-b border-neutral-100 last:border-0">
                                        <td className="py-1.5 pl-3 pr-2 tabular-nums text-neutral-800">{row.quantity}</td>
                                        <td className="py-1.5 pr-3 tabular-nums text-neutral-800">
                                          ${Number(row.unitPrice).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : null}

                            {!product.variants.length ? (
                              <p className="text-[13px] text-red-600" role="alert">
                                This product is not available to add online right now.
                              </p>
                            ) : null}

                            <a
                              href={pdpHref}
                              className="inline-block cursor-pointer text-[13px] font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline"
                              onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(pdpHref);
                              }}
                            >
                              View full details
                            </a>
                          </div>
                        </div>

                        <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-neutral-200/80 bg-white lg:max-w-[min(480px,48%)] lg:w-[min(480px,48%)] lg:border-l lg:border-t-0">
                          <PatchCustomizationFlow
                            product={product}
                            quantity={quantity}
                            minQty={mq}
                            maxQty={maxQty}
                            onQuantityChange={setQuantity}
                            displayPrice={displayPrice}
                            customization={
                              displayCustomization ?? createDefaultLineCustomization(product, galleryImages)
                            }
                            onCustomizationChange={patchCustomization}
                            onUploadingChange={setArtworkUploading}
                            onVariantChange={handleVariantChange}
                            configurationDone={configurationDone}
                            message={message}
                          />
                          <div className="hidden shrink-0 border-t border-neutral-200/80 bg-[#f8f7f4] px-5 py-5 md:block md:px-6">
                            <form key={product.id} action={formAction} className="space-y-3">
                              <input type="hidden" name="variantId" value={variantId ?? ''} />
                              <input type="hidden" name="productId" value={productId ?? ''} />
                              <input type="hidden" name="quantity" value={quantity} readOnly />
                              <input type="hidden" name="customization" value={customizationJson} readOnly />
                              <QuickViewAddFormActions
                                message={message}
                                onSuccess={handleAddSuccess}
                                availableForSale={canAdd}
                                selectedVariantId={variantId}
                                blocked={artworkUploading}
                                success={addedFlash}
                              />
                            </form>
                          </div>
                        </aside>
                      </div>
                    ) : (
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
                      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 md:p-6 md:pb-28 lg:pb-8">
                        <div className="space-y-5 md:space-y-6">
                          {sku ? (
                            <p className="font-mono text-[12px] text-neutral-500">
                              SKU <span className="text-neutral-800">#{sku}</span>
                            </p>
                          ) : null}

                          <div className="flex flex-wrap items-baseline gap-2">
                            {displayPrice ? (
                              <span className="rounded-full bg-black px-3 py-1.5 text-[13px] text-white">
                                <Price amount={displayPrice.amount} currencyCode={displayPrice.currencyCode} />
                              </span>
                            ) : null}
                            {priceRangeDiffers ? (
                              <span className="text-[12px] text-neutral-500">Price varies by option</span>
                            ) : null}
                          </div>

                          <p className="text-[13px] leading-relaxed text-neutral-600">
                            {plainTextSnippet(product.descriptionHtml || product.description, 400)}
                          </p>

                          {product.catalog?.minQuantity != null ? (
                            <p className="text-[12px] text-neutral-500">Minimum order quantity: {mq}</p>
                          ) : null}

                          {product.catalog?.quantityPrices && product.catalog.quantityPrices.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
                              <p className="border-b border-neutral-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                                Quantity pricing (USD)
                              </p>
                              <table className="w-full min-w-[240px] border-collapse text-left text-[12px]">
                                <thead>
                                  <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-wide text-neutral-500">
                                    <th className="py-2 pl-3 pr-2 font-medium">Quantity</th>
                                    <th className="py-2 pr-3 font-medium">Each</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.catalog.quantityPrices.map((row) => (
                                    <tr key={row.quantity} className="border-b border-neutral-100 last:border-0">
                                      <td className="py-1.5 pl-3 pr-2 tabular-nums text-neutral-800">{row.quantity}</td>
                                      <td className="py-1.5 pr-3 tabular-nums text-neutral-800">
                                        ${Number(row.unitPrice).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null}

                          {!product.variants.length ? (
                            <p className="text-[13px] text-red-600" role="alert">
                              This product is not available to add online right now.
                            </p>
                          ) : null}

                          {product.options.length ? (
                            <ProductOptionSelectors
                              options={product.options}
                              variants={product.variants}
                              onVariantChange={handleVariantChange}
                            />
                          ) : null}

                          <div className="flex max-w-xs items-center gap-3">
                            <label
                              htmlFor={`qv-qty-${product.id}`}
                              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
                            >
                              Quantity
                            </label>
                            <div className="flex items-center rounded-full border border-neutral-200 bg-white">
                              <button
                                type="button"
                                className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                                aria-label="Decrease quantity"
                                onClick={() => setQuantity((q) => Math.max(mq, q - 1))}
                              >
                                −
                              </button>
                              <input
                                id={`qv-qty-${product.id}`}
                                type="number"
                                min={mq}
                                max={maxQty}
                                value={quantity}
                                onChange={(e) => {
                                  const n = parseInt(e.target.value, 10);
                                  if (Number.isNaN(n)) return;
                                  setQuantity(Math.max(mq, Math.min(maxQty, n)));
                                }}
                                className="w-12 border-0 bg-transparent text-center text-[13px] focus:ring-0"
                              />
                              <button
                                type="button"
                                className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                                aria-label="Increase quantity"
                                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {message ? (
                            <p className="text-[13px] text-red-600" role="alert">
                              {message}
                            </p>
                          ) : null}

                          <a
                            href={pdpHref}
                            className="inline-block cursor-pointer text-[13px] font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline"
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(pdpHref);
                            }}
                          >
                            View full details
                          </a>
                        </div>
                      </div>

                      <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-neutral-200/80 bg-white lg:max-w-[min(420px,44%)] lg:w-[min(420px,44%)] lg:border-l lg:border-t-0">
                        <div className="shrink-0 border-b border-neutral-200/70 px-5 py-4 md:px-6 md:py-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            Customize your product
                          </p>
                          <p className="mt-2 max-w-[38ch] text-[12px] leading-relaxed text-neutral-500">
                            Add your logo or artwork for decoration. We&apos;ll match placement to your program.
                          </p>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
                          <ProductCustomizationUpload
                            key={product.id}
                            embedded
                            product={product}
                            customization={displayCustomization ?? createDefaultLineCustomization(product, galleryImages)}
                            onCustomizationChange={patchCustomization}
                            onUploadingChange={setArtworkUploading}
                          />
                        </div>
                        <div className="hidden shrink-0 border-t border-neutral-200/80 bg-[#f8f7f4] px-5 py-5 md:block md:px-6">
                          <form key={product.id} action={formAction} className="space-y-3">
                            <input type="hidden" name="variantId" value={variantId ?? ''} />
                            <input type="hidden" name="productId" value={productId ?? ''} />
                            <input type="hidden" name="quantity" value={quantity} readOnly />
                            <input type="hidden" name="customization" value={customizationJson} readOnly />
                            <QuickViewAddFormActions
                              message={message}
                              onSuccess={handleAddSuccess}
                              availableForSale={canAdd}
                              selectedVariantId={variantId}
                              blocked={artworkUploading}
                              success={addedFlash}
                            />
                          </form>
                        </div>
                      </aside>
                    </div>
                    )
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col md:overflow-y-auto">
                      <div className="space-y-5 p-4 pb-28 md:space-y-6 md:p-8 md:pb-8">
                        {sku ? (
                          <p className="font-mono text-[12px] text-neutral-500">
                            SKU <span className="text-neutral-800">#{sku}</span>
                          </p>
                        ) : null}

                        <div className="flex flex-wrap items-baseline gap-2">
                          {displayPrice ? (
                            <span className="rounded-full bg-black px-3 py-1.5 text-[13px] text-white">
                              <Price amount={displayPrice.amount} currencyCode={displayPrice.currencyCode} />
                            </span>
                          ) : null}
                          {priceRangeDiffers ? (
                            <span className="text-[12px] text-neutral-500">Price varies by option</span>
                          ) : null}
                        </div>

                        <p className="text-[13px] leading-relaxed text-neutral-600">
                          {plainTextSnippet(product.descriptionHtml || product.description, 400)}
                        </p>

                        {product.catalog?.minQuantity != null ? (
                          <p className="text-[12px] text-neutral-500">Minimum order quantity: {mq}</p>
                        ) : null}

                        {product.catalog?.quantityPrices && product.catalog.quantityPrices.length > 0 ? (
                          <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
                            <p className="border-b border-neutral-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                              Quantity pricing (USD)
                            </p>
                            <table className="w-full min-w-[240px] border-collapse text-left text-[12px]">
                              <thead>
                                <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-wide text-neutral-500">
                                  <th className="py-2 pl-3 pr-2 font-medium">Quantity</th>
                                  <th className="py-2 pr-3 font-medium">Each</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.catalog.quantityPrices.map((row) => (
                                  <tr key={row.quantity} className="border-b border-neutral-100 last:border-0">
                                    <td className="py-1.5 pl-3 pr-2 tabular-nums text-neutral-800">{row.quantity}</td>
                                    <td className="py-1.5 pr-3 tabular-nums text-neutral-800">
                                      ${Number(row.unitPrice).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {!product.variants.length ? (
                          <p className="text-[13px] text-red-600" role="alert">
                            This product is not available to add online right now.
                          </p>
                        ) : null}

                        {product.options.length ? (
                          <ProductOptionSelectors
                            options={product.options}
                            variants={product.variants}
                            onVariantChange={handleVariantChange}
                          />
                        ) : null}

                        <div className="flex max-w-xs items-center gap-3">
                          <label
                            htmlFor={`qv-qty-${product.id}`}
                            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
                          >
                            Quantity
                          </label>
                          <div className="flex items-center rounded-full border border-neutral-200 bg-white">
                            <button
                              type="button"
                              className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                              aria-label="Decrease quantity"
                              onClick={() => setQuantity((q) => Math.max(mq, q - 1))}
                            >
                              −
                            </button>
                            <input
                              id={`qv-qty-${product.id}`}
                              type="number"
                              min={mq}
                              max={maxQty}
                              value={quantity}
                              onChange={(e) => {
                                const n = parseInt(e.target.value, 10);
                                if (Number.isNaN(n)) return;
                                setQuantity(Math.max(mq, Math.min(maxQty, n)));
                              }}
                              className="w-12 border-0 bg-transparent text-center text-[13px] focus:ring-0"
                            />
                            <button
                              type="button"
                              className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                              aria-label="Increase quantity"
                              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {message ? (
                          <p className="text-[13px] text-red-600" role="alert">
                            {message}
                          </p>
                        ) : null}

                        <div className="hidden md:block">
                          <form key={product.id} action={formAction} className="space-y-3">
                            <input type="hidden" name="variantId" value={variantId ?? ''} />
                            <input type="hidden" name="productId" value={productId ?? ''} />
                            <input type="hidden" name="quantity" value={quantity} readOnly />
                            <QuickViewAddFormActions
                              message={message}
                              onSuccess={handleAddSuccess}
                              availableForSale={canAdd}
                              selectedVariantId={variantId}
                              blocked={artworkUploading}
                              success={addedFlash}
                            />
                          </form>
                        </div>

                        <a
                          href={pdpHref}
                          className="inline-block cursor-pointer text-[13px] font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline"
                          onClick={(e) => {
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(pdpHref);
                          }}
                        >
                          View full details
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="safe-area-pb sticky bottom-0 border-t border-neutral-200 bg-[#f8f7f4]/95 p-4 backdrop-blur md:hidden">
                  <form key={`${product.id}-m`} action={formAction} className="space-y-2">
                    <input type="hidden" name="variantId" value={variantId ?? ''} />
                    <input type="hidden" name="productId" value={productId ?? ''} />
                    <input type="hidden" name="quantity" value={quantity} readOnly />
                    {productSupportsCustomization(product) ? (
                      <input type="hidden" name="customization" value={customizationJson} readOnly />
                    ) : null}
                    <QuickViewAddFormActions
                      message={message}
                      onSuccess={handleAddSuccess}
                      availableForSale={canAdd}
                      selectedVariantId={variantId}
                      blocked={artworkUploading}
                      success={addedFlash}
                    />
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
