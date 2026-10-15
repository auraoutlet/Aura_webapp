import Link from 'next/link';
import { ArrowRight, Truck, Shield, RotateCcw, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Container, Button } from '@/components/ui';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { 
  getSetting, 
  HeroBannerSettings, 
  DEFAULT_HERO_BANNER,
  PromoDropBannerSettings,
  DEFAULT_PROMO_BANNER,
  WhyAuraSettings,
  DEFAULT_WHY_AURA,
  CommunitySectionSettings,
  DEFAULT_COMMUNITY,
  HomePageSectionsSettings,
  DEFAULT_HOMEPAGE_SECTIONS,
  AdvertisementWidgetSettings,
  DEFAULT_ADVERTISEMENT_WIDGET
} from '@/lib/services/settings';
import { ProductCard } from '@/components/product';
import { AdSpotlightWidget } from '@/components/home/ad-spotlight-widget';

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const FEATURE_ICONS = [Star, Truck, RotateCcw, Shield];

export default async function HomePage() {
  const [
    featuredProducts, 
    allCatalogProducts,
    categories, 
    heroBanner,
    promoBanner,
    whyAura,
    community,
    pageSections,
    adWidget
  ] = await Promise.all([
    getProducts({ isFeatured: true, limit: 4 }),
    getProducts({ limit: 16 }),
    getCategories(),
    getSetting<HeroBannerSettings>('hero_banner', DEFAULT_HERO_BANNER),
    getSetting<PromoDropBannerSettings>('promo_banner', DEFAULT_PROMO_BANNER),
    getSetting<WhyAuraSettings>('why_aura', DEFAULT_WHY_AURA),
    getSetting<CommunitySectionSettings>('community_reviews', DEFAULT_COMMUNITY),
    getSetting<HomePageSectionsSettings>('homepage_sections', DEFAULT_HOMEPAGE_SECTIONS),
    getSetting<AdvertisementWidgetSettings>('ad_widget', DEFAULT_ADVERTISEMENT_WIDGET),
  ]);

  return (
    <>
      {/* 1. HERO SECTION - High-Impact & Configurable */}
      <section className="relative bg-black text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${heroBanner.imageUrl || DEFAULT_HERO_BANNER.imageUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <Container className="relative py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white mb-3">
              {heroBanner.badge || 'New Drop 2026'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none text-white">
              {(heroBanner.title || 'Redefine\nYour Style').split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  {idx < (heroBanner.title || '').split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-3.5 text-xs sm:text-sm md:text-base text-white/80 max-w-lg mx-auto font-normal leading-relaxed">
              {heroBanner.subtitle || DEFAULT_HERO_BANNER.subtitle}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={heroBanner.primaryBtnLink || '/shop'}>
                <Button
                  variant="secondary"
                  className="min-w-[170px] h-10 text-xs md:text-sm font-black uppercase tracking-wider"
                >
                  {heroBanner.primaryBtnText || 'Shop Now'}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href={heroBanner.secondaryBtnLink || '/collections'}>
                <Button
                  variant="outline-white"
                  className="min-w-[170px] h-10 text-xs md:text-sm font-black uppercase tracking-wider border-2"
                >
                  {heroBanner.secondaryBtnText || 'View Collections'}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      {pageSections.showCategories && categories.length > 0 && (
        <section className="bg-white py-8 md:py-12 border-b border-border">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 pb-2.5 border-b border-border gap-2">
              <div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray">
                  {pageSections.categoriesTag || 'Explore Silhouettes'}
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-black mt-0.5">
                  {pageSections.categoriesTitle || 'Shop by Category'}
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold text-black uppercase tracking-wider hover:underline flex items-center gap-1">
                All Drops <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group relative flex aspect-[16/10] sm:aspect-[4/3] flex-col justify-end overflow-hidden bg-black p-5 transition-all duration-300 hover:scale-[1.01] border border-border"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
                    style={{ backgroundImage: `url(${category.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-white">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-0.5 text-xs text-white/75 line-clamp-1 max-w-xs font-medium">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover:translate-x-1 group-hover:bg-white group-hover:text-black">
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. FEATURED PRODUCTS */}
      {pageSections.showFeatured && featuredProducts.length > 0 && (
        <section className="bg-off-white py-8 md:py-12 border-b border-border">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 pb-2.5 border-b border-border gap-2">
              <div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray">
                  {pageSections.featuredTag || 'Handpicked Heavyweights'}
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-black mt-0.5">
                  {pageSections.featuredTitle || 'Featured Collection'}
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold text-black uppercase tracking-wider hover:underline flex items-center gap-1">
                View Catalog <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 animate-stagger">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 4. ADVERTISEMENT & PRODUCT SPOTLIGHT WIDGET (Admin Managed) */}
      <AdSpotlightWidget settings={adWidget} products={allCatalogProducts} />

      {/* 5. DYNAMIC PROMO DROP BANNER */}
      {promoBanner.isEnabled && (
        <section className="bg-black text-white py-8 md:py-12 border-b border-white/10 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url('${promoBanner.imageUrl || DEFAULT_PROMO_BANNER.imageUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/70" />

          <Container className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Headline & CTA */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  <Sparkles size={11} />
                  {promoBanner.badge || 'Limited Edition Drop'}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  {promoBanner.title || 'Drop 01 — Now Available'}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                  {promoBanner.subtitle || DEFAULT_PROMO_BANNER.subtitle}
                </p>
                <div className="pt-1.5">
                  <Link href={promoBanner.buttonLink || '/shop'}>
                    <Button
                      variant="secondary"
                      className="h-10 px-6 text-xs font-black uppercase tracking-widest"
                    >
                      {promoBanner.buttonText || 'Shop The Drop'}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Technical Specification Badges */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
                {(promoBanner.specs || DEFAULT_PROMO_BANNER.specs).map((spec, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/15 p-3 backdrop-blur-sm">
                    <p className="font-black text-xs md:text-sm text-white uppercase tracking-wider">{spec.title}</p>
                    <p className="text-[10px] md:text-[11px] text-white/60 mt-0.5">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 5. VALUE PROPOSITION ("Why AURA OUTLET") */}
      <section className="bg-white py-8 md:py-12 border-b border-border">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-gray">
              {whyAura.tag || 'Quality Meets Style'}
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-black mt-0.5">
              {whyAura.title || 'Why AURA OUTLET'}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(whyAura.features || DEFAULT_WHY_AURA.features).map((feature, idx) => {
              const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length];
              return (
                <div 
                  key={idx} 
                  className="p-3.5 sm:p-4 border border-border bg-off-white/30 flex flex-col items-center text-center justify-between"
                >
                  <div className="flex h-9 w-9 items-center justify-center bg-black text-white mb-2.5">
                    <Icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-[11px] text-gray leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 6. CUSTOMER REVIEWS & COMMUNITY FIT CHECK */}
      <section className="bg-off-white py-10 md:py-14">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-gray mb-1">
              <InstagramIcon className="w-3.5 h-3.5 text-black" />
              <span>{community.tag || '@aura.outlet._ • Fit Check'}</span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight text-black">
              {community.title || 'What Our Community Says'}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-gray">
              {community.subtitle || 'Real fits. Real verified reviews. Tag us in your fits #AuraOutlet and get featured.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(community.reviews || DEFAULT_COMMUNITY.reviews).map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white border border-border p-4.5 flex flex-col justify-between shadow-sm hover:border-black transition-colors"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-2.5">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-black text-black" />
                    ))}
                    <span className="ml-1 text-[10px] font-bold text-black">{Number(rev.rating || 5).toFixed(1)}</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-black/85 leading-relaxed italic mb-3 font-normal">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1 font-bold text-black uppercase tracking-wider text-[11px]">
                      <span>{rev.name}</span>
                      {rev.verified && <CheckCircle size={12} className="text-black" />}
                    </div>
                    <span className="text-[10px] text-gray uppercase tracking-widest">{rev.city}</span>
                  </div>
                  {rev.fit && (
                    <span className="text-[10px] font-semibold bg-off-white px-2 py-0.5 border border-border text-black">
                      {rev.fit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a 
              href={community.instagramUrl || 'https://www.instagram.com/aura.outlet._/'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:underline"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-black" />
              Follow {community.instagramHandle || '@aura.outlet._'} on Instagram
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
