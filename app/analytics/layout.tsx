import type { ReactNode } from 'react';

export const metadata = {
  title: 'Inventory Intelligence — A Design Line',
  description: 'Inventory visibility, catalog health, and fulfillment intelligence for A Design Line.',
  robots: { index: false, follow: false }
};

/**
 * Inventory Intelligence shell: fixed overlay over the storefront Navbar.
 * Layered gradients + soft glows for depth (styling only).
 */
export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-y-auto font-sans text-[#e8f2ee] antialiased">
      {/* Base gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            'linear-gradient(165deg, #020807 0%, #061a14 18%, #0b241c 42%, #071812 68%, #030a08 100%)'
        }}
      />
      {/* Radial glow — upper center */}
      <div
        className="pointer-events-none fixed -top-32 left-1/2 -z-10 h-[min(70vh,520px)] w-[min(100vw,900px)] -translate-x-1/2 opacity-90"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(45,212,191,0.14) 0%, transparent 72%)'
        }}
      />
      {/* Side depth — teal wash */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 -z-10 w-1/3 max-w-md opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 0% 50%, rgba(15,118,110,0.12) 0%, transparent 70%)'
        }}
      />
      {/* Bottom vignette */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)'
        }}
      />
      {children}
    </div>
  );
}
