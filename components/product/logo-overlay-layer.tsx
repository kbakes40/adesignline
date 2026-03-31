'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type LogoOverlayLayerProps = {
  src: string;
  xPct: number;
  yPct: number;
  scale: number;
  rotationDeg: number;
  disabled?: boolean;
  onPositionChange: (_x: number, _y: number) => void;
};

/**
 * Draggable logo overlay on the product preview. Coordinates are center point in % of the frame.
 */
export function LogoOverlayLayer({
  src,
  xPct,
  yPct,
  scale,
  rotationDeg,
  disabled,
  onPositionChange
}: LogoOverlayLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPx: number;
    startPy: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPx: xPct,
        startPy: yPct
      };
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, xPct, yPct]
  );

  useEffect(() => {
    if (!dragging || !dragRef.current) return;

    const move = (e: PointerEvent) => {
      const el = containerRef.current;
      const d = dragRef.current;
      if (!el || !d) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dx = ((e.clientX - d.startX) / rect.width) * 100;
      const dy = ((e.clientY - d.startY) / rect.height) * 100;
      const nx = Math.min(100, Math.max(0, d.startPx + dx));
      const ny = Math.min(100, Math.max(0, d.startPy + dy));
      onPositionChange(nx, ny);
    };

    const up = () => {
      setDragging(false);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, onPositionChange]);

  const widthPct = Math.min(55, 22 + scale * 38);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <div
        role="presentation"
        className={`pointer-events-auto absolute touch-none select-none ${
          disabled ? 'cursor-default opacity-60' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: `${widthPct}%`,
          transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
          transformOrigin: 'center center'
        }}
        onPointerDown={onPointerDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- overlay preview blob/API URL */}
        <img
          src={src}
          alt=""
          className="h-auto w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
