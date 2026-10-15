import Link from 'next/link';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';
import { Container, Button, Badge } from '@/components/ui';
import { AdvertisementWidgetSettings } from '@/lib/services/settings';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product';

interface AdSpotlightWidgetProps {
  settings: AdvertisementWidgetSettings;
  products: Product[];
}

export function AdSpotlightWidget({ settings, products }: AdSpotlightWidgetProps) {
  if (!settings.isEnabled || products.length === 0) {
    return null;
  }

  // Filter products if specific IDs are configured, otherwise show the top products
  let displayProducts = products;
  if (settings.productIds && settings.productIds.length > 0) {
    const filtered = products.filter(
      (p) => settings.productIds.includes(p.id) || settings.productIds.includes(p.slug)
    );
    if (filtered.length > 0) {
      displayProducts = filtered;
    }
  }

  // Show up to 4 items in the spotlight grid
  displayProducts = displayProducts.slice(0, 4);

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
                  {settings.badge || 'HOT PICKS'}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                  {settings.tag || 'Special Spotlight'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                {settings.title || 'Top Heavyweights & Signature Picks'}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {settings.subtitle || 'Engineered 240+ GSM dense cotton tees styled for modern streetwear enthusiasts.'}
              </p>
            </div>

            <Link href={settings.buttonLink || '/shop'} className="shrink-0">
              <Button
                variant="secondary"
                className="h-11 px-6 text-xs sm:text-sm font-black uppercase tracking-wider rounded-md"
              >
                {settings.buttonText || 'View All Designs'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Spotlight Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 animate-stagger">
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
