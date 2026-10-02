import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, SectionHeading } from '@/components/ui';
import { getCategories } from '@/lib/services/categories';
import { getProducts } from '@/lib/services/products';

export const metadata = {
  title: 'Collections | AURA OUTLET',
  description: 'Explore curated fashion capsules, seasonal streetwear drops, and monochrome essentials.',
};

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);

  return (
    <div className="py-12 md:py-20 animate-fade-in">
      <Container>
        {/* Breadcrumb */}
        <div className="text-sm text-gray mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-black">Collections</span>
        </div>

        <div className="max-w-3xl mb-12">
          <SectionHeading title="CURATED COLLECTIONS" align="left" />
          <p className="text-gray text-base md:text-lg -mt-4 leading-relaxed">
            Engineered silhouettes, heavyweight luxury cottons, and high-contrast monochrome palettes. 
            Discover each curated drop designed for enduring street aesthetics.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {categories.map((collection, index) => {
            const count = products.filter(p => p.category_id === collection.id).length;
            return (
              <div 
                key={collection.id} 
                className="group border border-border bg-white overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-off-white">
                  {collection.image_url ? (
                    <img 
                      src={collection.image_url} 
                      alt={collection.name} 
                      className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black text-white font-bold text-xl uppercase tracking-widest">
                      {collection.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Capsule 0{index + 1}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black group-hover:underline">
                        {collection.name}
                      </h2>
                      <span className="text-xs uppercase font-medium text-gray tracking-wider">
                        {count} {count === 1 ? 'Piece' : 'Pieces'}
                      </span>
                    </div>
                    <p className="text-gray text-sm md:text-base mb-6 leading-relaxed">
                      {collection.description || 'Premium curated collection crafted for modern streetwear aesthetics.'}
                    </p>
                  </div>

                  <Link 
                    href={`/category/${collection.slug}`}
                    className="inline-flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest text-black group-hover:text-black transition-colors"
                  >
                    <span>EXPLORE DROP</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
