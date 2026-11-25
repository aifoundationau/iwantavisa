import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Building2,
  Briefcase,
  Mail,
  Cpu,
  AlertTriangle,
  Star,
  Store,
} from 'lucide-react';
import { MERCHANT_CATEGORY_META } from '../data/cambodiaData';
import { generateUniqueId } from '../lib/merchants';
import { AgentServicePostcard } from './AgentServicePostcard';
import { ImageUploadField } from './ImageUploadField';
import { PhotosUploadField } from './PhotosUploadField';
import {
  AgentServiceCategory,
  AgentServiceFormSchema,
  AgentServicePromotion,
  CambodiaRentalListing,
  MerchantOffer,
  RentalListingFormSchema,
  RentalPostcardMessage,
  TechCommunityPost,
  TechServiceInquiry,
} from '../types/contracts';

export type AdminSubTab =
  | 'merchant-desk'
  | 'review-moderation'
  | 'post-agent'
  | 'post-rental'
  | 'manage-items';

interface AdminControlPanelProps {
  /** Rendered under the Merchant Desk sub-tab (sign-in prompt or the merchant's desk). */
  merchantDesk: React.ReactNode;
  /** Superadmin review queue (approve before reviews are published). */
  reviewModeration: React.ReactNode;
  pendingReviewCount: number;
  initialSubTab?: AdminSubTab;
  merchantOffers: MerchantOffer[];
  onDeleteMerchantOffer: (id: string) => void;
  agentServices: AgentServicePromotion[];
  onAddAgentService: (srv: AgentServicePromotion) => void;
  onDeleteAgentService: (id: string) => void;
  rentals: CambodiaRentalListing[];
  onAddRental: (rental: CambodiaRentalListing) => void;
  onDeleteRental: (id: string) => void;
  sentPostcards: RentalPostcardMessage[];
  onDeletePostcard: (id: string) => void;
  techInquiries: TechServiceInquiry[];
  onDeleteTechInquiry: (id: string) => void;
  communityPosts: TechCommunityPost[];
  onDeleteCommunityPost: (id: string) => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  merchantDesk,
  reviewModeration,
  pendingReviewCount,
  initialSubTab = 'post-agent',
  merchantOffers,
  onDeleteMerchantOffer,
  agentServices,
  onAddAgentService,
  onDeleteAgentService,
  rentals,
  onAddRental,
  onDeleteRental,
  sentPostcards,
  onDeletePostcard,
  techInquiries,
  onDeleteTechInquiry,
  communityPosts,
  onDeleteCommunityPost,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<AdminSubTab>(initialSubTab);

  // Mandatory Two-Step Confirm Delete state: maps itemId -> boolean
  const [confirmDeleteMap, setConfirmDeleteMap] = useState<Record<string, boolean>>({});

