import type { ReactNode } from 'react';

export const metadata = {
  title: 'Traffic Intelligence — A Design Line',
  description: 'Website traffic and engagement overview powered by Google Analytics 4.',
  robots: { index: false, follow: false }
};

/**
 * GA4 Traffic Intelligence — full-viewport shell (does not alter storefront layouts).
 */
export default function BackendTrafficLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-y-auto font-sans text-[#fff7ed] antialiased">
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            'linear-gradient(165deg, #1c0a02 0%, #431407 22%, #7c2d12 48%, #431407 72%, #1c0a02 100%)'
        }}
      />
      <div
        className="pointer-events-none fixed -top-32 left-1/2 -z-10 h-[min(70vh,520px)] w-[min(100vw,900px)] -translate-x-1/2 opacity-90"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(251, 146, 60, 0.18) 0%, transparent 72%)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-1/3 max-w-md opacity-50"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 100% 50%, rgba(180, 83, 9, 0.14) 0%, transparent 70%)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)'
        }}
      />
      {children}
    </div>
  );
}
