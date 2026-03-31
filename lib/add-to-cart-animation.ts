/** Client-only add-to-cart feedback: fly layer, optional sound, haptic, events */

export const CART_ICON_TARGET_ID = 'cart-icon-target';
export const QUICK_VIEW_IMAGE_ORIGIN_ID = 'quick-view-image-origin';
export const PDP_IMAGE_ORIGIN_ID = 'pdp-image-origin';

export function getElementRect(id: string): DOMRect | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(id)?.getBoundingClientRect() ?? null;
}

function viewportCenterFallback(size = 72): DOMRect {
  const w = typeof window !== 'undefined' ? window.innerWidth : 400;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  const left = w / 2 - size / 2;
  const top = h / 2 - size / 2;
  return new DOMRect(left, top, size, size);
}

function dispatchCartAdded(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:added'));
}

export function hapticLight(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
    }
  } catch {
    /* ignore */
  }
}

/** Very short, low-level click — may fail silently if audio is blocked */
export function playSubtleAddSound(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);

    let closed = false;
    const safeClose = () => {
      if (closed) return;
      closed = true;
      try {
        void ctx.close();
      } catch {
        /* already closed or unsupported */
      }
    };

    osc.onended = () => safeClose();
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
    setTimeout(safeClose, 300);
  } catch {
    /* ignore */
  }
}

export type RunAddToCartFeedbackOptions = {
  imageUrl: string;
  originId: typeof QUICK_VIEW_IMAGE_ORIGIN_ID | typeof PDP_IMAGE_ORIGIN_ID;
  reducedMotion: boolean;
  playSound?: boolean;
};

/**
 * Runs fly-to-cart (if allowed), haptic, optional sound, and dispatches `cart:added` for badge/icon pulse.
 * Does not call router.refresh — caller should refresh first so the badge count is correct.
 */
export function runAddToCartFeedback(opts: RunAddToCartFeedbackOptions): void {
  try {
    const { imageUrl, originId, reducedMotion, playSound = true } = opts;

    if (!reducedMotion) {
      hapticLight();
      if (playSound) {
        playSubtleAddSound();
      }
    }

    if (reducedMotion) {
      dispatchCartAdded();
      return;
    }

    const toEl = document.getElementById(CART_ICON_TARGET_ID);
    const toRect = toEl?.getBoundingClientRect() ?? null;
    const fromRect = getElementRect(originId) ?? viewportCenterFallback(88);

    if (!toRect || !imageUrl) {
      dispatchCartAdded();
      return;
    }

    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.className =
      'pointer-events-none fixed z-[200] overflow-hidden rounded-md border border-white/80 bg-white shadow-lg';
    layer.style.left = `${fromRect.left}px`;
    layer.style.top = `${fromRect.top}px`;
    layer.style.width = `${fromRect.width}px`;
    layer.style.height = `${fromRect.height}px`;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.className = 'h-full w-full object-contain';
    img.decoding = 'async';
    layer.appendChild(img);
    document.body.appendChild(layer);

    const cx0 = fromRect.left + fromRect.width / 2;
    const cy0 = fromRect.top + fromRect.height / 2;
    const cx1 = toRect.left + toRect.width / 2;
    const cy1 = toRect.top + toRect.height / 2;
    const dx = cx1 - cx0;
    const dy = cy1 - cy0;
    const endScale = Math.min(40 / Math.max(fromRect.width, 1), 0.42);

    if (typeof layer.animate !== 'function') {
      layer.remove();
      dispatchCartAdded();
      return;
    }

    const anim = layer.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: `translate(${dx * 0.35}px, ${dy * 0.35}px) scale(0.88)`,
          opacity: 0.98,
          offset: 0.28
        },
        { transform: `translate(${dx}px, ${dy}px) scale(${endScale})`, opacity: 0.12 }
      ],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    );

    const finish = () => {
      try {
        layer.remove();
      } catch {
        /* ignore */
      }
      dispatchCartAdded();
    };

    anim.onfinish = finish;
    anim.oncancel = finish;
  } catch {
    dispatchCartAdded();
  }
}
