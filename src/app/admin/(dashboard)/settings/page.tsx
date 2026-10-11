'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { 
  CheckCircle2, 
  Truck, 
  Store, 
  Layout, 
  Upload, 
  Loader2, 
  Plus,
  Trash2,
  Sparkles,
  Shield,
  MessageSquare,
  Bell,
  Star
} from 'lucide-react';
import { 
  getSetting, 
  saveSetting, 
  HeroBannerSettings, 
  PromoDropBannerSettings,
  WhyAuraSettings,
  CommunitySectionSettings,
  AnnouncementBarSettings,
  HomePageSectionsSettings,
  DEFAULT_HERO_BANNER,
  DEFAULT_PROMO_BANNER,
  DEFAULT_WHY_AURA,
  DEFAULT_COMMUNITY,
  DEFAULT_ANNOUNCEMENT_BAR,
  DEFAULT_HOMEPAGE_SECTIONS,
  CustomerReview
} from '@/lib/services/settings';
import { uploadImageToStorage } from '@/lib/services/storage';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'promo' | 'sections' | 'why' | 'community' | 'store'>('hero');

  // 1. Announcement Bar
  const [announcementEnabled, setAnnouncementEnabled] = useState(DEFAULT_ANNOUNCEMENT_BAR.isEnabled);
  const [announcementText, setAnnouncementText] = useState(DEFAULT_ANNOUNCEMENT_BAR.text);

  // 2. Hero Banner
  const [heroBadge, setHeroBadge] = useState(DEFAULT_HERO_BANNER.badge);
  const [heroTitle, setHeroTitle] = useState(DEFAULT_HERO_BANNER.title);
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_HERO_BANNER.subtitle);
  const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO_BANNER.imageUrl);
  const [heroPrimaryText, setHeroPrimaryText] = useState(DEFAULT_HERO_BANNER.primaryBtnText || 'Shop Now');
  const [heroPrimaryLink, setHeroPrimaryLink] = useState(DEFAULT_HERO_BANNER.primaryBtnLink || '/shop');
  const [heroSecondaryText, setHeroSecondaryText] = useState(DEFAULT_HERO_BANNER.secondaryBtnText || 'View Collections');
  const [heroSecondaryLink, setHeroSecondaryLink] = useState(DEFAULT_HERO_BANNER.secondaryBtnLink || '/collections');
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // 3. Homepage Sections (Categories & Featured)
  const [showCategories, setShowCategories] = useState(DEFAULT_HOMEPAGE_SECTIONS.showCategories);
  const [categoriesTag, setCategoriesTag] = useState(DEFAULT_HOMEPAGE_SECTIONS.categoriesTag);
  const [categoriesTitle, setCategoriesTitle] = useState(DEFAULT_HOMEPAGE_SECTIONS.categoriesTitle);
  const [showFeatured, setShowFeatured] = useState(DEFAULT_HOMEPAGE_SECTIONS.showFeatured);
  const [featuredTag, setFeaturedTag] = useState(DEFAULT_HOMEPAGE_SECTIONS.featuredTag);
  const [featuredTitle, setFeaturedTitle] = useState(DEFAULT_HOMEPAGE_SECTIONS.featuredTitle);

  // 4. Promo Drop Banner (Drop 01)
  const [promoEnabled, setPromoEnabled] = useState(DEFAULT_PROMO_BANNER.isEnabled);
  const [promoBadge, setPromoBadge] = useState(DEFAULT_PROMO_BANNER.badge);
  const [promoTitle, setPromoTitle] = useState(DEFAULT_PROMO_BANNER.title);
  const [promoSubtitle, setPromoSubtitle] = useState(DEFAULT_PROMO_BANNER.subtitle);
  const [promoButtonText, setPromoButtonText] = useState(DEFAULT_PROMO_BANNER.buttonText);
  const [promoButtonLink, setPromoButtonLink] = useState(DEFAULT_PROMO_BANNER.buttonLink);
  const [promoImageUrl, setPromoImageUrl] = useState(DEFAULT_PROMO_BANNER.imageUrl);
  const [promoSpecs, setPromoSpecs] = useState(DEFAULT_PROMO_BANNER.specs);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const promoFileRef = useRef<HTMLInputElement>(null);

  // 5. Why AURA OUTLET
  const [whyTag, setWhyTag] = useState(DEFAULT_WHY_AURA.tag);
  const [whyTitle, setWhyTitle] = useState(DEFAULT_WHY_AURA.title);
  const [whyFeatures, setWhyFeatures] = useState(DEFAULT_WHY_AURA.features);

  // 6. Community Reviews
  const [communityTag, setCommunityTag] = useState(DEFAULT_COMMUNITY.tag);
  const [communityTitle, setCommunityTitle] = useState(DEFAULT_COMMUNITY.title);
  const [communitySubtitle, setCommunitySubtitle] = useState(DEFAULT_COMMUNITY.subtitle);
  const [instaHandle, setInstaHandle] = useState(DEFAULT_COMMUNITY.instagramHandle);
  const [instaUrl, setInstaUrl] = useState(DEFAULT_COMMUNITY.instagramUrl);
  const [reviews, setReviews] = useState<CustomerReview[]>(DEFAULT_COMMUNITY.reviews);

  // New review form
  const [newRevName, setNewRevName] = useState('');
  const [newRevCity, setNewRevCity] = useState('');
  const [newRevRating, setNewRevRating] = useState('5');
  const [newRevFit, setNewRevFit] = useState('True to oversized fit');
  const [newRevReview, setNewRevReview] = useState('');

  // 7. Store Profile
  const [storeName, setStoreName] = useState('AURA OUTLET');
  const [tagline, setTagline] = useState('Heavyweight Streetwear | Monochrome Quality');
  const [supportEmail, setSupportEmail] = useState('support@auraoutlet.com');
  const [supportPhone, setSupportPhone] = useState('+91 83009 48486');
  const [storeCity, setStoreCity] = useState('Salem, Tamil Nadu, India');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [shippingFee, setShippingFee] = useState('99');
  const [returnDays, setReturnDays] = useState('7');

  useEffect(() => {
    async function loadAllSettings() {
      setLoading(true);
      const [
        heroData,
        sectionsData,
        promoData,
        whyData,
        commData,
        annData,
        storeData,
      ] = await Promise.all([
        getSetting<HeroBannerSettings>('hero_banner', DEFAULT_HERO_BANNER),
        getSetting<HomePageSectionsSettings>('homepage_sections', DEFAULT_HOMEPAGE_SECTIONS),
        getSetting<PromoDropBannerSettings>('promo_banner', DEFAULT_PROMO_BANNER),
        getSetting<WhyAuraSettings>('why_aura', DEFAULT_WHY_AURA),
        getSetting<CommunitySectionSettings>('community_reviews', DEFAULT_COMMUNITY),
        getSetting<AnnouncementBarSettings>('announcement_bar', DEFAULT_ANNOUNCEMENT_BAR),
        getSetting<any>('store_info', null),
      ]);

      if (heroData) {
        setHeroBadge(heroData.badge || DEFAULT_HERO_BANNER.badge);
        setHeroTitle(heroData.title || DEFAULT_HERO_BANNER.title);
        setHeroSubtitle(heroData.subtitle || DEFAULT_HERO_BANNER.subtitle);
        setHeroImageUrl(heroData.imageUrl || DEFAULT_HERO_BANNER.imageUrl);
        setHeroPrimaryText(heroData.primaryBtnText || 'Shop Now');
        setHeroPrimaryLink(heroData.primaryBtnLink || '/shop');
        setHeroSecondaryText(heroData.secondaryBtnText || 'View Collections');
        setHeroSecondaryLink(heroData.secondaryBtnLink || '/collections');
      }

      if (sectionsData) {
        setShowCategories(sectionsData.showCategories ?? true);
        setCategoriesTag(sectionsData.categoriesTag || DEFAULT_HOMEPAGE_SECTIONS.categoriesTag);
        setCategoriesTitle(sectionsData.categoriesTitle || DEFAULT_HOMEPAGE_SECTIONS.categoriesTitle);
        setShowFeatured(sectionsData.showFeatured ?? true);
        setFeaturedTag(sectionsData.featuredTag || DEFAULT_HOMEPAGE_SECTIONS.featuredTag);
        setFeaturedTitle(sectionsData.featuredTitle || DEFAULT_HOMEPAGE_SECTIONS.featuredTitle);
      }

      if (promoData) {
        setPromoEnabled(promoData.isEnabled ?? true);
        setPromoBadge(promoData.badge || DEFAULT_PROMO_BANNER.badge);
        setPromoTitle(promoData.title || DEFAULT_PROMO_BANNER.title);
        setPromoSubtitle(promoData.subtitle || DEFAULT_PROMO_BANNER.subtitle);
        setPromoButtonText(promoData.buttonText || DEFAULT_PROMO_BANNER.buttonText);
        setPromoButtonLink(promoData.buttonLink || DEFAULT_PROMO_BANNER.buttonLink);
        setPromoImageUrl(promoData.imageUrl || DEFAULT_PROMO_BANNER.imageUrl);
        if (promoData.specs?.length) setPromoSpecs(promoData.specs);
      }

      if (whyData) {
        setWhyTag(whyData.tag || DEFAULT_WHY_AURA.tag);
        setWhyTitle(whyData.title || DEFAULT_WHY_AURA.title);
        if (whyData.features?.length) setWhyFeatures(whyData.features);
      }

      if (commData) {
        setCommunityTag(commData.tag || DEFAULT_COMMUNITY.tag);
        setCommunityTitle(commData.title || DEFAULT_COMMUNITY.title);
        setCommunitySubtitle(commData.subtitle || DEFAULT_COMMUNITY.subtitle);
        setInstaHandle(commData.instagramHandle || DEFAULT_COMMUNITY.instagramHandle);
        setInstaUrl(commData.instagramUrl || DEFAULT_COMMUNITY.instagramUrl);
        if (commData.reviews?.length) setReviews(commData.reviews);
      }

      if (annData) {
        setAnnouncementEnabled(annData.isEnabled ?? true);
        setAnnouncementText(annData.text || DEFAULT_ANNOUNCEMENT_BAR.text);
      }

      if (storeData) {
        if (storeData.storeName) setStoreName(storeData.storeName);
        if (storeData.tagline) setTagline(storeData.tagline);
        if (storeData.supportEmail) setSupportEmail(storeData.supportEmail);
        if (storeData.supportPhone) setSupportPhone(storeData.supportPhone);
        if (storeData.storeCity) setStoreCity(storeData.storeCity);
        if (storeData.freeShippingThreshold) setFreeShippingThreshold(String(storeData.freeShippingThreshold));
        if (storeData.shippingFee) setShippingFee(String(storeData.shippingFee));
        if (storeData.returnDays) setReturnDays(String(storeData.returnDays));
      }

      setLoading(false);
    }

    loadAllSettings();
  }, []);

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHero(true);
    try {
      const publicUrl = await uploadImageToStorage(file, 'products');
      setHeroImageUrl(publicUrl);
    } catch (err) {
      console.error('Failed to upload hero image:', err);
    } finally {
      setIsUploadingHero(false);
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  };

  const handlePromoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPromo(true);
    try {
      const publicUrl = await uploadImageToStorage(file, 'products');
      setPromoImageUrl(publicUrl);
    } catch (err) {
      console.error('Failed to upload promo image:', err);
    } finally {
      setIsUploadingPromo(false);
      if (promoFileRef.current) promoFileRef.current.value = '';
    }
  };

  const handleAddReview = () => {
    if (!newRevName.trim() || !newRevReview.trim()) return;
    const newRev: CustomerReview = {
      id: Date.now(),
      name: newRevName.trim(),
      city: newRevCity.trim() || 'India',
      rating: Number(newRevRating) || 5,
      item: 'Heavyweight Streetwear',
      review: newRevReview.trim(),
      verified: true,
      fit: newRevFit.trim() || 'True to oversized fit',
    };
    setReviews([newRev, ...reviews]);
    setNewRevName('');
    setNewRevCity('');
    setNewRevReview('');
  };

  const handleRemoveReview = (id: string | number) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const heroPayload: HeroBannerSettings = {
      badge: heroBadge.trim(),
      title: heroTitle.trim(),
      subtitle: heroSubtitle.trim(),
      imageUrl: heroImageUrl.trim(),
      primaryBtnText: heroPrimaryText.trim(),
      primaryBtnLink: heroPrimaryLink.trim(),
      secondaryBtnText: heroSecondaryText.trim(),
      secondaryBtnLink: heroSecondaryLink.trim(),
    };

    const sectionsPayload: HomePageSectionsSettings = {
      showCategories,
      categoriesTag: categoriesTag.trim(),
      categoriesTitle: categoriesTitle.trim(),
      showFeatured,
      featuredTag: featuredTag.trim(),
      featuredTitle: featuredTitle.trim(),
    };

    const promoPayload: PromoDropBannerSettings = {
      isEnabled: promoEnabled,
      badge: promoBadge.trim(),
      title: promoTitle.trim(),
      subtitle: promoSubtitle.trim(),
      buttonText: promoButtonText.trim(),
      buttonLink: promoButtonLink.trim(),
      imageUrl: promoImageUrl.trim(),
      specs: promoSpecs,
    };

    const whyPayload: WhyAuraSettings = {
      tag: whyTag.trim(),
      title: whyTitle.trim(),
      features: whyFeatures,
    };

    const communityPayload: CommunitySectionSettings = {
      tag: communityTag.trim(),
      title: communityTitle.trim(),
      subtitle: communitySubtitle.trim(),
      instagramHandle: instaHandle.trim(),
      instagramUrl: instaUrl.trim(),
      reviews,
    };

    const annPayload: AnnouncementBarSettings = {
      isEnabled: announcementEnabled,
      text: announcementText.trim(),
    };

    const storePayload = {
      storeName,
      tagline,
      supportEmail,
      supportPhone,
      storeCity,
      freeShippingThreshold: Number(freeShippingThreshold) || 999,
      shippingFee: Number(shippingFee) || 99,
      returnDays: Number(returnDays) || 7,
    };

    await Promise.all([
      saveSetting('hero_banner', heroPayload),
      saveSetting('homepage_sections', sectionsPayload),
      saveSetting('promo_banner', promoPayload),
      saveSetting('why_aura', whyPayload),
      saveSetting('community_reviews', communityPayload),
      saveSetting('announcement_bar', annPayload),
      saveSetting('store_info', storePayload),
    ]);

    setIsSaving(false);
    setFeedback('All home page sections and settings have been saved and published!');
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-black">
          Home Page & Store Customization
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Full real-time control over every section of your public storefront home page.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-black text-white flex items-center gap-2.5 text-xs font-bold border-l-4 border-white animate-fade-in">
          <CheckCircle2 size={16} className="text-white shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Navigation Tabs for Fast Editing */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {[
          { id: 'hero', label: '1. Hero & Announcement', icon: Layout },
          { id: 'promo', label: '2. Drop 01 Promo Banner', icon: Sparkles },
          { id: 'sections', label: '3. Categories & Featured', icon: Store },
          { id: 'why', label: '4. Why AURA OUTLET', icon: Shield },
          { id: 'community', label: '5. Community Reviews', icon: MessageSquare },
          { id: 'store', label: '6. Store & Shipping', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                isActive 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray hover:text-black border-border hover:border-black'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">

        {/* TAB 1: HERO & ANNOUNCEMENT BAR */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Announcement Bar */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-black" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">Top Announcement Bar</h3>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={announcementEnabled} 
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="accent-black"
                  />
                  Enable Bar
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Bar Message</label>
                <Input 
                  value={announcementText} 
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="FREE SHIPPING ON ORDERS ABOVE ₹999"
                />
              </div>
            </div>

            {/* Hero Banner */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <Layout size={16} className="text-black" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Main Hero Banner</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Badge Text</label>
                  <Input value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Main Headline</label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Subheading / Description</label>
                <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={2} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Primary Button Label & Link</label>
                  <div className="flex gap-2">
                    <Input value={heroPrimaryText} onChange={(e) => setHeroPrimaryText(e.target.value)} placeholder="Shop Now" />
                    <Input value={heroPrimaryLink} onChange={(e) => setHeroPrimaryLink(e.target.value)} placeholder="/shop" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Secondary Button Label & Link</label>
                  <div className="flex gap-2">
                    <Input value={heroSecondaryText} onChange={(e) => setHeroSecondaryText(e.target.value)} placeholder="View Collections" />
                    <Input value={heroSecondaryLink} onChange={(e) => setHeroSecondaryLink(e.target.value)} placeholder="/collections" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Hero Background Banner Image</label>
                <div className="flex gap-2">
                  <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} className="flex-1" />
                  <input type="file" ref={heroFileRef} accept="image/*" className="hidden" onChange={handleHeroFileUpload} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => heroFileRef.current?.click()} 
                    disabled={isUploadingHero}
                    className="shrink-0 text-xs font-bold uppercase h-10 px-3"
                  >
                    {isUploadingHero ? <Loader2 size={13} className="animate-spin mr-1" /> : <Upload size={13} className="mr-1" />}
                    Upload
                  </Button>
                </div>
                {heroImageUrl && (
                  <div className="relative h-32 w-full border border-border bg-black overflow-hidden mt-2">
                    <img src={heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 mb-1">{heroBadge}</span>
                      <h4 className="text-sm font-black uppercase">{heroTitle}</h4>
                      <p className="text-[10px] text-white/80 line-clamp-1">{heroSubtitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROMO DROP 01 BANNER */}
        {activeTab === 'promo' && (
          <div className="bg-white border border-border p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-black" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Promo Drop 01 Banner</h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={promoEnabled} 
                  onChange={(e) => setPromoEnabled(e.target.checked)}
                  className="accent-black"
                />
                Show Section
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Badge Text</label>
                <Input value={promoBadge} onChange={(e) => setPromoBadge(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Headline</label>
                <Input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Description</label>
              <Textarea value={promoSubtitle} onChange={(e) => setPromoSubtitle(e.target.value)} rows={2} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Button Label</label>
                <Input value={promoButtonText} onChange={(e) => setPromoButtonText(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Button Link Target</label>
                <Input value={promoButtonLink} onChange={(e) => setPromoButtonLink(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Background Image</label>
              <div className="flex gap-2">
                <Input value={promoImageUrl} onChange={(e) => setPromoImageUrl(e.target.value)} className="flex-1" />
                <input type="file" ref={promoFileRef} accept="image/*" className="hidden" onChange={handlePromoFileUpload} />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => promoFileRef.current?.click()} 
                  disabled={isUploadingPromo}
                  className="shrink-0 text-xs font-bold uppercase h-10 px-3"
                >
                  {isUploadingPromo ? <Loader2 size={13} className="animate-spin mr-1" /> : <Upload size={13} className="mr-1" />}
                  Upload
                </Button>
              </div>
            </div>

            {/* 4 Technical Feature Badges */}
            <div className="pt-3 border-t border-border space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black block">
                4 Technical Specification Badges
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {promoSpecs.map((spec, i) => (
                  <div key={i} className="p-2.5 border border-border bg-off-white space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-gray">Badge 0{i + 1}</span>
                    <Input 
                      value={spec.title} 
                      onChange={(e) => {
                        const updated = [...promoSpecs];
                        updated[i].title = e.target.value;
                        setPromoSpecs(updated);
                      }}
                      placeholder="Title (e.g. 240+ GSM)"
                      className="h-8 text-xs"
                    />
                    <Input 
                      value={spec.desc} 
                      onChange={(e) => {
                        const updated = [...promoSpecs];
                        updated[i].desc = e.target.value;
                        setPromoSpecs(updated);
                      }}
                      placeholder="Description"
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & FEATURED PRODUCTS SECTIONS */}
        {activeTab === 'sections' && (
          <div className="space-y-5 animate-fade-in">
            {/* Categories Section */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Shop by Category Section</h3>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showCategories} 
                    onChange={(e) => setShowCategories(e.target.checked)}
                    className="accent-black"
                  />
                  Show Section
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Tagline</label>
                  <Input value={categoriesTag} onChange={(e) => setCategoriesTag(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Title</label>
                  <Input value={categoriesTitle} onChange={(e) => setCategoriesTitle(e.target.value)} />
                </div>
              </div>
              <p className="text-[11px] text-gray leading-relaxed bg-off-white p-2.5 border border-border">
                The individual category cards are generated dynamically from your active catalog in <strong className="text-black">Admin &gt; Categories</strong>.
              </p>
            </div>

            {/* Featured Collection Section */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Featured Products Section</h3>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showFeatured} 
                    onChange={(e) => setShowFeatured(e.target.checked)}
                    className="accent-black"
                  />
                  Show Section
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Tagline</label>
                  <Input value={featuredTag} onChange={(e) => setFeaturedTag(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Title</label>
                  <Input value={featuredTitle} onChange={(e) => setFeaturedTitle(e.target.value)} />
                </div>
              </div>
              <p className="text-[11px] text-gray leading-relaxed bg-off-white p-2.5 border border-border">
                To feature any product here, toggle the &ldquo;Featured&rdquo; switch inside <strong className="text-black">Admin &gt; Products</strong>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: WHY AURA OUTLET */}
        {activeTab === 'why' && (
          <div className="bg-white border border-border p-5 space-y-4 animate-fade-in">
            <div className="border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">&ldquo;Why AURA OUTLET&rdquo; Value Strip</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Tag</label>
                <Input value={whyTag} onChange={(e) => setWhyTag(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Title</label>
                <Input value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black block">4 Value Propositions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {whyFeatures.map((feat, i) => (
                  <div key={i} className="p-2.5 border border-border bg-off-white space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-gray">Proposition 0{i + 1}</span>
                    <Input 
                      value={feat.title} 
                      onChange={(e) => {
                        const updated = [...whyFeatures];
                        updated[i].title = e.target.value;
                        setWhyFeatures(updated);
                      }}
                      className="h-8 text-xs font-bold"
                    />
                    <Input 
                      value={feat.desc} 
                      onChange={(e) => {
                        const updated = [...whyFeatures];
                        updated[i].desc = e.target.value;
                        setWhyFeatures(updated);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMMUNITY REVIEWS */}
        {activeTab === 'community' && (
          <div className="bg-white border border-border p-5 space-y-4 animate-fade-in">
            <div className="border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">Community Fit Check & Reviews</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Tag</label>
                <Input value={communityTag} onChange={(e) => setCommunityTag(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Title</label>
                <Input value={communityTitle} onChange={(e) => setCommunityTitle(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Subtitle</label>
              <Input value={communitySubtitle} onChange={(e) => setCommunitySubtitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Instagram Handle</label>
                <Input value={instaHandle} onChange={(e) => setInstaHandle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Instagram Profile Link</label>
                <Input value={instaUrl} onChange={(e) => setInstaUrl(e.target.value)} />
              </div>
            </div>

            {/* Existing Reviews List */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-black">
                  Published Reviews ({reviews.length})
                </label>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 border border-border bg-off-white flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-black">
                        <span>{rev.name}</span>
                        <span className="text-gray text-[10px]">({rev.city})</span>
                        <div className="flex ml-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} className="fill-black text-black" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray text-[11px] italic mt-1">&ldquo;{rev.review}&rdquo;</p>
                      <span className="text-[10px] font-semibold text-black mt-1 inline-block bg-white px-1.5 py-0.2 border border-border">
                        {rev.fit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReview(rev.id)}
                      className="text-gray hover:text-red-600 p-1 transition-colors"
                      title="Remove review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Review Box */}
              <div className="mt-3 p-3 border border-black bg-white space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-black block">Add Customer Review</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input 
                    value={newRevName} 
                    onChange={(e) => setNewRevName(e.target.value)} 
                    placeholder="Customer Name"
                    className="h-8 text-xs" 
                  />
                  <Input 
                    value={newRevCity} 
                    onChange={(e) => setNewRevCity(e.target.value)} 
                    placeholder="City" 
                    className="h-8 text-xs" 
                  />
                  <Input 
                    type="number"
                    min="1"
                    max="5"
                    value={newRevRating} 
                    onChange={(e) => setNewRevRating(e.target.value)} 
                    placeholder="Rating (1-5)" 
                    className="h-8 text-xs" 
                  />
                  <Input 
                    value={newRevFit} 
                    onChange={(e) => setNewRevFit(e.target.value)} 
                    placeholder="Fit tag (e.g. True to oversized)" 
                    className="h-8 text-xs" 
                  />
                </div>
                <Textarea 
                  value={newRevReview} 
                  onChange={(e) => setNewRevReview(e.target.value)} 
                  placeholder="Review quote text..." 
                  rows={2} 
                  className="text-xs"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddReview}
                  className="text-xs font-bold uppercase h-9 px-4"
                >
                  <Plus size={13} className="mr-1" /> Add Review to Storefront
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STORE PROFILE & POLICIES */}
        {activeTab === 'store' && (
          <div className="bg-white border border-border p-5 space-y-4 animate-fade-in">
            <div className="border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">Store Profile & Fulfillment Rules</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Brand Name</label>
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Motto / Tagline</label>
                <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Support Email</label>
                <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Support Phone / WhatsApp</label>
                <Input type="tel" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Free Shipping Above (₹)</label>
                <Input type="number" min="0" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Standard Delivery Fee (₹)</label>
                <Input type="number" min="0" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* STICKY SAVE BAR */}
        <div className="sticky bottom-4 z-20 bg-white border border-black p-3.5 flex items-center justify-between shadow-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
            Publish all changes to public storefront
          </p>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSaving} 
            className="uppercase text-xs font-black tracking-widest px-6 h-10"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
