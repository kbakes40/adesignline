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
        <div className="flex w-full flex-nowrap items-center justify-center gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 xl:gap-x-10">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex min-h-0 min-w-0 flex-1 basis-0 items-center justify-center py-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG brand marks; next/image often fails implicit SVG fills */}
              <img
                src={brand.src}
                alt={brand.name}
                className="h-9 w-full max-h-[3.25rem] object-contain object-center opacity-[0.38] grayscale sm:h-10 md:h-11 lg:h-12 xl:h-[3.25rem]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