  // Agent Service Form State
  const [agentName, setAgentName] = useState('');
  const [agencyTitle, setAgencyTitle] = useState('');
  const [category, setCategory] = useState<AgentServiceCategory>('visa_extensions');
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deliverablesRaw, setDeliverablesRaw] = useState(
    '12-Month Multiple-Entry Visa Sticker, GDI FPCS Check, Free Phnom Penh Courier'
  );
  const [turnaroundDays, setTurnaroundDays] = useState('5–7 Business Days');
  const [priceUsd, setPriceUsd] = useState(290);
  const [city, setCity] =
    useState<AgentServicePromotion['city']>('Phnom Penh');
  const [sangkatDistrict, setSangkatDistrict] = useState('Sangkat BKK1');
  const [verifiedLicenseNo, setVerifiedLicenseNo] = useState('KH-GDI-202699');
  const [contactTelegram, setContactTelegram] = useState('@CambodiaVisaPro');
  const [contactPhoneKh, setContactPhoneKh] = useState('+855 12 990 112');
  // Up to 6 postcard photos, uploaded to imgbb (16:9) by the photo field; the first is the cover.
  const [agentPhotos, setAgentPhotos] = useState<string[]>([]);
  const [agentFormFeedback, setAgentFormFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [publishedService, setPublishedService] = useState<AgentServicePromotion | null>(null);

  // Rental Property Form State
  const [rentalTitle, setRentalTitle] = useState('');
  const [khmerNeighborhood, setKhmerNeighborhood] = useState(
    'បឹងកេងកងទី១ (BKK1) • រាជធានីភ្នំពេញ'
  );
  const [propertyType, setPropertyType] =
    useState<CambodiaRentalListing['propertyType']>('Condo');
  const [rentalCity, setRentalCity] =
    useState<CambodiaRentalListing['city']>('Phnom Penh');
  const [sangkat, setSangkat] = useState('Sangkat Boeung Keng Kang 1 (Street 288)');
  const [priceUsdMonthly, setPriceUsdMonthly] = useState(600);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [areaSqm, setAreaSqm] = useState(55);
  const [fpcsGuaranteed, setFpcsGuaranteed] = useState(true);
  const [sangkatCertAssisted, setSangkatCertAssisted] = useState(true);
  const [edcRateKhr, setEdcRateKhr] = useState('$0.24/kWh • Free Pool & Gym');
  // Uploaded to imgbb (16:9) by the photo field below.
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('FPCS in 24h • Sangkat Ready');
  const [amenitiesRaw, setAmenitiesRaw] = useState(
    'Sky Pool, 100Mbps Fiber, Backup Generator, FPCS 24h Guaranteed'
  );
  const [rentalAgentName, setRentalAgentName] = useState('Darith Sok');
  const [rentalAgentAgency, setRentalAgentAgency] = useState('Angkor Prestige Realty');
  const [rentalAgentTelegram, setRentalAgentTelegram] = useState('@AngkorPrestigeKH');
  const [rentalFormFeedback, setRentalFormFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleCreateAgentService = (e: React.FormEvent) => {
    e.preventDefault();
    setAgentFormFeedback(null);
    setPublishedService(null);

    const parsed = AgentServiceFormSchema.safeParse({
      agentName,
      agencyTitle,
      category,
      serviceTitle,
      description,
      deliverablesRaw,
      turnaroundDays,
      priceUsd: Math.round(Number(priceUsd)),
      city,
      sangkatDistrict,
      verifiedLicenseNo,
      contactTelegram,
      contactPhoneKh,
      imageUrls: agentPhotos,
    });

    if (!parsed.success) {
      setAgentFormFeedback({
        type: 'error',
        text: parsed.error.issues[0]?.message || 'Validation failed — check inputs.',
      });
      return;
    }

    const newService: AgentServicePromotion = {
      id: generateUniqueId('AGT', agentServices.map((srv) => srv.id)),
      agentName: parsed.data.agentName,
      agencyTitle: parsed.data.agencyTitle,
      avatarEmoji: '🇰🇭',
      category: parsed.data.category,
      serviceTitle: parsed.data.serviceTitle,
      description: parsed.data.description,
      deliverables: parsed.data.deliverablesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      turnaroundDays: parsed.data.turnaroundDays,
      priceUsd: Math.round(parsed.data.priceUsd),
      city: parsed.data.city,
      sangkatDistrict: parsed.data.sangkatDistrict,
      verifiedLicenseNo: parsed.data.verifiedLicenseNo,
      contactTelegram: parsed.data.contactTelegram,
      contactPhoneKh: parsed.data.contactPhoneKh,
      rating: 5.0,
      reviewCount: 1,
      isLockedFromCsv: false,
      createdAt: new Date().toISOString(),
      ...(parsed.data.imageUrls.length > 0 ? { imageUrls: parsed.data.imageUrls } : {}),
    };

    onAddAgentService(newService);
    setAgentFormFeedback({
      type: 'success',
      text: `Published Agent Service "${newService.serviceTitle}" (${newService.id}) to the Marketplace!`,
    });
    setPublishedService(newService);
    setAgentName('');
    setAgencyTitle('');
    setServiceTitle('');
    setDescription('');
    setAgentPhotos([]);
  };

  const handleCreateRental = (e: React.FormEvent) => {
    e.preventDefault();
    setRentalFormFeedback(null);

    const parsed = RentalListingFormSchema.safeParse({
      title: rentalTitle,
      khmerNeighborhood,
      propertyType,
      city: rentalCity,
      sangkat,
      priceUsdMonthly: Math.round(Number(priceUsdMonthly)),
      bedrooms: Math.round(Number(bedrooms)),
      bathrooms: Math.round(Number(bathrooms)),
      areaSqm: Math.round(Number(areaSqm)),
      fpcsGuaranteed,
      sangkatCertAssisted,
      edcRateKhr,
      imageUrl,
      badgeText,
      amenitiesRaw,
      agentName: rentalAgentName,
      agentAgency: rentalAgentAgency,
      agentTelegram: rentalAgentTelegram,
    });

    if (!parsed.success) {
      setRentalFormFeedback({
        type: 'error',
        text: parsed.error.issues[0]?.message || 'Validation failed — check rental fields.',
      });
      return;
    }

    const newRental: CambodiaRentalListing = {
      id: `RNT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: parsed.data.title,
      khmerNeighborhood: parsed.data.khmerNeighborhood,
      propertyType: parsed.data.propertyType,
      city: parsed.data.city,
      sangkat: parsed.data.sangkat,
      priceUsdMonthly: Math.round(parsed.data.priceUsdMonthly),
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      areaSqm: parsed.data.areaSqm,
      fpcsGuaranteed: parsed.data.fpcsGuaranteed,
      sangkatCertAssisted: parsed.data.sangkatCertAssisted,
      edcRateKhr: parsed.data.edcRateKhr,
      imageUrl: parsed.data.imageUrl,
      badgeText: parsed.data.badgeText,
      amenities: parsed.data.amenitiesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      agentName: parsed.data.agentName,
      agentAgency: parsed.data.agentAgency,
      agentTelegram: parsed.data.agentTelegram,
      postcardStampCode: `KH-${parsed.data.city.slice(0, 3).toUpperCase()}-${Math.floor(
        10 + Math.random() * 89
      )}`,
      isLockedFromCsv: false,
    };

    onAddRental(newRental);
    setRentalFormFeedback({
      type: 'success',
      text: `Published Rental Property "${newRental.title}" (${newRental.id}) with Message Agent Postcard!`,
    });
    setRentalTitle('');
  };

  const requestDeleteConfirmation = (key: string) => {
    setConfirmDeleteMap((prev) => ({ ...prev, [key]: true }));
  };

  const cancelDeleteConfirmation = (key: string) => {
    setConfirmDeleteMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <section className="space-y-8" aria-labelledby="admin-panel-heading">
      {/* Top Admin Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-amber-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-extrabold text-amber-300">
            <ShieldAlert className="w-4 h-4" />
            Superadmin Publishing &amp; Governance Console
          </div>
          <h2 id="admin-panel-heading" className="text-2xl sm:text-3xl font-extrabold">
            I Want A Visa Cambodia — Admin Control Panel
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Merchant Desk, review moderation, Verified Agent Service Promotions and Cambodia Rentals Gallery Postcard listings (prices in USD), with mandatory two-step Confirm Delete protection.
          </p>
        </div>

        {/* Sub-navigation pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('merchant-desk')}
            data-agent-id="admin-subtab-merchant-desk"
            data-testid="admin-subtab-merchant-desk"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeAdminSubTab === 'merchant-desk'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Merchant Desk
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('review-moderation')}
            data-agent-id="admin-subtab-review-moderation"
            data-testid="admin-subtab-review-moderation"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeAdminSubTab === 'review-moderation'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Reviews ({pendingReviewCount} pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('post-agent')}
            data-agent-id="admin-subtab-post-agent"
            data-testid="admin-subtab-post-agent"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeAdminSubTab === 'post-agent'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> + Post Agent Service
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('post-rental')}
            data-agent-id="admin-subtab-post-rental"
            data-testid="admin-subtab-post-rental"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeAdminSubTab === 'post-rental'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> + Post Rental Postcard
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminSubTab('manage-items')}
            data-agent-id="admin-subtab-manage-items"
            data-testid="admin-subtab-manage-items"
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeAdminSubTab === 'manage-items'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Manage &amp; Delete (
            {agentServices.length + rentals.length + merchantOffers.length})
          </button>
        </div>
      </div>

      {/* Merchant Desk: sign in, adjust auto-detected location, post offer postcards */}
      {activeAdminSubTab === 'merchant-desk' && merchantDesk}

      {/* Superadmin approves reviews before they appear on a merchant's reviews list */}
      {activeAdminSubTab === 'review-moderation' && reviewModeration}

      {/* Sub-Tab 1: Post New Agent Service Promotion */}
      {activeAdminSubTab === 'post-agent' && (
        <form
          onSubmit={handleCreateAgentService}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-5"
        >
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              Post New Cambodia Agent Service Promotion
            </h3>
            <p className="text-xs text-slate-500">
              Validated against <code className="font-mono">AgentServicePromotion</code> contract in{' '}
              <code className="font-mono">data-contracts.MD</code> (whole-dollar USD prices)
            </p>
          </div>

          {agentFormFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                agentFormFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-400'
                  : 'bg-rose-50 text-rose-800 border border-rose-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{agentFormFeedback.text}</span>
            </div>
          )}

          {/* The postcard as travellers now see it on Agent Services */}
          {publishedService && (
            <div className="max-w-xl mx-auto space-y-2" data-testid="admin-agent-service-preview">
              <AgentServicePostcard service={publishedService} idPrefix={`preview-${publishedService.id}`} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agent Full Name *
              </label>
              <input
                type="text"
                required
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Kosal Vann"
                data-agent-id="admin-agent-name-input"
                data-testid="admin-agent-name-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agency / Company Name *
              </label>
              <input
                type="text"
                required
                value={agencyTitle}
                onChange={(e) => setAgencyTitle(e.target.value)}
                placeholder="e.g., Phnom Penh Premier Visa Desk"
                data-agent-id="admin-agency-title-input"
                data-testid="admin-agency-title-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Service Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentServiceCategory)}
                data-agent-id="admin-agent-category-select"
                data-testid="admin-agent-category-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="visa_extensions">EB / ER / CM2H Visa Extensions</option>
                <option value="bank_account">ABA / ACLEDA Bank Account Opening</option>
                <option value="driver_license_mpwt">MPWT Driver’s License Conversion</option>
                <option value="sangkat_fpcs">Sangkat Residence Cert &amp; FPCS</option>
                <option value="camdx_incorporation">CamDX Company Registration</option>
                <option value="work_permit_fwcms">MLVT Work Permit (FWCMS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Promoted Service Headline *
              </label>
              <input
                type="text"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                placeholder="e.g., 1-Year EB Business Visa + MLVT Work Permit Fast-Track"
                data-agent-id="admin-agent-service-title-input"
                data-testid="admin-agent-service-title-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Turnaround Time *
              </label>
              <input
                type="text"
                required
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(e.target.value)}
                data-agent-id="admin-agent-turnaround-input"
                data-testid="admin-agent-turnaround-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Service Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how your agency helps expats or tech founders in Cambodia..."
              data-agent-id="admin-agent-description-textarea"
              data-testid="admin-agent-description-textarea"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            />
          </div>

          <PhotosUploadField
            value={agentPhotos}
            onChange={setAgentPhotos}
            uploadName={`agent ${agencyTitle || agentName} ${serviceTitle}`}
            idPrefix="admin-agent-photos"
            label="Postcard Photos (optional)"
            hint={`The first photo is the cover on the Agent Services board. No photos? The postcard gets an illustrated “Greetings from ${city}” front.`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Price (USD $) *
              </label>
              <input
                type="number"
                step={1}
                required
                value={priceUsd}
                onChange={(e) => setPriceUsd(Math.round(Number(e.target.value)))}
                data-agent-id="admin-agent-usd-input"
                data-testid="admin-agent-usd-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value as AgentServicePromotion['city'])
                }
                data-agent-id="admin-agent-city-select"
                data-testid="admin-agent-city-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Kampot">Kampot</option>
                <option value="Sihanoukville">Sihanoukville</option>
                <option value="Battambang">Battambang</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sangkat / District *
              </label>
              <input
                type="text"
                required
                value={sangkatDistrict}
                onChange={(e) => setSangkatDistrict(e.target.value)}
                data-agent-id="admin-agent-sangkat-input"
                data-testid="admin-agent-sangkat-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telegram (@handle) *
              </label>
              <input
                type="text"
                required
                value={contactTelegram}
                onChange={(e) => setContactTelegram(e.target.value)}
                data-agent-id="admin-agent-telegram-input"
                data-testid="admin-agent-telegram-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cambodia Phone *
              </label>
              <input
                type="text"
                required
                value={contactPhoneKh}
                onChange={(e) => setContactPhoneKh(e.target.value)}
                data-agent-id="admin-agent-phone-input"
                data-testid="admin-agent-phone-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deliverables (Comma-separated) *
              </label>
              <input
                type="text"
                required
                value={deliverablesRaw}
                onChange={(e) => setDeliverablesRaw(e.target.value)}
                data-agent-id="admin-agent-deliverables-input"
                data-testid="admin-agent-deliverables-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                License / Registration Code *
              </label>
              <input
                type="text"
                required
                value={verifiedLicenseNo}
                onChange={(e) => setVerifiedLicenseNo(e.target.value)}
                data-agent-id="admin-agent-license-input"
                data-testid="admin-agent-license-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            data-agent-id="admin-submit-new-agent-service-btn"
            data-testid="admin-submit-new-agent-service-btn"
            className="px-6 py-3 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs shadow-lg"
          >
            Publish Agent Service Promotion to Website
          </button>
        </form>
      )}

      {/* Sub-Tab 2: Post New Rental Gallery Property with Message Agent Postcard */}
      {activeAdminSubTab === 'post-rental' && (
        <form
          onSubmit={handleCreateRental}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-5"
        >
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              Post New Cambodia Rental Property + Message Agent Postcard
            </h3>
            <p className="text-xs text-slate-500">
              Automatically generates a Cambodia Postcard Stamp Code and enables direct Postcard inquiries to the listing agent.
            </p>
          </div>

          {rentalFormFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                rentalFormFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-400'
                  : 'bg-rose-50 text-rose-800 border border-rose-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{rentalFormFeedback.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Property Listing Title *
              </label>
              <input
                type="text"
                required
                value={rentalTitle}
                onChange={(e) => setRentalTitle(e.target.value)}
                placeholder="e.g., Diamond Island (Koh Pich) Riverfront 2BR Penthouse"
                data-agent-id="admin-rental-title-input"
                data-testid="admin-rental-title-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Property Type *
              </label>
              <select
                value={propertyType}
                onChange={(e) =>
                  setPropertyType(
                    e.target.value as CambodiaRentalListing['propertyType']
                  )
                }
                data-agent-id="admin-rental-type-select"
                data-testid="admin-rental-type-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Condo">Condo</option>
                <option value="Serviced Apartment">Serviced Apartment</option>
                <option value="Pool Villa">Pool Villa</option>
                <option value="Shophouse Loft">Shophouse Loft</option>
                <option value="Riverside Studio">Riverside Studio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <select
                value={rentalCity}
                onChange={(e) =>
                  setRentalCity(e.target.value as CambodiaRentalListing['city'])
                }
                data-agent-id="admin-rental-city-select"
                data-testid="admin-rental-city-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Phnom Penh">Phnom Penh</option>
                <option value="Siem Reap">Siem Reap</option>
                <option value="Kampot">Kampot</option>
                <option value="Sihanoukville">Sihanoukville</option>
                <option value="Koh Rong">Koh Rong</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sangkat &amp; Street *
              </label>
              <input
                type="text"
                required
                value={sangkat}
                onChange={(e) => setSangkat(e.target.value)}
                data-agent-id="admin-rental-sangkat-input"
                data-testid="admin-rental-sangkat-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khmer Neighborhood Subtitle
              </label>
              <input
                type="text"
                value={khmerNeighborhood}
                onChange={(e) => setKhmerNeighborhood(e.target.value)}
                data-agent-id="admin-rental-khmer-input"
                data-testid="admin-rental-khmer-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-khmer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rent USD/Mo *
              </label>
              <input
                type="number"
                step={1}
                required
                value={priceUsdMonthly}
                onChange={(e) => setPriceUsdMonthly(Math.round(Number(e.target.value)))}
                data-agent-id="admin-rental-usd-input"
                data-testid="admin-rental-usd-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                data-agent-id="admin-rental-beds-input"
                data-testid="admin-rental-beds-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                data-agent-id="admin-rental-baths-input"
                data-testid="admin-rental-baths-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Area (m²)
              </label>
              <input
                type="number"
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                data-agent-id="admin-rental-area-input"
                data-testid="admin-rental-area-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              uploadName={`rental ${rentalTitle || rentalCity}`}
              idPrefix="admin-rental-photo"
              label="Property Photo *"
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                EDC Electricity &amp; Utility Note *
              </label>
              <input
                type="text"
                required
                value={edcRateKhr}
                onChange={(e) => setEdcRateKhr(e.target.value)}
                data-agent-id="admin-rental-edc-input"
                data-testid="admin-rental-edc-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Highlight Badge *
              </label>
              <input
                type="text"
                required
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                data-agent-id="admin-rental-badge-input"
                data-testid="admin-rental-badge-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Listing Agent Name *
              </label>
              <input
                type="text"
                required
                value={rentalAgentName}
                onChange={(e) => setRentalAgentName(e.target.value)}
                data-agent-id="admin-rental-agent-name-input"
                data-testid="admin-rental-agent-name-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Real Estate Agency *
              </label>
              <input
                type="text"
                required
                value={rentalAgentAgency}
                onChange={(e) => setRentalAgentAgency(e.target.value)}
                data-agent-id="admin-rental-agent-agency-input"
                data-testid="admin-rental-agent-agency-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Agent Telegram (@handle) *
              </label>
              <input
                type="text"
                required
                value={rentalAgentTelegram}
                onChange={(e) => setRentalAgentTelegram(e.target.value)}
                data-agent-id="admin-rental-agent-telegram-input"
                data-testid="admin-rental-agent-telegram-input"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={fpcsGuaranteed}
                onChange={(e) => setFpcsGuaranteed(e.target.checked)}
                data-agent-id="admin-rental-fpcs-checkbox"
                data-testid="admin-rental-fpcs-checkbox"
              />
              <span>24-Hour GDI FPCS Registration Guaranteed</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={sangkatCertAssisted}
                onChange={(e) => setSangkatCertAssisted(e.target.checked)}
                data-agent-id="admin-rental-sangkat-checkbox"
                data-testid="admin-rental-sangkat-checkbox"
              />
              <span>Sangkat Residence Certificate Assisted</span>
            </label>
          </div>

          <button
            type="submit"
            data-agent-id="admin-submit-new-rental-btn"
            data-testid="admin-submit-new-rental-btn"
            className="px-6 py-3 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs shadow-lg"
          >
            Publish Rental &amp; Generate Postcard Stamp
          </button>
        </form>
      )}

      {/* Sub-Tab 3: Manage All Listings & Two-Step Confirm Delete */}
      {activeAdminSubTab === 'manage-items' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Global Directive Active: Every deletable item requires a two-step{' '}
              <strong>Confirm Delete</strong> button before removal.
            </span>
          </div>

          {/* Agent Services CRUD List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Promoted Agent Services ({agentServices.length})
            </h3>
            <div className="space-y-2.5">
              {agentServices.map((srv) => {
                const delKey = `agent-${srv.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {srv.serviceTitle}{' '}
                        <span className="font-mono text-[10px] text-amber-600">
                          ({srv.id})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {srv.agentName} • {srv.city} • ${srv.priceUsd} USD
                        {srv.imageUrls?.length ? ` • 📷 ${srv.imageUrls.length}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => requestDeleteConfirmation(delKey)}
                          data-agent-id={`delete-init-agent-${srv.id}`}
                          data-testid={`delete-init-agent-${srv.id}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteAgentService(srv.id);
                              cancelDeleteConfirmation(delKey);
                            }}
                            data-agent-id={`confirm-delete-agent-${srv.id}`}
                            data-testid={`confirm-delete-agent-${srv.id}`}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
                          >
                            ✓ Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDeleteConfirmation(delKey)}
                            data-agent-id={`cancel-delete-agent-${srv.id}`}
                            data-testid={`cancel-delete-agent-${srv.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rentals Gallery CRUD List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cambodia Rentals Gallery Listings ({rentals.length})
            </h3>
            <div className="space-y-2.5">
              {rentals.map((r) => {
                const delKey = `rental-${r.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {r.title}{' '}
                        <span className="font-mono text-[10px] text-amber-600">
                          (Stamp: {r.postcardStampCode})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {r.city} • {r.sangkat} • Agent: {r.agentName} ({r.agentTelegram})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => requestDeleteConfirmation(delKey)}
                          data-agent-id={`delete-init-rental-${r.id}`}
                          data-testid={`delete-init-rental-${r.id}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteRental(r.id);
                              cancelDeleteConfirmation(delKey);
                            }}
                            data-agent-id={`confirm-delete-rental-${r.id}`}
                            data-testid={`confirm-delete-rental-${r.id}`}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
                          >
                            ✓ Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDeleteConfirmation(delKey)}
                            data-agent-id={`cancel-delete-rental-${r.id}`}
                            data-testid={`cancel-delete-rental-${r.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Offer Postcards CRUD List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Merchant Offer Postcards ({merchantOffers.length})
            </h3>
            <div className="space-y-2.5">
              {merchantOffers.map((offer) => {
                const delKey = `offer-${offer.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {offer.headline}{' '}
                        <span className="font-mono text-[10px] text-amber-600">({offer.id})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {offer.businessName} • {MERCHANT_CATEGORY_META[offer.category].label} •{' '}
                        {offer.city} • {offer.dealBadge}
                        {offer.linkedInPulseUrl ? ' • 📰 LinkedIn Pulse' : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => requestDeleteConfirmation(delKey)}
                          data-agent-id={`delete-init-offer-${offer.id}`}
                          data-testid={`delete-init-offer-${offer.id}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteMerchantOffer(offer.id);
                              cancelDeleteConfirmation(delKey);
                            }}
                            data-agent-id={`confirm-delete-offer-${offer.id}`}
                            data-testid={`confirm-delete-offer-${offer.id}`}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
                          >
                            ✓ Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelDeleteConfirmation(delKey)}
                            data-agent-id={`cancel-delete-offer-${offer.id}`}
                            data-testid={`cancel-delete-offer-${offer.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatched Postcards & Tech Inquiries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600" />
                Sent Rental Postcards ({sentPostcards.length})
              </h4>
              {sentPostcards.map((pc) => {
                const delKey = `pcard-${pc.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={pc.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        {pc.senderName} → {pc.recipientAgent}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {pc.rentalTitle}
                      </div>
                    </div>
                    {!isConfirming ? (
                      <button
                        type="button"
                        onClick={() => requestDeleteConfirmation(delKey)}
                        data-agent-id={`delete-init-postcard-${pc.id}`}
                        data-testid={`delete-init-postcard-${pc.id}`}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 text-[11px] font-bold shrink-0"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePostcard(pc.id);
                            cancelDeleteConfirmation(delKey);
                          }}
                          data-agent-id={`confirm-delete-postcard-${pc.id}`}
                          data-testid={`confirm-delete-postcard-${pc.id}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelDeleteConfirmation(delKey)}
                          className="px-2 py-1 rounded-lg bg-slate-200 text-slate-800 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Tech Entrepreneur Inquiries ({techInquiries.length}) &amp; Community Posts ({communityPosts.length})
              </h4>
              {techInquiries.map((inq) => {
                const delKey = `tech-${inq.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={inq.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        {inq.founderName} ({inq.companyOrStartup})
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {inq.serviceStream}
                      </div>
                    </div>
                    {!isConfirming ? (
                      <button
                        type="button"
                        onClick={() => requestDeleteConfirmation(delKey)}
                        data-agent-id={`delete-init-tech-${inq.id}`}
                        data-testid={`delete-init-tech-${inq.id}`}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 text-[11px] font-bold shrink-0"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTechInquiry(inq.id);
                            cancelDeleteConfirmation(delKey);
                          }}
                          data-agent-id={`confirm-delete-tech-${inq.id}`}
                          data-testid={`confirm-delete-tech-${inq.id}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelDeleteConfirmation(delKey)}
                          className="px-2 py-1 rounded-lg bg-slate-200 text-slate-800 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {communityPosts.map((post) => {
                const delKey = `comm-${post.id}`;
                const isConfirming = !!confirmDeleteMap[delKey];
                return (
                  <div
                    key={post.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">
                        [Community] {post.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        By {post.authorName} • {post.hubLocation}
                        {post.imageUrls?.length ? ` • 📷 ${post.imageUrls.length}` : ''}
                      </div>
                    </div>
                    {!isConfirming ? (
                      <button
                        type="button"
                        onClick={() => requestDeleteConfirmation(delKey)}
                        data-agent-id={`delete-init-comm-${post.id}`}
                        data-testid={`delete-init-comm-${post.id}`}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 text-[11px] font-bold shrink-0"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCommunityPost(post.id);
                            cancelDeleteConfirmation(delKey);
                          }}
                          data-agent-id={`confirm-delete-comm-${post.id}`}
                          data-testid={`confirm-delete-comm-${post.id}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelDeleteConfirmation(delKey)}
                          className="px-2 py-1 rounded-lg bg-slate-200 text-slate-800 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
