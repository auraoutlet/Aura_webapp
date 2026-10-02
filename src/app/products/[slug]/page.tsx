import { notFound } from 'next/navigation';
import { Container } from '@/components/ui';
import { ProductGrid } from '@/components/product';
import { getProductBySlug, getProducts } from '@/lib/services/products';
import { ProductDetailClient } from './product-detail-client';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | AURA OUTLET' };
  return { 
    title: `${product.name} | AURA OUTLET`, 
    description: product.description || `Buy ${product.name} at AURA OUTLET.`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  // Find related products dynamically
  const categoryProducts = await getProducts({ categoryId: product.category_id });
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Breadcrumb */}
        <div className="text-sm text-gray mb-8">
          <span>Home</span> <span className="mx-2">/</span> 
          <span>Shop</span> <span className="mx-2">/</span> 
          {product.category && (
            <>
              <span>{product.category.name}</span> <span className="mx-2">/</span> 
            </>
          )}
          <span className="text-black">{product.name}</span>
        </div>

        <div className="mb-24">
          <ProductDetailClient product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-8 text-center">You May Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
}
