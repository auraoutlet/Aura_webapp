import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About Us | AURA OUTLET',
  description: 'Learn about AURA OUTLET, our brand philosophy, and our commitment to premium monochrome streetwear.',
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section - Compact */}
      <section className="relative bg-black text-white py-12 md:py-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            {/* Brand Logo Stamp */}
            <div className="mb-4 p-2.5 bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm">
              <img 
                src="/logo-white.png" 
                alt="AURA OUTLET" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60 mb-2">
              The Brand Story
            </p>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase mb-3">
              Heavyweight Monochrome Streetwear
            </h1>
            <p className="text-xs md:text-sm text-white/80 max-w-xl leading-relaxed">
              Redefining contemporary Indian streetwear through elevated oversized cuts, 240+ GSM dense cotton, and an uncompromising monochrome aesthetic.
            </p>
          </div>
        </Container>
      </section>

      {/* Brand Philosophy - Compact Two-Column */}
      <section className="py-10 md:py-14 bg-white border-b border-border">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Brand Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] max-h-[420px] bg-black relative overflow-hidden group shadow-md mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80" 
                  alt="AURA OUTLET Fit" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                
                {/* Brand Stamp Overlay */}
                <div className="absolute bottom-5 left-5 right-5 flex flex-col items-start text-white">
                  <img 
                    src="/logo-white.png" 
                    alt="AURA OUTLET Emblem" 
                    className="h-7 w-auto mb-1.5 object-contain" 
                  />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/70 font-semibold">
                    Signature Oversized Line
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Story Copy */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray block">
                Origin & Craft
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                Born For The Bold. Engineered In Monochrome.
              </h2>
              
              <div className="space-y-3 text-gray leading-relaxed text-xs md:text-sm">
                <p>
                  <strong className="text-black font-semibold">AURA OUTLET</strong> was born with a single directive: eliminate fast-fashion clutter and engineer authentic, dense streetwear crafted to outlast transient trends.
                </p>
                <p>
                  While conventional brands dilute silhouettes with micro-trends, <strong className="text-black font-semibold">AURA OUTLET</strong> concentrates exclusively on drop-shoulder geometry, collar firmness, and tactile fabric density. Every cut is calibrated to deliver an effortless silhouette.
                </p>
                <p>
                  Our signature black and white palette represents pure discipline: <em>&ldquo;Let presence speak through proportions; let design speak through monochrome.&rdquo;</em>
                </p>
              </div>

              {/* Quick Spec Metrics */}
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xl font-black text-black">240+ GSM</h4>
                  <p className="text-[11px] uppercase tracking-wider text-gray mt-0.5">Heavy Combed Cotton</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-black">100%</h4>
                  <p className="text-[11px] uppercase tracking-wider text-gray mt-0.5">Monochrome Palette</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Brand Pillars - Compact Cards */}
      <section className="py-10 md:py-12 bg-off-white border-b border-border">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray mb-1">
              Engineered Quality
            </p>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black">
              The AURA Standard
            </h2>
            <p className="text-xs text-gray mt-1">
              What distinguishes every piece in our drops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Heavyweight Fabrics',
                desc: '240+ GSM high-density combed cotton that maintains structural drape wash after wash without sagging or warping.',
              },
              {
                title: 'Structured Silhouette',
                desc: 'Engineered drop shoulders, boxy chest measurements, and tightly ribbed crewnecks built for a modern relaxed fit.',
              },
              {
                title: 'Screenprint Longevity',
                desc: 'High-density pigment prints and cured detailing engineered against cracking, fading, and distortion.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="bg-white p-5 border border-border flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs mb-3">
                    AO
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5 text-black">
                    {pillar.title}
                  </h3>
                  <p className="text-gray text-xs leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Compact Call to Action */}
      <section className="py-10 md:py-12 bg-black text-white text-center relative overflow-hidden">
        <Container className="relative z-10">
          <div className="max-w-xl mx-auto space-y-4">
            <img 
              src="/logo-white.png" 
              alt="AURA OUTLET" 
              className="h-9 md:h-10 w-auto mx-auto object-contain mb-2" 
            />
            <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
              Wear The Aura
            </h2>
            <p className="text-white/70 text-xs md:text-sm max-w-md mx-auto">
              Explore our active drops of oversized heavyweight t-shirts and monochrome essentials.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="w-full sm:w-auto px-6 h-10 text-xs font-bold uppercase tracking-wider">
                  EXPLORE SHOP <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/collections" className="w-full sm:w-auto">
                <Button variant="outline-white" size="sm" className="w-full sm:w-auto px-6 h-10 text-xs font-bold uppercase tracking-wider border">
                  VIEW CAPSULES
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
