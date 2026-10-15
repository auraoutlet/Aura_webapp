import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { Container, Button } from '@/components/ui';
import { AdvertisementWidgetSettings } from '@/lib/services/settings';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product';

interface AdSpotlightWidgetProps {
  settings: AdvertisementWidgetSettings;
  products: Product[];
}

export function AdSpotlightWidget({ settings, products }: AdSpotlightWidgetProps) {
  // If disabled, don't render
  if (!settings.isEnabled) {
    return null;
  }

  // Only display products explicitly selected by the admin in Admin Settings!
  // If the admin has not selected any products, do not show random fallback cards.
  if (!settings.productIds || settings.productIds.length === 0) {
    return null;
  }

  const displayProducts = products.filter(
    (p) => settings.productIds.includes(p.id) || settings.productIds.includes(p.slug)
  );

  // If none of the selected IDs exist in active catalog, do not render
  if (displayProducts.length === 0) {
    return null;
  }

  // Responsive grid based on the exact number of selected cards
  const count = displayProducts.length;
  const gridClass =
    count === 1
      ? "grid grid-cols-1 max-w-xs mx-auto"
      : count === 2
      ? "grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto gap-4"
      : count === 3
      ? "grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto gap-4"
      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4";

  return (
    <section className="bg-white py-10 md:py-16 border-b border-border overflow-hidden">
      <Container>
        {/* Header Banner Block */}
        <div className="bg-black text-white p-6 sm:p-8 rounded-xl mb-8 relative overflow-hidden shadow-lg border border-white/10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 relative z-10">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white rounded">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {settings.badge || 'HIGHLIGHTS'}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                  {settings.tag || 'Curated Picks'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                {settings.title || 'Top Highlights'}
              </h2>
              {settings.subtitle && (
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  {settings.subtitle}
                </p>
              )}
            </div>

            {settings.buttonText && (
              <Link href={settings.buttonLink || '/shop'} className="shrink-0">
                <Button
                  variant="secondary"
                  className="h-11 px-6 text-xs sm:text-sm font-black uppercase tracking-wider rounded-md"
                >
                  {settings.buttonText}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Selected Highlight Products Grid */}
        <div className={gridClass}>
          {displayProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
