import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, SectionHeading } from '@/components/ui';
import { mockCategories, mockProducts } from '@/lib/mock-data';

export const metadata = {
  title: 'Collections | AURA OUTLET',
  description: 'Explore curated fashion capsules, seasonal streetwear drops, and monochrome essentials.',
};

export default function CollectionsPage() {
  const collections = [
    {
      title: 'Oversized Streetwear',
      tagline: 'Drop-shoulder heavyweights designed for effortless silhouette',
      slug: 'oversized',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
      itemCount: mockProducts.filter(p => p.category_id === 'cat-2').length,
      categorySlug: 'oversized',
    },
    {
      title: 'Monochrome Essentials',
      tagline: 'Crisp minimal white and jet-black foundational pieces',
      slug: 't-shirts',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
      itemCount: mockProducts.filter(p => p.category_id === 'cat-1').length,
      categorySlug: 't-shirts',
    },
    {
      title: 'Graphic Statement Prints',
      tagline: 'Intricate streetwear graphics and bold editorial typography',
      slug: 'graphic-tees',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
      itemCount: mockProducts.filter(p => p.category_id === 'cat-3').length,
      categorySlug: 'graphic-tees',
    },

    {
      title: 'Classic Polo Series',
      tagline: 'Pique cotton modern streetwear-tailored polos',
      slug: 'polo-shirts',
      image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1200&q=80',
      itemCount: mockProducts.filter(p => p.category_id === 'cat-4').length,
      categorySlug: 'polo-shirts',
    },
  ];

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
            Curated capsules engineered for the modern streetwear wardrobe. Discover our high-density fabrics, distinct silhouettes, and signature monochrome palettes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-stagger">
          {collections.map((col, index) => (
            <Link
              key={col.title}
              href={`/category/${col.categorySlug}`}
              className="group relative flex flex-col justify-end aspect-[16/10] overflow-hidden bg-black p-8 card-hover"
            >
              {/* Background Photography with Zoom */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-60"
                style={{ backgroundImage: `url(${col.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10">
                <span className="text-xs font-semibold tracking-widest uppercase text-white/70">
                  {col.itemCount} Styles
                </span>
                <h2 className="mt-2 text-2xl md:text-3xl font-bold uppercase tracking-wide text-white group-hover:underline">
                  {col.title}
                </h2>
                <p className="mt-2 text-sm text-white/80 max-w-md line-clamp-2">
                  {col.tagline}
                </p>
                <div className="mt-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform">
                  Explore Capsule <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
