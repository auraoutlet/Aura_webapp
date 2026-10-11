import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { ProductGrid } from '@/components/product';
import { getCategories } from '@/lib/services/categories';
import { getProducts } from '@/lib/services/products';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: 'Category Not Found | AURA OUTLET' };
  return { 
    title: `${category.name} | AURA OUTLET`, 
    description: category.description || `Shop ${category.name} at AURA OUTLET.` 
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  
  if (!category) {
    notFound();
  }

  const categoryProducts = await getProducts({ categoryId: category.id });

  return (
    <div className="py-6 md:py-8 bg-white min-h-[70vh]">
      <Container>
        {/* Compact Breadcrumb */}
        <div className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray mb-4">
          <Link href="/" className="hover:text-black transition-colors">Home</Link> 
          <span className="mx-2 text-border font-normal">/</span> 
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link> 
          <span className="mx-2 text-border font-normal">/</span> 
          <span className="text-black">{category.name}</span>
        </div>

        {/* Compact Category Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-3 border-b border-border gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-gray uppercase block mb-1">
              Category Collection
            </span>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs md:text-sm text-gray max-w-xl mt-1 leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <span className="text-[11px] font-bold text-gray uppercase tracking-widest shrink-0">
            {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'} Available
          </span>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <ProductGrid products={categoryProducts} />
        ) : (
          <div className="py-16 text-center border border-border bg-off-white/40">
            <h3 className="text-base font-bold uppercase tracking-wider mb-1 text-black">
              No products found
            </h3>
            <p className="text-xs text-gray mb-4">
              We haven&apos;t added items to this category yet. Check back soon for the next drop.
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-dark transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
