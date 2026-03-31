'use client';

import { AddToCartSuccessBridge } from 'components/cart/add-to-cart-success-bridge';
import { PremiumAddToCartButton } from 'components/cart/premium-add-to-cart-button';
import { useFormStatus } from 'react-dom';

/**
 * Renders inside `<form>` so `useFormStatus()` has a valid form ancestor (required by react-dom).
 */
export function AddToCartFormInner({
  message,
  onSuccess,
  availableForSale,
  selectedVariantId,
  success
}: {
  message: string | null;
  onSuccess: () => void | Promise<void>;
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  success: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <AddToCartSuccessBridge message={message} onSuccess={onSuccess} />
      <PremiumAddToCartButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        pending={pending}
        success={success}
        size="roomy"
      />
    </>
  );
}
