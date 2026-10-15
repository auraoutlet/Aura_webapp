export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Container } from '@/components/ui';
import { getSetting, PolicyPagesSettings, DEFAULT_POLICY_PAGES } from '@/lib/services/settings';

// Inline Instagram icon since lucide-react does not bundle an Instagram export
function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default async function ContactPage() {
  const policy = await getSetting<PolicyPagesSettings>('policy_pages', DEFAULT_POLICY_PAGES);

  const contactCards = [
    {
      icon: Mail,
      title: 'Email Us',
      detail: policy.contactEmail || 'support@auraoutlet.com',
      subtext: 'Average response time: within 24 hours',
      actionLabel: 'Send Email',
      href: `mailto:${policy.contactEmail || 'support@auraoutlet.com'}`,
    },
    {
      icon: Phone,
      title: 'Phone & WhatsApp',
      detail: policy.contactPhone || '+91 83009 48486',
      subtext: 'Direct customer support line',
      actionLabel: 'Call / WhatsApp',
      href: `tel:${(policy.contactPhone || '+91 83009 48486').replace(/\s+/g, '')}`,
    },
    {
      icon: InstagramIcon,
      isCustomIcon: true,
      title: 'Instagram',
      detail: policy.contactInstagram || '@aura.outlet._',
      subtext: 'DM us for sizing, fit checks & drops',
      actionLabel: 'Open Profile',
      href: `https://www.instagram.com/${(policy.contactInstagram || '@aura.outlet._').replace('@', '')}/`,
      target: '_blank',
    },
    {
      icon: MapPin,
      title: 'Headquarters',
      detail: policy.contactAddress || 'Salem, Tamil Nadu, India',
      subtext: 'Fulfillment & Distribution Hub',
      actionLabel: 'India Delivery Network',
      href: null,
    },
    {
      icon: Clock,
      title: 'Support Hours',
      detail: policy.contactHours || 'Mon – Sat: 9:00 AM – 8:00 PM IST',
      subtext: 'Orders dispatch within 24-48 hours',
      actionLabel: null,
      href: null,
    },
  ];

  return (
    <div className="py-8 md:py-12 bg-white">
      <Container>
        {/* Compact Header */}
        <div className="max-w-2xl mb-8">
          <p className="text-[11px] font-bold tracking-[0.2em] text-gray uppercase mb-1">
            Support & Inquiries
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-black">
            Contact AURA OUTLET
          </h1>
          <p className="text-xs md:text-sm text-gray mt-1.5 leading-relaxed">
            Have questions about your order, sizing, or returns? Reach out to our team directly through any of our channels below.
          </p>
        </div>

        {/* Compact Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="border border-border p-5 bg-white flex flex-col justify-between hover:border-black transition-colors"
              >
                <div>
                  <div className="w-9 h-9 bg-black text-white flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-gray mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm md:text-base font-black text-black">
                    {card.detail}
                  </p>
                  <p className="text-xs text-gray mt-1">
                    {card.subtext}
                  </p>
                </div>

                {card.href && card.actionLabel && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <a
                      href={card.href}
                      target={card.target || undefined}
                      rel={card.target ? 'noopener noreferrer' : undefined}
                      className="text-xs font-bold uppercase tracking-wider text-black hover:underline inline-flex items-center gap-1"
                    >
                      {card.actionLabel} &rarr;
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick FAQ / Order Help Strip */}
        <div className="mt-8 border border-border bg-off-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-black">
              Need help tracking an active order?
            </h4>
            <p className="text-xs text-gray mt-0.5">
              Check real-time order updates, shipping status, or initiate returns in your account dashboard.
            </p>
          </div>
          <a
            href="/orders"
            className="text-xs font-bold uppercase tracking-wider bg-black text-white px-4 py-2 hover:bg-black/85 transition-colors shrink-0"
          >
            Track Order
          </a>
        </div>
      </Container>
    </div>
  );
}
