'use client';

import {
  EnvelopeIcon,
  InformationCircleIcon,
  ListBulletIcon,
  ShoppingCartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItemForm } from 'components/cart/actions';
import { BRAND_MARK_GREEN } from 'lib/constants';
import type { VercelProduct as Product } from 'lib/bigcommerce/types';
import {
  isInProductList,
  toggleProductList,
  type ProductListEntry
} from 'lib/product-list-client';
import { skuForProduct } from 'lib/sku-for-product';
import { useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal, useFormStatus } from 'react-dom';

function productUrl(handle: string): string {
  const h = handle.replace(/^\//, '');
  if (typeof window === 'undefined') return `/${h}`;
  return `${window.location.origin}/${h}`;
}

function defaultVariant(product: Product) {
  return product.variants.find((x) => x.availableForSale) ?? product.variants[0];
}

function parseRecipientList(raw: string): string {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(',');
}

function CartAddFeedback({
  state,
  onSuccess
}: {
  state: string | null;
  onSuccess: () => void;
}) {
  const { pending } = useFormStatus();
  const prevPending = useRef(false);
  useEffect(() => {
    if (prevPending.current && !pending) {
      if (typeof state === 'string') {
        console.warn(state);
      } else {
        onSuccess();
      }
    }
    prevPending.current = pending;
  }, [pending, state, onSuccess]);
  return null;
}

type ModalKind = 'none' | 'email' | 'info';

function ModalBackdrop({
  open,
  onClose,
  children,
  labelledBy,
  panelClassName
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy: string;
  panelClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const layer = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          'relative z-10 flex max-h-[min(92vh,720px)] w-full flex-col rounded-t-2xl border border-neutral-200 bg-white shadow-2xl sm:max-h-[min(90vh,800px)] sm:rounded-2xl',
          panelClassName ?? 'sm:max-w-lg'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(layer, document.body);
}

export function ProductCardActionBar({ product }: { product: Product }) {
  const router = useRouter();
  const sku = skuForProduct(product);
  const variant = defaultVariant(product);
  const canAdd = Boolean(variant?.id && (variant.availableForSale ?? true) && product.availableForSale);
  const [formState, formAction] = useActionState(addItemForm, null as string | null);
  const [listOn, setListOn] = useState(false);
  const [modal, setModal] = useState<ModalKind>('none');

  const emailTitleId = useId();
  const infoTitleId = useId();

  /* Email product modal */
  const [recipientEmail, setRecipientEmail] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  const [yourName, setYourName] = useState('');
  const [emailSubject, setEmailSubject] = useState(product.title);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSendCopy, setEmailSendCopy] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);

  /* Request more info modal */
  const [qtyNeeded, setQtyNeeded] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [infoComments, setInfoComments] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [infoEmail, setInfoEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneExt, setPhoneExt] = useState('');
  const [fax, setFax] = useState('');
  const [company, setCompany] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [infoSendCopy, setInfoSendCopy] = useState(false);

  const productLine = sku ? `# ${sku} — ${product.title}` : product.title;

  useEffect(() => {
    setEmailSubject(product.title);
  }, [product.id, product.title]);

  const onCartSuccess = useCallback(() => {
    router.refresh();
    window.dispatchEvent(new CustomEvent('cart:added'));
  }, [router]);

  useEffect(() => {
    setListOn(isInProductList(product.id));
  }, [product.id]);

  const closeModals = useCallback(() => {
    setModal('none');
    setEmailPreview(false);
  }, []);

  const openEmailModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModal('email');
    setEmailPreview(false);
  }, []);

  const openInfoModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setModal('info');
  }, []);

  const toggleList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const entry: ProductListEntry = {
        id: product.id,
        handle: product.handle,
        title: product.title
      };
      const { inList } = toggleProductList(entry);
      setListOn(inList);
      window.dispatchEvent(new CustomEvent('productList:changed'));
    },
    [product]
  );

  const inquiryAddress =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_INQUIRY_EMAIL
      ? process.env.NEXT_PUBLIC_INQUIRY_EMAIL
      : '';

  const sendEmailProduct = useCallback(() => {
    const to = parseRecipientList(recipientEmail);
    if (!to) return;
    const url = productUrl(product.handle);
    let body = [
      `Product: ${product.title}`,
      sku ? `SKU: ${sku}` : '',
      `Link: ${url}`,
      '',
      `From: ${yourName || '(not provided)'}`,
      `Your email: ${yourEmail || '(not provided)'}`,
      '',
      emailMessage || '(No message)'
    ]
      .filter(Boolean)
      .join('\n');
    if (emailSendCopy && yourEmail.trim()) {
      body += `\n\n[Request: send a copy to ${yourEmail.trim()}]`;
    }
    const subj = emailSubject.trim() || product.title;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    closeModals();
  }, [
    recipientEmail,
    yourName,
    yourEmail,
    emailMessage,
    emailSubject,
    emailSendCopy,
    product.title,
    sku,
    product.handle,
    closeModals
  ]);

  const emailPreviewText = [
    `To: ${recipientEmail || '…'}`,
    `Subject: ${emailSubject || product.title}`,
    '',
    `Product: ${product.title}`,
    sku ? `SKU: ${sku}` : '',
    `Link: ${productUrl(product.handle)}`,
    '',
    `From: ${yourName || '—'}`,
    `Your email: ${yourEmail || '—'}`,
    '',
    emailMessage || '(No message yet)'
  ]
    .filter(Boolean)
    .join('\n');

  const sendInfoRequest = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const subject = encodeURIComponent(`Request more info: ${product.title}${sku ? ` (${sku})` : ''}`);
      const body = encodeURIComponent(
        [
          productLine,
          `Product link: ${productUrl(product.handle)}`,
          '',
          `Quantity needed: ${qtyNeeded || '—'}`,
          `Date needed: ${dateNeeded || '—'}`,
          '',
          `Comments:`,
          infoComments || '—',
          '',
          `First name: ${firstName || '—'}`,
          `Last name: ${lastName || '—'}`,
          `Email: ${infoEmail || '—'}`,
          `Phone: ${phone || '—'}`,
          `Extension: ${phoneExt || '—'}`,
          `Fax: ${fax || '—'}`,
          `Company: ${company || '—'}`,
          `Street: ${street || '—'}`,
          `City: ${city || '—'}`,
          `State: ${stateVal || '—'}`,
          `Zip: ${zip || '—'}`,
          infoSendCopy ? `\n[User requested a copy to their email]` : ''
        ].join('\n')
      );
      const to = inquiryAddress || '';
      if (to) {
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      } else {
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
      closeModals();
    },
    [
      productLine,
      product.handle,
      product.title,
      sku,
      qtyNeeded,
      dateNeeded,
      infoComments,
      firstName,
      lastName,
      infoEmail,
      phone,
      phoneExt,
      fax,
      company,
      street,
      city,
      stateVal,
      zip,
      infoSendCopy,
      inquiryAddress,
      closeModals
    ]
  );

  const fieldClass =
    'mt-1 w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-black/10';
  const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600';

  return (
    <>
      <div
        role="group"
        aria-label="Product actions"
        className="mt-auto grid shrink-0 grid-cols-4 border-t border-neutral-200/90 bg-neutral-50/90"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="border-r border-neutral-200/90">
          <form action={formAction} className="flex h-full min-h-[2.75rem] flex-col">
            <input type="hidden" name="variantId" value={variant?.id ?? ''} />
            <input type="hidden" name="productId" value={variant?.parentId ?? product.id} />
            <input type="hidden" name="quantity" value="1" readOnly />
            <CartAddFeedback state={formState} onSuccess={onCartSuccess} />
            <button
              type="submit"
              disabled={!canAdd}
              title="Add to cart"
              aria-label="Add to cart"
              className={clsx(
                'flex flex-1 items-center justify-center py-2.5 text-neutral-700 transition hover:bg-white hover:text-black',
                !canAdd && 'cursor-not-allowed opacity-40'
              )}
            >
              <ShoppingCartIcon className="h-5 w-5" aria-hidden />
            </button>
          </form>
        </div>

        <button
          type="button"
          title="Email product"
          aria-label="Email product"
          onClick={openEmailModal}
          className="flex items-center justify-center border-r border-neutral-200/90 py-2.5 text-neutral-700 transition hover:bg-white hover:text-black"
        >
          <EnvelopeIcon className="h-5 w-5" aria-hidden />
        </button>

        <button
          type="button"
          title="Request more info"
          aria-label="Request more info"
          onClick={openInfoModal}
          className="flex items-center justify-center border-r border-neutral-200/90 py-2.5 text-neutral-700 transition hover:bg-white hover:text-black"
        >
          <InformationCircleIcon className="h-5 w-5" aria-hidden />
        </button>

        <button
          type="button"
          title={listOn ? 'Remove from product list' : 'Add to product list'}
          aria-label={listOn ? 'Remove from product list' : 'Add to product list'}
          onClick={toggleList}
          className={clsx(
            'flex items-center justify-center py-2.5 transition hover:bg-white',
            listOn ? 'bg-neutral-200/70 text-black' : 'text-neutral-700 hover:text-black'
          )}
        >
          <ListBulletIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Email product modal */}
      <ModalBackdrop
        open={modal === 'email'}
        onClose={closeModals}
        labelledBy={emailTitleId}
        panelClassName="sm:max-w-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-5 sm:py-4">
          <h2 id={emailTitleId} className="text-[14px] font-bold uppercase tracking-[0.08em] text-black">
            Email product
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeModals}
            className="rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <p className="text-[13px] leading-snug text-neutral-600">{productLine}</p>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor={`${emailTitleId}-recip`} className={labelClass}>
                Recipient email <span className="text-red-600">*</span>
              </label>
              <input
                id={`${emailTitleId}-recip`}
                type="text"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className={fieldClass}
                placeholder="name@company.com"
                autoComplete="off"
              />
              <p className="mt-1 text-[11px] leading-snug text-neutral-500">
                Use commas or semicolons (no spaces) to separate multiple addresses.
              </p>
            </div>
            <div>
              <label htmlFor={`${emailTitleId}-you`} className={labelClass}>
                Your email <span className="text-red-600">*</span>
              </label>
              <input
                id={`${emailTitleId}-you`}
                type="email"
                value={yourEmail}
                onChange={(e) => setYourEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor={`${emailTitleId}-yn`} className={labelClass}>
                Your name
              </label>
              <input
                id={`${emailTitleId}-yn`}
                type="text"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className={fieldClass}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor={`${emailTitleId}-sub`} className={labelClass}>
                Subject <span className="text-red-600">*</span>
              </label>
              <input
                id={`${emailTitleId}-sub`}
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`${emailTitleId}-msg`} className={labelClass}>
                Message
              </label>
              <textarea
                id={`${emailTitleId}-msg`}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={5}
                className={clsx(fieldClass, 'resize-y')}
                placeholder="Add a note for the recipient…"
              />
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-[12px] text-neutral-700">
              <input
                type="checkbox"
                checked={emailSendCopy}
                onChange={(e) => setEmailSendCopy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black accent-black"
              />
              Send a copy of this email to this address
            </label>

            {emailPreview ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Preview</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-neutral-800">
                  {emailPreviewText}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-neutral-100 px-4 py-4 sm:flex-row sm:justify-center sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={() => setEmailPreview((v) => !v)}
            className="rounded-md border-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition sm:min-w-[140px]"
            style={{ borderColor: BRAND_MARK_GREEN, color: BRAND_MARK_GREEN }}
          >
            {emailPreview ? 'Hide preview' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={sendEmailProduct}
            disabled={!parseRecipientList(recipientEmail) || !yourEmail.trim()}
            className="rounded-md px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
            style={{ backgroundColor: BRAND_MARK_GREEN }}
          >
            Send email
          </button>
        </div>
      </ModalBackdrop>

      {/* Request more info modal */}
      <ModalBackdrop
        open={modal === 'info'}
        onClose={closeModals}
        labelledBy={infoTitleId}
        panelClassName="sm:max-w-3xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-5 sm:py-4">
          <h2 id={infoTitleId} className="text-[14px] font-bold uppercase tracking-[0.08em] text-black">
            Request more info
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeModals}
            className="rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={sendInfoRequest} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <p className="text-[13px] font-medium leading-snug text-neutral-800">{productLine}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${infoTitleId}-qty`} className={labelClass}>
                  Quantity needed
                </label>
                <input
                  id={`${infoTitleId}-qty`}
                  value={qtyNeeded}
                  onChange={(e) => setQtyNeeded(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor={`${infoTitleId}-date`} className={labelClass}>
                  Date needed
                </label>
                <input
                  id={`${infoTitleId}-date`}
                  type="text"
                  value={dateNeeded}
                  onChange={(e) => setDateNeeded(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={`${infoTitleId}-com`} className={labelClass}>
                Comments
              </label>
              <textarea
                id={`${infoTitleId}-com`}
                value={infoComments}
                onChange={(e) => setInfoComments(e.target.value)}
                rows={4}
                className={clsx(fieldClass, 'resize-y')}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${infoTitleId}-fn`} className={labelClass}>
                  First name <span className="text-red-600">*</span>
                </label>
                <input
                  id={`${infoTitleId}-fn`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClass}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                <label htmlFor={`${infoTitleId}-ln`} className={labelClass}>
                  Last name <span className="text-red-600">*</span>
                </label>
                <input
                  id={`${infoTitleId}-ln`}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClass}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={`${infoTitleId}-em`} className={labelClass}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id={`${infoTitleId}-em`}
                type="email"
                value={infoEmail}
                onChange={(e) => setInfoEmail(e.target.value)}
                className={fieldClass}
                autoComplete="email"
                required
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-12">
              <div className="col-span-2 sm:col-span-5">
                <label htmlFor={`${infoTitleId}-ph`} className={labelClass}>
                  Phone
                </label>
                <input
                  id={`${infoTitleId}-ph`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                  autoComplete="tel"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor={`${infoTitleId}-ext`} className={labelClass}>
                  Ext.
                </label>
                <input
                  id={`${infoTitleId}-ext`}
                  value={phoneExt}
                  onChange={(e) => setPhoneExt(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="col-span-1 sm:col-span-5">
                <label htmlFor={`${infoTitleId}-fax`} className={labelClass}>
                  Fax
                </label>
                <input
                  id={`${infoTitleId}-fax`}
                  type="tel"
                  value={fax}
                  onChange={(e) => setFax(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor={`${infoTitleId}-co`} className={labelClass}>
                Company name
              </label>
              <input
                id={`${infoTitleId}-co`}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={fieldClass}
                autoComplete="organization"
              />
            </div>
            <div className="mt-4">
              <label htmlFor={`${infoTitleId}-st`} className={labelClass}>
                Street address
              </label>
              <input
                id={`${infoTitleId}-st`}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={fieldClass}
                autoComplete="street-address"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-12">
              <div className="col-span-2 sm:col-span-5">
                <label htmlFor={`${infoTitleId}-city`} className={labelClass}>
                  City
                </label>
                <input
                  id={`${infoTitleId}-city`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={fieldClass}
                  autoComplete="address-level2"
                />
              </div>
              <div className="col-span-1 sm:col-span-3">
                <label htmlFor={`${infoTitleId}-state`} className={labelClass}>
                  State
                </label>
                <input
                  id={`${infoTitleId}-state`}
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className={fieldClass}
                  autoComplete="address-level1"
                />
              </div>
              <div className="col-span-1 sm:col-span-4">
                <label htmlFor={`${infoTitleId}-zip`} className={labelClass}>
                  Zip
                </label>
                <input
                  id={`${infoTitleId}-zip`}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className={fieldClass}
                  autoComplete="postal-code"
                />
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-2 text-[12px] text-neutral-700">
              <input
                type="checkbox"
                checked={infoSendCopy}
                onChange={(e) => setInfoSendCopy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black accent-black"
              />
              Send a copy of this email to me
            </label>

            <p className="mt-3 text-[11px] text-neutral-500">
              Opens your email app to send this request. Set{' '}
              <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_INQUIRY_EMAIL</code> for a default recipient when
              none is configured.
            </p>
          </div>
          <div className="flex shrink-0 justify-center border-t border-neutral-100 px-4 py-4 sm:px-5">
            <button
              type="submit"
              className="rounded-md px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-95"
              style={{ backgroundColor: BRAND_MARK_GREEN }}
            >
              Send request
            </button>
          </div>
        </form>
      </ModalBackdrop>
    </>
  );
}
