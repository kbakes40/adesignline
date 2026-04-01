import OpengraphImage from 'components/opengraph-image';
import { pages } from 'lib/adesignline-data';

export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageSlug } = await params;
  const normalized = pageSlug.replace(/^\//, '');
  const page = pages.find((p) => p.handle.replace(/^\//, '') === normalized);
  const title = page?.seo?.title || page?.title;

  return await OpengraphImage({ title });
}
