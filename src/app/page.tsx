import Link from 'next/link';
import { ArrowRight, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { Container, SectionHeading, Button } from '@/components/ui';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { ProductCard } from '@/components/product';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getProducts({ isFeatured: true, limit: 4 }),
    getCategories()
  ]);

  const instagramFeed = [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
        
        <Container className="relative py-28 md:py-40 lg:py-52">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white mb-6">
              New Drop 2025
            </span>
            <h1 className="text-5xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-none">
              Redefine
              <br />
              Your Style
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
              Premium heavyweight streetwear engineered for those who dare to stand out. Bold. Modern. Minimal.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/shop">
                <Button
                  variant="secondary"
                  size="lg"
                  className="min-w-[220px] h-14 text-sm md:text-base font-extrabold uppercase tracking-wider"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/collections">
                <Button
                  variant="outline-white"
                  size="lg"
                  className="min-w-[220px] h-14 text-sm md:text-base font-extrabold uppercase tracking-wider border-2"
                >
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Categories */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <SectionHeading
            title="Shop by Category"
            subtitle="Explore our curated drops and distinct silhouettes"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden bg-black p-8 transition-all duration-300 hover:scale-[1.02] sm:aspect-[4/5] img-hover-zoom card-hover shadow-lg"
              >
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-75"
                  style={{ backgroundImage: `url(${category.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm md:text-base text-white/85 leading-snug">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-xs md:text-sm font-bold uppercase tracking-widest text-white group-hover:underline">
                    Explore Drop
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="bg-off-white py-20 md:py-28 border-y border-border">
        <Container>
          <SectionHeading
            title="Featured Collection"
            subtitle="Handpicked heavyweight styles for the bold"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 animate-stagger">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button variant="outline" size="lg" className="h-14 px-10 text-sm md:text-base font-bold uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Promotional Banner */}
      <section className="relative bg-black py-24 text-white md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/40" />
        
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/80 mb-4">
              Limited Edition Drop
            </span>
            <h2 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-6xl">
              Drop 01 — Now Available
            </h2>
            <p className="mt-6 text-base md:text-xl text-white/80 max-w-xl mx-auto leading-relaxed">
              Exclusive 240+ GSM dense cotton heavyweights. Limited quantities produced. Once sold out, never restocked.
            </p>
            <div className="mt-10">
              <Link href="/shop">
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 px-10 text-sm md:text-base font-extrabold uppercase tracking-wider"
                >
                  Shop The Drop
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Aura Outlet - High Impact Value Proposition */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <SectionHeading
            title="Why AURA OUTLET"
            subtitle="Quality meets style"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Star,
                title: 'Premium Quality',
                description: '240+ GSM combed heavyweight cotton for lasting comfort and structural drape',
              },
              {
                icon: Truck,
                title: 'Free Shipping',
                description: 'Free expedited delivery on all orders above ₹999 across India',
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns',
                description: '7-day hassle-free doorstep returns and quick size exchanges',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: '100% encrypted and verified payments powered by Cashfree Gateway',
              },
            ].map((feature) => (
              <div 
                key={feature.title} 
                className="text-center card-hover p-8 border border-border bg-off-white/30 hover:border-black hover:bg-white transition-all flex flex-col items-center justify-between"
              >
                <div className="flex h-16 w-16 items-center justify-center bg-black text-white rounded-none shadow-md mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Instagram Lookbook Section */}
      <section className="bg-off-white py-20 md:py-28 border-t border-border">
        <Container>
          <div className="text-center mb-12">
            <a 
              href="https://www.instagram.com/aura.outlet._/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray hover:text-black transition-colors mb-2"
            >
              @aura.outlet._
            </a>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black">
              Follow Us on Instagram
            </h2>
            <p className="mt-3 text-base md:text-lg text-gray">
              Tag us in your fits <strong className="text-black">#AuraOutlet</strong> and get featured
            </p>
          </div>
          {/* Instagram Lookbook grid with real photos */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 animate-stagger">
            {instagramFeed.map((imgUrl, i) => (
              <a 
                key={i} 
                href="https://www.instagram.com/aura.outlet._/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative aspect-square overflow-hidden bg-black block shadow-md"
              >
                <img 
                  src={imgUrl} 
                  alt={`Aura Lookbook ${i + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs md:text-sm font-extrabold uppercase tracking-widest">
                  View Fit
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
