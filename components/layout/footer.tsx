import BrandWordmarkLink from 'components/brand-wordmark';
import Link from 'next/link';

function SocialLinks() {
  return (
    <div className="mt-5 flex items-center gap-4 text-neutral-700">
      <a href="mailto:angie@adesignline.com" className="transition hover:text-black" aria-label="Email">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </a>
      <a
        href="https://www.facebook.com/adesignline"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-black"
        aria-label="Facebook"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href="https://www.instagram.com/adesignline"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-black"
        aria-label="Instagram"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/company/a-design-line-embroidery-llc"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-black"
        aria-label="LinkedIn"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white text-[13px] text-neutral-600">
      <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-12 md:grid-cols-3 md:gap-12">
        <div>
          <BrandWordmarkLink variant="footer" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-800">
            Embroidery • Screen Printing • Promotional Products
          </p>
          <SocialLinks />
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-2.5">
            <li>
              <Link href="/pages/about" className="transition hover:text-black">
                About
              </Link>
            </li>
            <li>
              <Link href="/pages/how-it-works" className="transition hover:text-black">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/pages/contact" className="transition hover:text-black">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/pages/contact" className="transition hover:text-black">
                My Account
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Shop">
          <ul className="space-y-2.5">
            <li>
              <Link href="/search" className="transition hover:text-black">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/search/men" className="transition hover:text-black">
                Shop Men&apos;s Apparel
              </Link>
            </li>
            <li>
              <Link href="/search/women" className="transition hover:text-black">
                Shop Women&apos;s Apparel
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-neutral-200 py-5">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-2 px-6 text-[12px] text-neutral-500 md:flex-row">
          <p>
            &copy; {currentYear} A Design Line. All rights reserved.
          </p>
          <p className="md:ml-auto">Let us treat your brand like our own.</p>
        </div>
      </div>
    </footer>
  );
}
