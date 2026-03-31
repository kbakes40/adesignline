import FooterClient from 'components/layout/footer-client';
import { getPage } from 'lib/bigcommerce';
import type { VercelPage } from 'lib/bigcommerce/types';

function fallbackPage(partial: { handle: string; title: string }): VercelPage {
  const now = new Date().toISOString();
  return {
    id: partial.handle,
    title: partial.title,
    handle: partial.handle,
    body: '<p>Content is temporarily unavailable.</p>',
    bodySummary: '',
    createdAt: now,
    updatedAt: now
  };
}

export default async function Footer() {
  const [about, howItWorks, contact] = await Promise.all([
    getPage('about'),
    getPage('how-it-works'),
    getPage('contact')
  ]);

  return (
    <FooterClient
      about={about ?? fallbackPage({ handle: 'about', title: 'About' })}
      howItWorks={howItWorks ?? fallbackPage({ handle: 'how-it-works', title: 'How it Works' })}
      contact={contact ?? fallbackPage({ handle: 'contact', title: 'Contact' })}
    />
  );
}
