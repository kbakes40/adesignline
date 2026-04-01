import BrandStrip from 'components/home/brand-strip';
import CategoryFourGrid from 'components/home/category-four-grid';
import CtaFourGrid from 'components/home/cta-four-grid';
import HomeHero from 'components/home/home-hero';
import HomeRecommendedProducts from 'components/home/home-recommended-products';
import HomeThreeCards from 'components/home/home-three-cards';
import TrustBar from 'components/home/trust-bar';
import Footer from 'components/layout/footer';
import { Suspense } from 'react';

export const metadata = {
  description:
    'Premium branded merchandise, gift ideas, promotional products, and custom order support from A Design Line.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage() {
  return (
    <>
      <HomeHero />
      <BrandStrip />
      <HomeRecommendedProducts />
      <HomeThreeCards />
      <CategoryFourGrid />
      <TrustBar />
      <CtaFourGrid />
      <Suspense>
        <Footer />
      </Suspense>
    </>
  );
}
