import BrandSidebar from 'components/collection/brand-sidebar';
import { products } from 'lib/adesignline-data';
import { buildBrandSidebarRows } from 'lib/brand-explorer';

export default function CollectionBrandSidebar({
  collection,
  currentQuery,
  sort
}: {
  collection: string;
  currentQuery?: string;
  sort?: string;
}) {
  const rows = buildBrandSidebarRows(products, collection, currentQuery, sort);
  return <BrandSidebar rows={rows} />;
}
