import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import { Container } from '@/components/ui';
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
    <div className="py-6 md:py-10 animate-fade-in">
      <Container>
        {/* Breadcrumb */}
        <div className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray mb-4">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-black">Collections</span>
        </div>

        <div className="max-w-2xl mb-6 pb-3 border-b border-border">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-black">Curated Collections</h1>
          <p className="text-gray text-xs sm:text-sm mt-1 leading-relaxed">
            Engineered silhouettes, heavyweight luxury cottons, and high-contrast monochrome palettes.
          </p>
        </div>

        {/* Collections Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {categories.map((collection, index) => {
              const count = products.filter(p => p.category_id === collection.id).length;
              return (
                <div 
                  key={collection.id} 
                  className="group border border-border bg-white overflow-hidden flex flex-col justify-between hover:border-black transition-colors"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-off-white">
                    {collection.image_url ? (
                      <img 
                        src={collection.image_url} 
                        alt={collection.name} 
                        className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black text-white font-black text-lg uppercase tracking-widest">
                        {collection.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-widest">
                      Capsule 0{index + 1}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <h2 className="text-base md:text-lg font-black tracking-tight text-black group-hover:underline uppercase">
                          {collection.name}
                        </h2>
                        <span className="text-[11px] uppercase font-bold text-gray tracking-wider">
                          {count} {count === 1 ? 'Piece' : 'Pieces'}
                        </span>
                      </div>
                      <p className="text-gray text-xs mb-4 leading-relaxed line-clamp-2">
                        {collection.description || 'Premium curated collection crafted for modern streetwear aesthetics.'}
                      </p>
                    </div>

                    <Link 
                      href={`/category/${collection.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-widest text-black group-hover:text-black transition-colors"
                    >
                      <span>Explore Drop</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-border p-12 text-center bg-off-white/30 my-6">
            <Layers className="w-10 h-10 mx-auto text-gray mb-3" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-1">No Collections Available</h3>
            <p className="text-xs text-gray mb-4">New seasonal drops are dropping soon.</p>
            <Link 
              href="/shop" 
              className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
