import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container, SectionHeading, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About Us | AURA OUTLET',
  description: 'Learn about AURA OUTLET, our brand philosophy, and our commitment to premium monochrome streetwear.',
};

export default function AboutPage() {
  return (
    <div className="pb-24 animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Prominent Official Brand Logo */}
            <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm">
              <img 
                src="/logo-white.png" 
                alt="AURA OUTLET" 
                className="h-16 md:h-20 w-auto object-contain" 
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60 mb-3">
              The Brand Story
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase mb-6">
              AURA OUTLET
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              Redefining contemporary streetwear through elevated oversized cuts, heavyweight fabrics, and an uncompromising monochrome aesthetic.
            </p>
          </div>
        </Container>
      </section>

      {/* Brand Philosophy */}
      <section className="py-20 md:py-28 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Brand Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] bg-black relative overflow-hidden group shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80" 
                  alt="AURA OUTLET Editorial Fit" 
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Brand Logo Stamp Overlay */}
                <div className="absolute bottom-8 left-8 right-8 flex flex-col items-start text-white">
                  <img 
                    src="/logo-white.png" 
                    alt="AURA OUTLET Emblem" 
                    className="h-10 w-auto mb-3 object-contain" 
                  />
                  <span className="text-xs uppercase tracking-[0.25em] text-white/70 font-semibold">
                    Signature Streetwear Line
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Story Copy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray">
                Origin & Craft
              </span>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-black">
                Born For The Bold. Crafted In Monochrome.
              </h2>
              
              <div className="space-y-4 text-gray leading-relaxed text-sm md:text-base">
                <p>
                  <strong className="text-black font-semibold">AURA OUTLET</strong> was created with a clear directive: eliminate unnecessary noise and deliver authentic, heavyweight streetwear designed to stand the test of time.
                </p>
                <p>
                  While conventional fashion cycles push ephemeral micro-trends, <strong className="text-black font-semibold">AURA OUTLET</strong> focuses strictly on proportion, silhouette, and tactile fabric weight. From 240+ GSM drop-shoulder tees to architectural cuts, every garment is built as a staple piece for your personal uniform.
                </p>
                <p>
                  Our signature black and white identity reflects our core philosophy: <em>&ldquo;Let the clothing provide the presence; let the design speak in monochrome.&rdquo;</em>
                </p>
              </div>

              <div className="pt-4 border-t border-border grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-black">240+ GSM</h4>
                  <p className="text-xs uppercase tracking-wider text-gray mt-1">Dense Combed Cotton</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-black">100%</h4>
                  <p className="text-xs uppercase tracking-wider text-gray mt-1">Monochrome Identity</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Brand Pillars */}
      <section className="py-20 bg-off-white border-y border-border">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionHeading title="THE AURA STANDARD" />
            <p className="text-gray text-sm md:text-base -mt-4">
              What sets every AURA OUTLET piece apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Heavyweight Fabrics',
                desc: 'We use high-density 200–260 GSM combed cotton that retains structure wash after wash without sagging or losing its shape.',
              },
              {
                title: 'Tailored Street Silhouette',
                desc: 'Engineered drop shoulders, boxy drapes, and ribbed crewnecks built specifically for contemporary relaxed fits.',
              },
              {
                title: 'Precision Graphics',
                desc: 'High-density screen prints and artwork cured for zero cracking, sharp detailing, and exceptional endurance.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="bg-white p-8 border border-border card-hover flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm mb-6">
                    AO
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-3 text-black">
                    {pillar.title}
                  </h3>
                  <p className="text-gray text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-black text-white text-center relative overflow-hidden">
        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto space-y-6">
            <img 
              src="/logo-white.png" 
              alt="AURA OUTLET" 
              className="h-14 md:h-16 w-auto mx-auto object-contain mb-4" 
            />
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
              Wear The Aura
            </h2>
            <p className="text-white/70 text-base md:text-lg max-w-lg mx-auto">
              Explore our current releases of oversized t-shirts, graphic prints, and monochrome essentials.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10">
                  EXPLORE SHOP <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/collections" className="w-full sm:w-auto">
                <Button variant="outline-white" size="lg" className="w-full sm:w-auto px-10 border-2">
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
