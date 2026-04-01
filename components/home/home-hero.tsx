'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type HeroSlide = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  aria: string;
  video?: boolean;
};

const slides: HeroSlide[] = [
  {
    id: 'homepage-premium-surreal',
    src: '/home/hero-premium-homepage-14.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce homepage — branded merchandise and apparel',
    href: '/search',
    aria: 'Shop custom branded products'
  },
  {
    id: 'gear-up-brand',
    src: '/home/hero-gear-up-your-brand.jpg',
    width: 5504,
    height: 3072,
    alt: 'Gear up your brand — custom backpacks, duffel bags, and gym gear',
    href: '/search',
    aria: 'Gear up your brand — shop now'
  },
  {
    id: 'homepage-premium-11',
    src: '/home/hero-premium-homepage-11.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce homepage — custom branded merchandise and apparel',
    href: '/search',
    aria: 'Shop custom branded products'
  },
  {
    id: 'showcase-b',
    src: '/home/hero-premium-homepage-9.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce homepage — branded merchandise and apparel',
    href: '/search',
    aria: 'Shop branded merchandise'
  },
  {
    id: 'homepage-premium-12',
    src: '/home/hero-premium-homepage-12.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce homepage — branded merchandise and apparel',
    href: '/search',
    aria: 'Shop branded merchandise'
  },
  {
    id: 'homepage-premium-13',
    src: '/home/hero-premium-homepage-13.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce hero — branded merchandise and promotional products',
    href: '/search',
    aria: 'Shop branded merchandise'
  }
];

const AUTO_ADVANCE_MS = 30_000;
const FADE_DURATION_MS = 800;

export default function HomeHero() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const fadeDuration = reduceMotion ? '0ms' : `${FADE_DURATION_MS}ms`;

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative w-full">
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <Link
              key={slide.id}
              href={slide.href}
              className={`${i === 0 ? 'relative' : 'absolute inset-0'} block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2`}
              aria-label={slide.aria}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity ${fadeDuration} ease-in-out`,
                zIndex: active ? 10 : 1
              }}
            >
              {slide.video ? (
                <video
                  className="block h-auto w-full max-w-none"
                  width={slide.width}
                  height={slide.height}
                  autoPlay={!reduceMotion}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-hidden
                >
                  <source src={slide.src} type="video/mp4" />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- Large /public hero assets: native <img> avoids optimizer edge cases on Vercel.
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  className="block h-auto w-full max-w-none bg-neutral-100"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                />
              )}
            </Link>
          );
        })}

        <div
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] md:bottom-8"
          role="tablist"
          aria-label="Hero slides"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition md:h-2 md:w-2 ${i === index ? 'bg-white' : 'bg-white/45 hover:bg-white/80'}`}
              aria-label={`${s.id} hero`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
