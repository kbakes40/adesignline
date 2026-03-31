'use client';

import { Tab } from '@headlessui/react';
import Price from 'components/price';
import { VercelProduct as Product } from 'lib/bigcommerce/types';
import clsx from 'clsx';
import type { ReactNode } from 'react';

const tabBtn =
  'rounded-t border border-b-0 border-transparent px-2.5 py-1.5 text-[12px] font-medium text-neutral-600 outline-none transition hover:text-black focus-visible:ring-2 focus-visible:ring-neutral-400';

export function ProductCatalogTabs({
  product,
  descriptionSlot,
  productOptionsSlot,
  inventorySlot,
  salesToolsSlot
}: {
  product: Product;
  /** Server-rendered `<Prose />` or similar; avoids importing server `Prose` inside this client module. */
  descriptionSlot?: ReactNode;
  productOptionsSlot?: ReactNode;
  inventorySlot?: ReactNode;
  salesToolsSlot?: ReactNode;
}) {
  return (
    <Tab.Group>
      <Tab.List className="flex flex-wrap gap-0 border-b border-neutral-200">
        <Tab className={({ selected }) => clsx(tabBtn, selected && 'border-neutral-200 bg-white text-black')}>
          Description
        </Tab>
        <Tab className={({ selected }) => clsx(tabBtn, selected && 'border-neutral-200 bg-white text-black')}>
          Product Options
        </Tab>
        <Tab className={({ selected }) => clsx(tabBtn, selected && 'border-neutral-200 bg-white text-black')}>
          Inventory
        </Tab>
        <Tab className={({ selected }) => clsx(tabBtn, selected && 'border-neutral-200 bg-white text-black')}>
          Sales Tools
        </Tab>
      </Tab.List>
      <Tab.Panels className="border border-t-0 border-neutral-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
        <Tab.Panel>
          {descriptionSlot ?? (
            <p className="text-[13px] leading-snug text-neutral-700">{product.description}</p>
          )}
        </Tab.Panel>
        <Tab.Panel>
          {productOptionsSlot ?? (
            <>
              <p className="mb-3 text-[12px] leading-snug text-neutral-500">
                Select a size above, or review variant pricing below. Decoration and setup may affect final quote.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500">
                      <th className="py-2 pr-4 font-medium">Variant</th>
                      <th className="py-2 pr-4 font-medium">SKU</th>
                      <th className="py-2 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id} className="border-b border-neutral-100">
                        <td className="py-2 pr-4 text-neutral-800">{v.title}</td>
                        <td className="py-2 pr-4 text-neutral-500">
                          {product.catalog?.supplierSku ?? '—'}
                          {v.selectedOptions.length ? ` · ${v.selectedOptions.map((o) => o.value).join(' / ')}` : ''}
                        </td>
                        <td className="py-2">
                          <Price
                            className="inline text-[13px]"
                            amount={v.price.amount}
                            currencyCode={v.price.currencyCode}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Tab.Panel>
        <Tab.Panel>
          {inventorySlot ?? (
            <p className="text-[13px] leading-snug text-neutral-700">
              Real-time inventory for promotional products is managed through your A Design Line account. Contact the
              studio for rush availability, exact stock, and coordinated fulfillment windows.
            </p>
          )}
        </Tab.Panel>
        <Tab.Panel>
          {salesToolsSlot ?? (
            <p className="text-[13px] leading-snug text-neutral-700">
              Art templates, decoration guidelines, and program assets are available to approved buyers. Request sales
              tools and virtual proofs when you add this item to a quote or speak with your merchandise specialist.
            </p>
          )}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
