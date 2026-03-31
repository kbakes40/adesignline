'use client';

import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Price from 'components/price';
import type { VercelCart as Cart } from 'lib/bigcommerce/types';
import { DEFAULT_OPTION } from 'lib/constants';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import CloseCart from './close-cart';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import { labelForPlacementPreset } from 'lib/placement-labels';
import OpenCart from './open-cart';

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({ cart }: { cart: Cart | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (cart?.totalQuantity !== quantityRef.current) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, quantityRef]);

  return (
    <>
      <button
        type="button"
        id="cart-icon-target"
        aria-label="Open cart"
        onClick={openCart}
        className="rounded-md outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      >
        <OpenCart quantity={cart?.totalQuantity} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-[#f8f7f4] p-6 text-black md:w-[420px]">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <p className="text-[12px] text-neutral-500">Cart</p>
                  <p className="mt-1 text-lg text-black">Current order</p>
                </div>
                <button aria-label="Close cart" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {!cart || cart.lines.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden text-center">
                  <ShoppingCartIcon className="h-14" />
                  <p className="mt-6 text-3xl font-medium">Your order is empty.</p>
                  <p className="mt-3 max-w-xs text-[13px] leading-6 text-neutral-500">
                    Start with branded apparel, gift ideas, top sellers, or a custom program request.
                  </p>
                  <Link href="/search" onClick={closeCart} className="mt-6 rounded-full bg-black px-5 py-3 text-[13px] text-white transition hover:bg-black/85">
                    Shop products
                  </Link>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden">
                  <ul className="flex-grow overflow-auto py-4">
                    {cart.lines.map((item) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;
                      item.merchandise.selectedOptions.forEach(({ name, value }) => {
                        if (value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[name.toLowerCase()] = value;
                        }
                      });

                      const merchandiseUrl = createUrl(
                        item.merchandise.product.handle,
                        new URLSearchParams(merchandiseSearchParams)
                      );

                      return (
                        <li key={item.id} className="flex w-full flex-col border-b border-neutral-200">
                          <div className="relative flex w-full flex-row justify-between px-1 py-4">
                            <div className="absolute z-40 -mt-2 ml-[55px]">
                              <DeleteItemButton item={item} />
                            </div>
                            <Link href={merchandiseUrl} onClick={closeCart} className="z-30 flex flex-row space-x-4">
                              <div className="relative h-16 w-16 overflow-hidden bg-neutral-200">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={64}
                                  height={64}
                                  alt={item.merchandise.product.featuredImage.altText || item.merchandise.product.title}
                                  src={item.merchandise.product.featuredImage.url}
                                />
                              </div>

                              <div className="flex flex-1 flex-col text-[13px]">
                                <span className="leading-tight text-black">{item.merchandise.product.title}</span>
                                {item.merchandise.title !== DEFAULT_OPTION ? (
                                  <p className="mt-1 text-[12px] text-neutral-500">{item.merchandise.title}</p>
                                ) : null}
                                {item.customization ? (
                                  <div className="mt-2 space-y-0.5 border-t border-neutral-100 pt-2 text-[11px] text-neutral-600">
                                    {item.customization.noPersonalizationRequested ? (
                                      <p>No personalization requested</p>
                                    ) : item.customization.artworkFileName || item.customization.artworkUrl ? (
                                      <p>
                                        Artwork:{' '}
                                        <span className="font-medium text-black">
                                          {item.customization.artworkFileName ?? 'Uploaded file'}
                                        </span>
                                      </p>
                                    ) : null}
                                    {item.customization.artworkInstructions ? (
                                      <p className="line-clamp-3 text-[11px] leading-snug">
                                        Notes: {item.customization.artworkInstructions}
                                      </p>
                                    ) : null}
                                    {!item.customization.noPersonalizationRequested &&
                                    item.customization.placementPreset ? (
                                      <p className="text-[11px] text-neutral-500">
                                        Placement:{' '}
                                        <span className="text-neutral-700">
                                          {labelForPlacementPreset(item.customization.placementPreset)}
                                        </span>
                                        {item.customization.placementScale != null ? (
                                          <span className="ml-1">
                                            · scale {Math.round(item.customization.placementScale * 100)}%
                                          </span>
                                        ) : null}
                                      </p>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </Link>
                            <div className="flex h-16 flex-col justify-between">
                              <Price className="flex justify-end text-right text-[13px] text-black" amount={item.cost.totalAmount.amount} currencyCode={item.cost.totalAmount.currencyCode} />
                              <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 bg-white">
                                <EditItemQuantityButton item={item} type="minus" />
                                <p className="w-6 text-center"><span className="w-full text-sm">{item.quantity}</span></p>
                                <EditItemQuantityButton item={item} type="plus" />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="py-4 text-[13px] text-neutral-500">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-2">
                      <p>Taxes</p>
                      <Price className="text-right text-[13px] text-black" amount={cart.cost.totalTaxAmount.amount} currencyCode={cart.cost.totalTaxAmount.currencyCode || 'USD'} />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-2 pt-1">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2 pt-1">
                      <p>Total</p>
                      <Price className="text-right text-[14px] text-black" amount={cart.cost.totalAmount.amount} currencyCode={cart.cost.totalAmount.currencyCode || 'USD'} />
                    </div>
                  </div>
                  <a href={cart.checkoutUrl} className="block w-full rounded-full bg-black p-3 text-center text-[13px] text-white transition hover:bg-black/85">
                    Continue to checkout
                  </a>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
