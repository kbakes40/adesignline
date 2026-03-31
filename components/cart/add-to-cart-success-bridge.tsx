'use client';

import { useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * Must render as a direct child of `<form>`. Calls `onSuccess` when a server action
 * submission completes with `message === null` (success path for cart actions).
 */
export function AddToCartSuccessBridge({
  message,
  onSuccess
}: {
  message: string | null;
  onSuccess: () => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !pending && message === null) {
      void Promise.resolve(onSuccess());
    }
    prevPending.current = pending;
  }, [pending, message, onSuccess]);

  return null;
}
