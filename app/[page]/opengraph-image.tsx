import OpengraphImage from 'components/opengraph-image';
import { getPage } from 'lib/bigcommerce';

export const runtime = 'edge';

export default async function Image({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageSlug } = await params;
  const page = await getPage(pageSlug);
  const title = page?.seo?.title || page?.title;

  return await OpengraphImage({ title });
}
