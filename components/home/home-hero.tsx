'use client';

import Image from 'next/image';
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
  /** When set, `src` is an MP4 in /public (not optimized by Next Image). */
  video?: boolean;
};

/** Homepage hero banners: see public/home. */
const slides: HeroSlide[] = [
  /** [Gear up banner](https://drive.google.com/file/d/1sUehYWWF3JsjrKNHpucvqfVKw50EI4jz/view?usp=sharing) */
  {
    id: 'gear-up-brand',
    src: '/home/hero-gear-up-your-brand.jpg',
    width: 5504,
    height: 3072,
    alt: 'Gear up your brand — custom backpacks, duffel bags, and gym gear',
    href: '/search',
    aria: 'Gear up your brand — shop now'
  },
  /** [Premium homepage hero 11](https://drive.google.com/file/d/1Lw8Nrgo6A6rTwhgj_VdMmhnm98UxddMk/view?usp=sharing) */
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
  /** [Premium homepage hero 12](https://drive.google.com/file/d/18PA2Hra_r9ut7FhdEZeaECR19yh-yci6/view?usp=sharing) */
  {
    id: 'homepage-premium-12',
    src: '/home/hero-premium-homepage-12.jpg',
    width: 5504,
    height: 3072,
    alt: 'Premium ecommerce homepage — branded merchandise and apparel',
    href: '/search',
    aria: 'Shop branded merchandise'
  },
  /** [Wide desk ecommerce hero](https://drive.google.com/file/d/1Ag4bg5pvJ1eL0RlXQu6zViN_1_6WXaRn/view?usp=sharing) */
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

const AUTO_ADVANCE_MS = 7500;

export default function HomeHero() {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const slide = slides[index]!;

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

  const isVideo = Boolean(slide.video);
  const firstImageSlideIndex = slides.findIndex((s) => !s.video);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="relative w-full">
        <Link
          href={slide.href}
          className="relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
          aria-label={slide.aria}
        >
          {isVideo ? (
            <video
              key={slide.id}
              className="block h-auto w-full max-w-none"
              width={slide.width}
              height={slide.height}
              autoPlay={!reduceMotion}
              loop
              muted
              playsInline
              preload="metadata"
              poster="/home/hero-premium-ecommerce-banner-v2.jpg"
              aria-hidden
            >
              <source src={slide.src} type="video/mp4" />
            </video>
          ) : (
            <Image
              key={slide.id}
              src={slide.src}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              className="block h-auto w-full max-w-none"
              sizes="100vw"
              priority={!isVideo && index === firstImageSlideIndex}
              quality={100}
              unoptimized
            />
          )}
        </Link>

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
