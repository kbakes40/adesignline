'use client';

import { AddToCartSuccessBridge } from 'components/cart/add-to-cart-success-bridge';
import { PremiumAddToCartButton } from 'components/cart/premium-add-to-cart-button';
import { useFormStatus } from 'react-dom';

/** Must be rendered inside the quick-view `<form>` so hooks see the correct form context */
export function QuickViewAddFormActions({
  message,
  onSuccess,
  availableForSale,
  selectedVariantId,
  blocked,
  success
}: {
  message: string | null;
  onSuccess: () => void | Promise<void>;
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  blocked?: boolean;
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
        blocked={blocked}
        success={success}
        size="compact"
      />
    </>
  );
}
