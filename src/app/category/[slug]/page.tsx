import { notFound } from 'next/navigation';
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
    <div className="py-12 md:py-16">
      <Container>
        {/* Breadcrumb */}
        <div className="text-sm text-gray mb-8">
          <span>Home</span> <span className="mx-2">/</span> 
          <span>Shop</span> <span className="mx-2">/</span> 
          <span className="text-black">{category.name}</span>
        </div>

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-gray max-w-2xl">{category.description}</p>
          )}
        </div>

        {categoryProducts.length > 0 ? (
          <ProductGrid products={categoryProducts} />
        ) : (
          <div className="p-12 text-center text-gray-500 border border-border">
            No products found in this category yet.
          </div>
        )}
      </Container>
    </div>
  );
}
