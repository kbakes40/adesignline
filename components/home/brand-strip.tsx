const brands = [
  { name: 'The North Face', src: '/brand-icons/thenorthface.svg' },
  { name: 'Moleskine', src: '/brand-icons/moleskine.svg' },
  { name: 'Nike', src: '/brand-icons/nike.svg' },
  { name: 'Puma', src: '/brand-icons/puma.svg' },
  { name: 'Columbia', src: '/brand-icons/columbia.svg' },
  { name: 'Carhartt', src: '/brand-icons/carhartt.svg' },
  { name: 'Under Armour', src: '/brand-icons/underarmour.svg' },
  { name: 'Cutter & Buck', src: '/brand-icons/cutter-buck.svg' }
] as const;

/** Lighter visual weight so featured categories read as the hero merchandising block below. */
export default function BrandStrip() {
  return (
    <section className="border-b border-neutral-100 bg-white py-9 md:py-11 lg:py-12">
      <div className="mx-auto max-w-[min(100%,100rem)] px-5 sm:px-8 lg:px-12">
        {/* Single row: logos keep intrinsic width; scroll horizontally on narrow viewports instead of shrinking. */}
        <div className="-mx-5 flex flex-nowrap items-center justify-start gap-x-6 overflow-x-auto overflow-y-hidden px-5 pb-1 sm:-mx-8 sm:px-8 sm:gap-x-8 lg:justify-center lg:gap-x-10 xl:gap-x-12">
          {brands.map((brand) => (
            <div key={brand.name} className="flex shrink-0 items-center justify-center py-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG brand marks; next/image often fails implicit SVG fills */}
              <img
                src={brand.src}
                alt={brand.name}
                className="h-14 w-auto max-h-[4.5rem] object-contain object-center opacity-[0.38] grayscale sm:h-16 md:h-[4.75rem] lg:h-20 xl:h-24"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
