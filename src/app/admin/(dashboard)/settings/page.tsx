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
  Star,
  Megaphone,
  FileText
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
  AdvertisementWidgetSettings,
  PolicyPagesSettings,
  StoreInfoSettings,
  ShippingRateRule,
  DEFAULT_STORE_INFO,
  DEFAULT_HERO_BANNER,
  DEFAULT_PROMO_BANNER,
  DEFAULT_WHY_AURA,
  DEFAULT_COMMUNITY,
  DEFAULT_ANNOUNCEMENT_BAR,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ADVERTISEMENT_WIDGET,
  DEFAULT_POLICY_PAGES,
  CustomerReview
} from '@/lib/services/settings';
import { uploadImageToStorage } from '@/lib/services/storage';
import { getAllSubmittedReviews, ProductReview } from '@/lib/services/reviews';
import { getAllAdminProducts } from '@/lib/services/products';
import { Product } from '@/lib/types';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'promo' | 'sections' | 'ad_widget' | 'why' | 'community' | 'store' | 'policies'>('hero');

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
  const [submittedReviews, setSubmittedReviews] = useState<ProductReview[]>([]);
  const [loadingSubmittedReviews, setLoadingSubmittedReviews] = useState(false);

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
  const [shippingFeeTN, setShippingFeeTN] = useState('50');
  const [shippingFeeOutsideTN, setShippingFeeOutsideTN] = useState('120');
  const [shippingFee, setShippingFee] = useState('50');
  const [codExtraFee, setCodExtraFee] = useState('100');
  const [codAdvanceAmount, setCodAdvanceAmount] = useState('200');
  const [customStateRates, setCustomStateRates] = useState<ShippingRateRule[]>([]);
  const [newCustomState, setNewCustomState] = useState('');
  const [newCustomFee, setNewCustomFee] = useState('');
  const [returnDays, setReturnDays] = useState('7');
  const [shippingItemThreshold, setShippingItemThreshold] = useState('2');
  const [shippingExtraPerItem, setShippingExtraPerItem] = useState('50');

  // 8. Homepage Advertisement Widget
  const [adEnabled, setAdEnabled] = useState(DEFAULT_ADVERTISEMENT_WIDGET.isEnabled);
  const [adTag, setAdTag] = useState(DEFAULT_ADVERTISEMENT_WIDGET.tag);
  const [adTitle, setAdTitle] = useState(DEFAULT_ADVERTISEMENT_WIDGET.title);
  const [adSubtitle, setAdSubtitle] = useState(DEFAULT_ADVERTISEMENT_WIDGET.subtitle);
  const [adBadge, setAdBadge] = useState(DEFAULT_ADVERTISEMENT_WIDGET.badge);
  const [adButtonText, setAdButtonText] = useState(DEFAULT_ADVERTISEMENT_WIDGET.buttonText);
  const [adButtonLink, setAdButtonLink] = useState(DEFAULT_ADVERTISEMENT_WIDGET.buttonLink);
  const [adProductIds, setAdProductIds] = useState<string[]>(DEFAULT_ADVERTISEMENT_WIDGET.productIds);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // 9. Store Policies & Info Pages
  const [aboutStoryTitle, setAboutStoryTitle] = useState(DEFAULT_POLICY_PAGES.aboutStoryTitle);
  const [aboutStorySubtitle, setAboutStorySubtitle] = useState(DEFAULT_POLICY_PAGES.aboutStorySubtitle);
  const [aboutStoryText, setAboutStoryText] = useState(DEFAULT_POLICY_PAGES.aboutStoryText);
  const [aboutPhilosophyText, setAboutPhilosophyText] = useState(DEFAULT_POLICY_PAGES.aboutPhilosophyText);
  const [contactEmail, setContactEmail] = useState(DEFAULT_POLICY_PAGES.contactEmail);
  const [contactPhone, setContactPhone] = useState(DEFAULT_POLICY_PAGES.contactPhone);
  const [contactInstagram, setContactInstagram] = useState(DEFAULT_POLICY_PAGES.contactInstagram);
  const [contactAddress, setContactAddress] = useState(DEFAULT_POLICY_PAGES.contactAddress);
  const [contactHours, setContactHours] = useState(DEFAULT_POLICY_PAGES.contactHours);
  const [shippingPolicyText, setShippingPolicyText] = useState(DEFAULT_POLICY_PAGES.shippingPolicyText);
  const [returnPolicyText, setReturnPolicyText] = useState(DEFAULT_POLICY_PAGES.returnPolicyText);
  const [privacyPolicyText, setPrivacyPolicyText] = useState(DEFAULT_POLICY_PAGES.privacyPolicyText);

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
        allCustReviews,
        adData,
        policyData,
        catalogProducts,
      ] = await Promise.all([
        getSetting<HeroBannerSettings>('hero_banner', DEFAULT_HERO_BANNER),
        getSetting<HomePageSectionsSettings>('homepage_sections', DEFAULT_HOMEPAGE_SECTIONS),
        getSetting<PromoDropBannerSettings>('promo_banner', DEFAULT_PROMO_BANNER),
        getSetting<WhyAuraSettings>('why_aura', DEFAULT_WHY_AURA),
        getSetting<CommunitySectionSettings>('community_reviews', DEFAULT_COMMUNITY),
        getSetting<AnnouncementBarSettings>('announcement_bar', DEFAULT_ANNOUNCEMENT_BAR),
        getSetting<any>('store_info', null),
        getAllSubmittedReviews(),
        getSetting<AdvertisementWidgetSettings>('ad_widget', DEFAULT_ADVERTISEMENT_WIDGET),
        getSetting<PolicyPagesSettings>('policy_pages', DEFAULT_POLICY_PAGES),
        getAllAdminProducts(),
      ]);

      if (catalogProducts) {
        setAvailableProducts(catalogProducts);
      }

      if (allCustReviews) {
        setSubmittedReviews(allCustReviews);
      }

      if (adData) {
        setAdEnabled(adData.isEnabled ?? true);
        setAdTag(adData.tag || DEFAULT_ADVERTISEMENT_WIDGET.tag);
        setAdTitle(adData.title || DEFAULT_ADVERTISEMENT_WIDGET.title);
        setAdSubtitle(adData.subtitle || DEFAULT_ADVERTISEMENT_WIDGET.subtitle);
        setAdBadge(adData.badge || DEFAULT_ADVERTISEMENT_WIDGET.badge);
        setAdButtonText(adData.buttonText || DEFAULT_ADVERTISEMENT_WIDGET.buttonText);
        setAdButtonLink(adData.buttonLink || DEFAULT_ADVERTISEMENT_WIDGET.buttonLink);
        setAdProductIds(adData.productIds || []);
      }

      if (policyData) {
        setAboutStoryTitle(policyData.aboutStoryTitle || DEFAULT_POLICY_PAGES.aboutStoryTitle);
        setAboutStorySubtitle(policyData.aboutStorySubtitle || DEFAULT_POLICY_PAGES.aboutStorySubtitle);
        setAboutStoryText(policyData.aboutStoryText || DEFAULT_POLICY_PAGES.aboutStoryText);
        setAboutPhilosophyText(policyData.aboutPhilosophyText || DEFAULT_POLICY_PAGES.aboutPhilosophyText);
        setContactEmail(policyData.contactEmail || DEFAULT_POLICY_PAGES.contactEmail);
        setContactPhone(policyData.contactPhone || DEFAULT_POLICY_PAGES.contactPhone);
        setContactInstagram(policyData.contactInstagram || DEFAULT_POLICY_PAGES.contactInstagram);
        setContactAddress(policyData.contactAddress || DEFAULT_POLICY_PAGES.contactAddress);
        setContactHours(policyData.contactHours || DEFAULT_POLICY_PAGES.contactHours);
        setShippingPolicyText(policyData.shippingPolicyText || DEFAULT_POLICY_PAGES.shippingPolicyText);
        setReturnPolicyText(policyData.returnPolicyText || DEFAULT_POLICY_PAGES.returnPolicyText);
        setPrivacyPolicyText(policyData.privacyPolicyText || DEFAULT_POLICY_PAGES.privacyPolicyText);
      }

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
        if (storeData.freeShippingThreshold !== undefined) setFreeShippingThreshold(String(storeData.freeShippingThreshold));
        if (storeData.shippingFeeTN !== undefined) setShippingFeeTN(String(storeData.shippingFeeTN));
        if (storeData.shippingFeeOutsideTN !== undefined) setShippingFeeOutsideTN(String(storeData.shippingFeeOutsideTN));
        if (storeData.shippingFee !== undefined) setShippingFee(String(storeData.shippingFee));
        if (storeData.codExtraFee !== undefined) setCodExtraFee(String(storeData.codExtraFee));
        if (storeData.codAdvanceAmount !== undefined) setCodAdvanceAmount(String(storeData.codAdvanceAmount));
        if (Array.isArray(storeData.customStateRates)) setCustomStateRates(storeData.customStateRates);
        if (storeData.returnDays) setReturnDays(String(storeData.returnDays));
        if (storeData.shippingItemThreshold !== undefined) setShippingItemThreshold(String(storeData.shippingItemThreshold));
        if (storeData.shippingExtraPerItem !== undefined) setShippingExtraPerItem(String(storeData.shippingExtraPerItem));
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

  const handleToggleFeatureCustomerReview = (item: ProductReview) => {
    const isAlreadyFeatured = reviews.some((r) => String(r.id) === String(item.id));
    if (isAlreadyFeatured) {
      setReviews(reviews.filter((r) => String(r.id) !== String(item.id)));
    } else {
      const newFeatured: CustomerReview = {
        id: item.id,
        name: item.name,
        city: item.city || 'India',
        rating: item.rating,
        item: item.product_name ? `${item.product_name} • Heavyweight` : 'Heavyweight Streetwear',
        review: item.comment,
        verified: true,
        fit: item.fit,
      };
      setReviews([newFeatured, ...reviews]);
    }
  };

  const handleAddCustomStateRate = () => {
    if (!newCustomState.trim() || !newCustomFee.trim()) return;
    const feeNum = Number(newCustomFee);
    if (isNaN(feeNum) || feeNum < 0) return;
    const cleanState = newCustomState.trim();
    const existing = customStateRates.filter(
      (r) => r.state.trim().toLowerCase() !== cleanState.toLowerCase()
    );
    setCustomStateRates([...existing, { state: cleanState, fee: feeNum }]);
    setNewCustomState('');
    setNewCustomFee('');
  };

  const handleRemoveCustomStateRate = (stateName: string) => {
    setCustomStateRates(customStateRates.filter((r) => r.state !== stateName));
  };

  const handleToggleAdProduct = (id: string) => {
    if (adProductIds.includes(id)) {
      setAdProductIds(adProductIds.filter((pId) => pId !== id));
    } else {
      setAdProductIds([...adProductIds, id]);
    }
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

    const adPayload: AdvertisementWidgetSettings = {
      isEnabled: adEnabled,
      tag: adTag.trim(),
      title: adTitle.trim(),
      subtitle: adSubtitle.trim(),
      badge: adBadge.trim(),
      buttonText: adButtonText.trim(),
      buttonLink: adButtonLink.trim(),
      productIds: adProductIds,
      layout: 'grid',
    };

    const policiesPayload: PolicyPagesSettings = {
      aboutStoryTitle: aboutStoryTitle.trim(),
      aboutStorySubtitle: aboutStorySubtitle.trim(),
      aboutStoryText: aboutStoryText.trim(),
      aboutPhilosophyText: aboutPhilosophyText.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      contactInstagram: contactInstagram.trim(),
      contactAddress: contactAddress.trim(),
      contactHours: contactHours.trim(),
      shippingPolicyText: shippingPolicyText.trim(),
      returnPolicyText: returnPolicyText.trim(),
      privacyPolicyText: privacyPolicyText.trim(),
    };

    const storePayload: StoreInfoSettings = {
      storeName,
      tagline,
      supportEmail,
      supportPhone,
      storeCity,
      freeShippingThreshold: Number(freeShippingThreshold) || 999,
      shippingFeeTN: Number(shippingFeeTN) || 50,
      shippingFeeOutsideTN: Number(shippingFeeOutsideTN) || 120,
      shippingFee: Number(shippingFeeTN) || 50,
      codExtraFee: Number(codExtraFee) || 100,
      codAdvanceAmount: Number(codAdvanceAmount) || 200,
      customStateRates,
      returnDays: Number(returnDays) || 7,
      shippingItemThreshold: Number(shippingItemThreshold) || 2,
      shippingExtraPerItem: Number(shippingExtraPerItem) || 50,
    };

    await Promise.all([
      saveSetting('hero_banner', heroPayload),
      saveSetting('homepage_sections', sectionsPayload),
      saveSetting('promo_banner', promoPayload),
      saveSetting('ad_widget', adPayload),
      saveSetting('why_aura', whyPayload),
      saveSetting('community_reviews', communityPayload),
      saveSetting('announcement_bar', annPayload),
      saveSetting('store_info', storePayload),
      saveSetting('policy_pages', policiesPayload),
    ]);

    setIsSaving(false);
    setFeedback('All home page sections, advertisements, and store policy pages have been saved and published!');
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
          { id: 'hero', label: '1. Hero & Top Bar', icon: Layout },
          { id: 'promo', label: '2. Drop 01 Promo', icon: Sparkles },
          { id: 'sections', label: '3. Categories & Featured', icon: Store },
          { id: 'ad_widget', label: '4. Top Highlights (T-Shirts)', icon: Megaphone },
          { id: 'why', label: '5. Why AURA OUTLET', icon: Shield },
          { id: 'community', label: '6. Community Reviews', icon: MessageSquare },
          { id: 'store', label: '7. Store & Shipping', icon: Truck },
          { id: 'policies', label: '8. Policies & Info Pages', icon: FileText },
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

        {/* TAB 4: HOMEPAGE AD WIDGET (TOP HIGHLIGHTS) */}
        {activeTab === 'ad_widget' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">Top Highlights / Advertised T-Shirts</h3>
                  <p className="text-[11px] text-gray mt-0.5">Feature specific t-shirts on your home page. Only the exact t-shirts you check below will be displayed.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={adEnabled} 
                    onChange={(e) => setAdEnabled(e.target.checked)}
                    className="accent-black"
                  />
                  Enable Widget
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Top Tagline</label>
                  <Input value={adTag} onChange={(e) => setAdTag(e.target.value)} placeholder="Curated Streetwear Picks" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Badge Text</label>
                  <Input value={adBadge} onChange={(e) => setAdBadge(e.target.value)} placeholder="TOP HIGHLIGHTS" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Section Title (e.g. Top Highlights)</label>
                  <Input value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="Top Highlights" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Subtitle / Description</label>
                  <Textarea value={adSubtitle} onChange={(e) => setAdSubtitle(e.target.value)} rows={2} placeholder="Handpicked heavyweights engineered for structural drape and longevity." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Button Label</label>
                  <Input value={adButtonText} onChange={(e) => setAdButtonText(e.target.value)} placeholder="View All Designs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Button Link</label>
                  <Input value={adButtonLink} onChange={(e) => setAdButtonLink(e.target.value)} placeholder="/shop" />
                </div>
              </div>
            </div>

            {/* Advertised Products Picker */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="border-b border-border pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">Select T-Shirts to Spotlight ({adProductIds.length} Selected)</h3>
                  <p className="text-[11px] text-gray mt-0.5">Click any product to toggle its presence in the advertised widget banner.</p>
                </div>
                {adProductIds.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setAdProductIds([])}
                    className="text-[11px] font-bold text-red-600 hover:underline uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {availableProducts.length === 0 ? (
                <p className="text-xs text-gray py-4 text-center">No products found in catalog.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1 border border-border bg-off-white rounded-md">
                  {availableProducts.map((p) => {
                    const isSelected = adProductIds.includes(p.id) || adProductIds.includes(p.slug);
                    const thumbnail = p.images && p.images[0]?.image_url;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleToggleAdProduct(p.id)}
                        className={`p-2.5 border rounded cursor-pointer flex items-center gap-2.5 transition-all ${
                          isSelected 
                            ? 'bg-black text-white border-black shadow-sm' 
                            : 'bg-white text-black border-border hover:border-black'
                        }`}
                      >
                        <div className="w-10 h-10 shrink-0 bg-off-white border border-border flex items-center justify-center overflow-hidden rounded">
                          {thumbnail ? (
                            <img src={thumbnail} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-gray">AO</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">{p.name}</p>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray'}`}>
                            {p.sale_price ? `₹${p.sale_price}` : `₹${p.base_price}`}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-white text-black border-white' : 'border-gray-400'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: WHY AURA OUTLET */}
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

              {/* Customer-Submitted Product Reviews (from orders & product pages) */}
              <div className="mt-4 pt-4 border-t-2 border-black space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Star size={13} className="fill-black text-black" />
                      Customer-Submitted Reviews ({submittedReviews.length})
                    </h4>
                    <p className="text-[11px] text-gray">
                      Reviews submitted by verified customers on order confirmation or product pages. Click to feature on Homepage.
                    </p>
                  </div>
                </div>

                {submittedReviews.length === 0 ? (
                  <p className="text-xs text-gray italic bg-off-white p-3 border border-border">
                    No customer reviews submitted yet. When customers submit reviews on the order receipt or product page, they will show up here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {submittedReviews.map((item) => {
                      const isFeatured = reviews.some((r) => String(r.id) === String(item.id));
                      return (
                        <div 
                          key={item.id} 
                          className={`p-3 border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isFeatured ? 'bg-black text-white border-black' : 'bg-off-white text-black border-border'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{item.name}</span>
                              <span className={`text-[10px] ${isFeatured ? 'text-gray-300' : 'text-gray'}`}>
                                ({item.city || 'India'})
                              </span>
                              <div className="flex">
                                {[...Array(item.rating)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={11} 
                                    className={isFeatured ? 'fill-yellow-400 text-yellow-400' : 'fill-black text-black'} 
                                  />
                                ))}
                              </div>
                              {item.product_name && (
                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 font-bold ${
                                  isFeatured ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
                                }`}>
                                  {item.product_name}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] italic ${isFeatured ? 'text-gray-200' : 'text-gray-700'}`}>
                              &ldquo;{item.comment}&rdquo;
                            </p>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className={`px-1.5 py-0.5 border ${
                                isFeatured ? 'border-white/30 text-white' : 'border-border bg-white text-black'
                              }`}>
                                Fit: {item.fit}
                              </span>
                              <span className={isFeatured ? 'text-gray-400' : 'text-gray'}>
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleFeatureCustomerReview(item)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 border ${
                              isFeatured
                                ? 'bg-white text-black border-white hover:bg-gray-200'
                                : 'bg-black text-white border-black hover:bg-gray-800'
                            }`}
                          >
                            {isFeatured ? '✓ Featured on Home' : '+ Feature on Home'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Store / Dispatch City</label>
                <Input value={storeCity} onChange={(e) => setStoreCity(e.target.value)} required />
              </div>
            </div>

            {/* Location-Based Shipping Rules */}
            <div className="border-t border-border pt-4 mt-2 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-black" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">Location-Based Shipping Rates & COD Rules</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-black">Tamil Nadu Shipping (₹)</label>
                    <span className="text-[9px] px-1.5 py-0.5 bg-black text-white font-bold uppercase">Local</span>
                  </div>
                  <Input 
                    type="number" 
                    min="0" 
                    value={shippingFeeTN} 
                    onChange={(e) => setShippingFeeTN(e.target.value)} 
                    placeholder="50"
                    required 
                  />
                  <p className="text-[10px] text-gray">Applied for customers delivering inside Tamil Nadu state.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-black">Outside Tamil Nadu (₹)</label>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-600 text-white font-bold uppercase">National</span>
                  </div>
                  <Input 
                    type="number" 
                    min="0" 
                    value={shippingFeeOutsideTN} 
                    onChange={(e) => setShippingFeeOutsideTN(e.target.value)} 
                    placeholder="120"
                    required 
                  />
                  <p className="text-[10px] text-gray">Applied for all other Indian states (Kerala, Karnataka, etc.).</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Free Shipping Threshold (₹)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={freeShippingThreshold} 
                    onChange={(e) => setFreeShippingThreshold(e.target.value)} 
                    placeholder="999"
                    required 
                  />
                  <p className="text-[10px] text-gray">Prepaid orders at or above this amount receive FREE delivery.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">COD Extra Handling Fee (₹)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={codExtraFee} 
                    onChange={(e) => setCodExtraFee(e.target.value)} 
                    placeholder="100"
                    required 
                  />
                  <p className="text-[10px] text-gray">Additional fee charged when customer selects Cash on Delivery.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">COD Online Advance (₹)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={codAdvanceAmount} 
                    onChange={(e) => setCodAdvanceAmount(e.target.value)} 
                    placeholder="200"
                    required 
                  />
                  <p className="text-[10px] text-gray">Advance payment paid online to confirm COD orders.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Return / Exchange Days</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={returnDays} 
                    onChange={(e) => setReturnDays(e.target.value)} 
                    placeholder="7"
                    required 
                  />
                  <p className="text-[10px] text-gray">Allowed window for customer returns or size exchanges.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Bulk Item Threshold</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={shippingItemThreshold} 
                    onChange={(e) => setShippingItemThreshold(e.target.value)} 
                    placeholder="2"
                    required 
                  />
                  <p className="text-[10px] text-gray">Base courier bracket (e.g. 2 items). Orders exceeding this incur bulk weight surcharge.</p>
                </div>

                <div className="space-y-1.5 bg-off-white p-3 border border-border">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-black">Extra Shipping Per Item (₹)</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={shippingExtraPerItem} 
                    onChange={(e) => setShippingExtraPerItem(e.target.value)} 
                    placeholder="50"
                    required 
                  />
                  <p className="text-[10px] text-gray">Added fee for each additional product onwards (e.g. ₹50 per extra tee).</p>
                </div>
              </div>

              {/* Custom State Rate Overrides */}
              <div className="bg-white border border-border p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-black">Custom State Rates (Optional)</h5>
                    <p className="text-[10px] text-gray">Override the default rate for specific individual states.</p>
                  </div>
                </div>

                {customStateRates.length > 0 && (
                  <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-off-white border-b border-border text-gray uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">State Name</th>
                          <th className="p-2.5">Shipping Fee (₹)</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-medium">
                        {customStateRates.map((rule) => (
                          <tr key={rule.state}>
                            <td className="p-2.5 font-bold text-black">{rule.state}</td>
                            <td className="p-2.5 font-mono">₹{rule.fee}</td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomStateRate(rule.state)}
                                className="text-red-500 hover:text-red-700 text-[11px] font-bold uppercase"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-end pt-1">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">State Name</label>
                    <Input 
                      placeholder="e.g. Kerala, Karnataka, Maharashtra" 
                      value={newCustomState} 
                      onChange={(e) => setNewCustomState(e.target.value)} 
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="w-full sm:w-36 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Fee (₹)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="e.g. 80" 
                      value={newCustomFee} 
                      onChange={(e) => setNewCustomFee(e.target.value)} 
                      className="h-9 text-xs"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddCustomStateRate} 
                    className="h-9 text-xs font-bold uppercase whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add State Rule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: STORE POLICIES & INFO PAGES */}
        {activeTab === 'policies' && (
          <div className="space-y-5 animate-fade-in">
            {/* About Us Page Customization */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">About Us Page (/about)</h3>
                <p className="text-[11px] text-gray mt-0.5">Control your brand story, philosophy, and mission statements.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Story Title</label>
                  <Input value={aboutStoryTitle} onChange={(e) => setAboutStoryTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Story Subtitle</label>
                  <Input value={aboutStorySubtitle} onChange={(e) => setAboutStorySubtitle(e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Brand Story Paragraph</label>
                  <Textarea value={aboutStoryText} onChange={(e) => setAboutStoryText(e.target.value)} rows={3} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Design Philosophy & Quality Standards</label>
                  <Textarea value={aboutPhilosophyText} onChange={(e) => setAboutPhilosophyText(e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            {/* Contact Page Customization */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Contact Page (/contact)</h3>
                <p className="text-[11px] text-gray mt-0.5">Direct contact details displayed to customers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Official Support Email</label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Customer Support Phone / WhatsApp</label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Instagram Handle</label>
                  <Input value={contactInstagram} onChange={(e) => setContactInstagram(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Headquarters Address</label>
                  <Input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Operating Hours</label>
                  <Input value={contactHours} onChange={(e) => setContactHours(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Shipping, Returns & Privacy Policies */}
            <div className="bg-white border border-border p-5 space-y-4">
              <div className="border-b border-border pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">Store Policies</h3>
                <p className="text-[11px] text-gray mt-0.5">Policy statements displayed across `/shipping-policy`, `/return-refund-policy`, and `/privacy-policy`.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Shipping Policy Summary</label>
                  <Textarea value={shippingPolicyText} onChange={(e) => setShippingPolicyText(e.target.value)} rows={3} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Return & Refund Policy Summary</label>
                  <Textarea value={returnPolicyText} onChange={(e) => setReturnPolicyText(e.target.value)} rows={3} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Privacy Policy Summary</label>
                  <Textarea value={privacyPolicyText} onChange={(e) => setPrivacyPolicyText(e.target.value)} rows={3} />
                </div>
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
