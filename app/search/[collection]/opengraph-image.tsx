import OpengraphImage from 'components/opengraph-image';
import { collections } from 'lib/adesignline-data';

export const runtime = 'edge';

export default async function Image({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionSlug } = await params;
  const normalized = collectionSlug.replace(/^\//, '');
  const collection = collections.find((c) => c.handle.replace(/^\//, '') === normalized);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage({ title });
}
