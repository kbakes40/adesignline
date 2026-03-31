import Image from 'next/image';

/** [Custom logo’d products art](https://drive.google.com/file/d/1gqYEmOccnuUZgAfxG5kU8tKUCtbNYoAb/view?usp=sharing) */
const CUSTOM_LOGO_PRODUCTS_IMAGE = '/home/trust-custom-logo-products.jpg';
/** [Easy online ordering art](https://drive.google.com/file/d/1Mh9MiqyYhSbI6oIeiXb0SA-FyiHh9F3m/view?usp=sharing) */
const EASY_ONLINE_ORDERING_IMAGE = '/home/trust-easy-online-ordering.jpg';
/** [Satisfaction guarantee art](https://drive.google.com/file/d/1Qqg2loT114F3KxAog7e1E9E0afgXKjlC/view?usp=sharing) */
const SATISFACTION_GUARANTEE_IMAGE = '/home/trust-satisfaction-guarantee.jpg';
/** [Competitive pricing art](https://drive.google.com/file/d/1hur092Dk9xxpWatx0vUnIBSC_wWJTZm7/view?usp=sharing) */
const COMPETITIVE_PRICING_IMAGE = '/home/trust-competitive-pricing.jpg';

const items = [
  { key: 'logo', src: CUSTOM_LOGO_PRODUCTS_IMAGE, label: 'CUSTOM LOGO’D PRODUCTS' },
  { key: 'ordering', src: EASY_ONLINE_ORDERING_IMAGE, label: 'EASY ONLINE ORDERING' },
  { key: 'guarantee', src: SATISFACTION_GUARANTEE_IMAGE, label: 'SATISFACTION GUARANTEE' },
  { key: 'pricing', src: COMPETITIVE_PRICING_IMAGE, label: 'COMPETITIVE PRICING' }
] as const;

const imageCircleClass =
  'relative flex h-[9.75rem] w-[9.75rem] shrink-0 overflow-hidden rounded-full bg-[#0d7c82]/14 sm:h-[10.5rem] sm:w-[10.5rem] md:h-[11.25rem] md:w-[11.25rem] lg:h-[12rem] lg:w-[12rem]';

export default function TrustBar() {
  return (
    <section className="border-b border-t border-neutral-200 bg-white py-10 md:py-14 lg:py-16">
      {/* Narrower max width on large screens so the four units read as one band, not four distant columns. */}
      <div className="mx-auto max-w-[min(100%,72rem)] px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-9 md:grid-cols-4 md:gap-x-5 md:gap-y-0 lg:gap-x-7 xl:gap-x-8">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex w-full max-w-[11.5rem] flex-col items-center gap-2 text-center sm:max-w-[12rem] sm:gap-2 md:max-w-[13rem] md:gap-2"
            >
              <div className={imageCircleClass}>
                <Image
                  src={item.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 9.75rem, (max-width: 768px) 10.5rem, (max-width: 1024px) 11.25rem, 12rem"
                  unoptimized
                />
              </div>
              <span className="w-full text-[10px] font-semibold uppercase leading-[1.3] tracking-[0.12em] text-[#1a1a1a] sm:text-[11px] lg:text-[11px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
