import Grid from 'components/grid';
import { ProductCard } from 'components/product/product-card';
import { VercelProduct as Product } from 'lib/bigcommerce/types';

export default function ProductGridItems({
  products,
  onProductSelect
}: {
  products: Product[];
  // eslint-disable-next-line no-unused-vars -- callback signature
  onProductSelect?: (product: Product) => void;
}) {
  return (
    <>
      {products.map((product, index) => (
        <Grid.Item key={product.id} className="animate-fadeIn">
          <ProductCard
            product={product}
            onSelect={onProductSelect}
            imagePriority={index < 8}
            imageLoading={index < 8 ? 'eager' : 'lazy'}
          />
        </Grid.Item>
      ))}
    </>
  );
}
