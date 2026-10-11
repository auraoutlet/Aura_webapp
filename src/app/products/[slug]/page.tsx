import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="py-4 md:py-6 bg-white min-h-[75vh]">
      <Container>
        {/* Compact Breadcrumb */}
        <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray mb-3">
          <Link href="/" className="hover:text-black transition-colors">Home</Link> 
          <span className="mx-1.5 text-border font-normal">/</span> 
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link> 
          <span className="mx-1.5 text-border font-normal">/</span> 
          {product.category && (
            <>
              <Link href={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
                {product.category.name}
              </Link>
              <span className="mx-1.5 text-border font-normal">/</span> 
            </>
          )}
          <span className="text-black truncate max-w-[240px] inline-block align-bottom">{product.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="mb-8 md:mb-12">
          <ProductDetailClient product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-6 border-t border-border">
            <div className="text-center mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray block mb-0.5">
                Complete The Fit
              </span>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black">
                You May Also Like
              </h2>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
}
