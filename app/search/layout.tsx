import Footer from 'components/layout/footer';
import { Suspense } from 'react';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <div className="mx-auto max-w-screen-2xl px-4 pb-4 text-black dark:text-white">{children}</div>
      <Footer />
    </Suspense>
  );
}
