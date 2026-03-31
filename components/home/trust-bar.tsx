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
  'relative flex h-[9rem] w-[9rem] shrink-0 overflow-hidden rounded-full bg-[#0d7c82]/14 md:h-[11rem] md:w-[11rem] lg:h-[13rem] lg:w-[13rem]';

export default function TrustBar() {
  return (
    <section className="border-b border-t border-neutral-200 bg-white py-14 md:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[min(100%,100rem)] grid-cols-2 gap-x-8 gap-y-14 px-5 sm:gap-x-10 sm:gap-y-16 sm:px-8 md:grid-cols-4 md:gap-x-12 md:gap-y-0 md:px-10 lg:gap-x-16 lg:px-14">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex flex-col items-center gap-7 text-center md:flex-row md:items-center md:gap-8 md:text-left lg:gap-9"
          >
            <div className={imageCircleClass}>
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 9rem, (max-width: 1024px) 11rem, 13rem"
                unoptimized
              />
            </div>
            <span className="max-w-[13rem] text-[15px] font-bold uppercase leading-snug tracking-wide text-[#1a1a1a] sm:max-w-[14rem] sm:text-base md:max-w-none md:text-[17px] lg:text-lg lg:leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
