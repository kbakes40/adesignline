import type { Metadata } from 'next';

import Prose from 'components/prose';
import { getPage } from 'lib/bigcommerce';
import { notFound } from 'next/navigation';

export const runtime = 'edge';
export const revalidate = 43200;

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page: pageSlug } = await params;
  const page = await getPage(pageSlug);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: 'article'
    }
  };
}

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageSlug } = await params;
  const page = await getPage(pageSlug);

  if (!page) return notFound();

  return (
    <section className="mx-auto max-w-screen-lg px-4 py-12">
      <div className="border-b border-neutral-200 pb-8">
        <p className="text-[12px] text-neutral-500">Page</p>
        <h1 className="mt-2 text-[2.5rem] font-medium tracking-[-0.04em] text-black sm:text-[2.75rem] md:text-[3rem]">
          {page.title}
        </h1>
      </div>
      <div className="pt-8">
        <Prose className="max-w-none text-[14px] leading-7 text-neutral-700" html={page.body as string} />
      </div>
      <p className="mt-8 text-[12px] text-neutral-500">
        {`Updated ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(page.updatedAt))}.`}
      </p>
    </section>
  );
}
