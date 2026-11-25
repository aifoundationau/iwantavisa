import React, { useState } from 'react';
import { CheckCircle2, Inbox, PhoneCall, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { AGENT_SERVICE_CATEGORY_META, AGENT_SERVICE_CATEGORY_ORDER } from '../data/cambodiaData';
import { AgentServiceCategory, AgentServicePromotion } from '../types/contracts';
import { AgentServicePostcard } from './AgentServicePostcard';
import { Modal } from './Modal';
import { PostcardDialog } from './PostcardDialog';
import { PostcardGrid } from './PostcardGrid';
import { SharedPostcardSpotlight } from './SharedPostcardSpotlight';

interface AgentMarketplaceProps {
  services: AgentServicePromotion[];
  onOpenAdminToPost: () => void;
  /** Service opened from a shared link (?agent=AGT-…), pinned above the postcards. */
  sharedServiceId: string | null;
  onDismissSharedService: () => void;
}

const ALL_CITIES = 'All Cities';
const AGENT_CITIES: { value: AgentServicePromotion['city']; label: string }[] = [
  { value: 'Phnom Penh', label: 'Phnom Penh (ភ្នំពេញ)' },
  { value: 'Siem Reap', label: 'Siem Reap (សៀមរាប)' },
  { value: 'Kampot', label: 'Kampot (កំពត)' },
  { value: 'Sihanoukville', label: 'Sihanoukville (ព្រះសីហនុ)' },
  { value: 'Battambang', label: 'Battambang (បាត់ដំបង)' },
];

const FIELD_LABEL = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';
const FIELD_INPUT =
  'w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold';

export const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({
  services,
  onOpenAdminToPost,
  sharedServiceId,
  onDismissSharedService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | AgentServiceCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [openedServiceId, setOpenedServiceId] = useState<string | null>(null);
  const [activeAgentModal, setActiveAgentModal] = useState<AgentServicePromotion | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const findService = (id: string | null) => (id ? services.find((s) => s.id === id) ?? null : null);
  const sharedService = findService(sharedServiceId);
  const openedService = findService(openedServiceId);

  const filteredServices = services.filter(
    (srv) =>
      (selectedCategory === 'all' || srv.category === selectedCategory) &&
      (selectedCity === ALL_CITIES || srv.city === selectedCity)
  );
  // The shared postcard is pinned above, so don't repeat it in the grid.
  const gridServices = sharedService
    ? filteredServices.filter((srv) => srv.id !== sharedService.id)
    : filteredServices;

  const openInquiry = (srv: AgentServicePromotion) => {
    setActiveAgentModal(srv);
    setBookingSuccess(null);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgentModal || !clientName.trim() || !clientContact.trim()) return;
    setBookingSuccess(
      `Inquiry sent to ${activeAgentModal.agentName} (${activeAgentModal.contactTelegram})! Reference: #KH-${Math.floor(
        10000 + Math.random() * 90000
      )}`
    );
    setClientName('');
    setClientContact('');
    setClientNote('');
  };

  return (
    <section className="space-y-8" aria-labelledby="agent-marketplace-heading">
      {/* Pinned postcard from a shared link */}
      {sharedServiceId && (
        <SharedPostcardSpotlight
          idBase="shared-agent"
          heading={
            sharedService ? `A postcard from ${sharedService.agentName}` : 'This agent service is no longer available'
          }
          missingHint={sharedService ? undefined : 'The agent may have ended it — browse the latest services below.'}
          dismissLabel="Dismiss shared agent service"
          onDismiss={onDismissSharedService}
          scrollKey={sharedServiceId}
        >
          {sharedService && (
            <AgentServicePostcard
              service={sharedService}
              idPrefix={`shared-${sharedService.id}`}
              onMessage={openInquiry}
            />
          )}
        </SharedPostcardSpotlight>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4" />
            Licensed Cambodia Visa, Banking, Sangkat &amp; MPWT Agents
          </div>
          <h2
            id="agent-marketplace-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white"
          >
            Verified Cambodia Agent Service Postcards 📮
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            Compare verified agents across Phnom Penh, Siem Reap, Kampot, Sihanoukville and Battambang. Every
            service is a shareable postcard — tap one for its photos, what’s included and how to reach the agent.
            Prices are in US dollars (the footer shows riel). Agents and admins post new services from the Admin
            Panel.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdminToPost}
          data-agent-id="open-admin-post-agent-service-btn"
          data-testid="open-admin-post-agent-service-btn"
          aria-label="Promote an Agent Service via Admin Panel"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs px-5 py-3.5 shadow-lg hover:opacity-95 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          + Promote Agent Service (Admin Panel)
        </button>
      </div>

      {/* Category & City Filters */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', ...AGENT_SERVICE_CATEGORY_ORDER] as const).map((id) => {
              const active = selectedCategory === id;
              const meta =
                id === 'all' ? { emoji: '🇰🇭', label: 'All Cambodia Services' } : AGENT_SERVICE_CATEGORY_META[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCategory(id)}
                  data-agent-id={`filter-agent-cat-${id}`}
                  data-testid={`filter-agent-cat-${id}`}
                  aria-pressed={active}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#0F2557] text-amber-300 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <span aria-hidden="true">{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="agent-city-filter" className="text-xs font-bold text-slate-600 dark:text-slate-400">
              City:
            </label>
            <select
              id="agent-city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              data-agent-id="agent-city-filter-select"
              data-testid="agent-city-filter-select"
              aria-label="Filter agents by Cambodia city"
              className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value={ALL_CITIES}>All Cambodia Cities</option>
              {AGENT_CITIES.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
          Showing {filteredServices.length} agent service{filteredServices.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Agent service postcards: 2 per row on every screen, 3 rows at a time, then More */}
      {filteredServices.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-amber-500/50 bg-white/70 dark:bg-slate-900 p-8 text-center space-y-3">
          <Inbox className="w-10 h-10 text-amber-600 mx-auto" aria-hidden="true" />
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">No agent services here yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try another category or city.</p>
        </div>
      ) : (
        gridServices.length > 0 && (
          <PostcardGrid
            items={gridServices}
            getKey={(srv) => srv.id}
            resetKey={`${selectedCategory}|${selectedCity}|${sharedService?.id ?? ''}`}
            testId="agent-services-grid"
            ariaLabel="Agent service postcards"
            noun="services"
            renderItem={(srv) => (
              <AgentServicePostcard
                service={srv}
                compact
                onOpen={(s) => setOpenedServiceId(s.id)}
                onMessage={openInquiry}
              />
            )}
          />
        )
      )}

      {/* The full postcard, opened from a compact card */}
      {openedService && (
        <PostcardDialog
          titleId={`agent-headline-open-${openedService.id}`}
          testId="agent-service-dialog"
          closeTestId="close-agent-service-dialog-btn"
          onClose={() => setOpenedServiceId(null)}
        >
          <AgentServicePostcard
            service={openedService}
            idPrefix={`open-${openedService.id}`}
            onMessage={(srv) => {
              setOpenedServiceId(null);
              openInquiry(srv);
            }}
          />
        </PostcardDialog>
      )}

      {/* Agent Inquiry Modal */}
      {activeAgentModal && (
        <Modal
          titleId="agent-booking-modal-title"
          onClose={() => setActiveAgentModal(null)}
          testId="agent-booking-dialog"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                Direct Cambodia Agent Desk
              </span>
              <h3 id="agent-booking-modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeAgentModal.serviceTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeAgentModal.agentName} • {activeAgentModal.agencyTitle} ({activeAgentModal.contactTelegram})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAgentModal(null)}
              data-agent-id="close-agent-booking-modal-btn"
              data-testid="close-agent-booking-modal-btn"
              aria-label="Close Agent Booking Modal"
              className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {bookingSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">{bookingSuccess}</p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                You can also message them directly on Telegram at{' '}
                <strong>{activeAgentModal.contactTelegram}</strong> or call{' '}
                <strong>{activeAgentModal.contactPhoneKh}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setActiveAgentModal(null)}
                data-agent-id="done-agent-booking-modal-btn"
                data-testid="done-agent-booking-modal-btn"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div>
                <label htmlFor="agent-modal-client-name" className={FIELD_LABEL}>
                  Your Full Name (as on Passport) *
                </label>
                <input
                  id="agent-modal-client-name"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g., Alex Mercer"
                  data-agent-id="agent-modal-client-name"
                  data-testid="agent-modal-client-name"
                  className={FIELD_INPUT}
                />
              </div>
              <div>
                <label htmlFor="agent-modal-client-contact" className={FIELD_LABEL}>
                  Your Telegram Handle, WhatsApp, or Email *
                </label>
                <input
                  id="agent-modal-client-contact"
                  type="text"
                  required
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="e.g., @AlexInPhnomPenh or +855 12 345 678"
                  data-agent-id="agent-modal-client-contact"
                  data-testid="agent-modal-client-contact"
                  className={FIELD_INPUT}
                />
              </div>
              <div>
                <label htmlFor="agent-modal-client-note" className={FIELD_LABEL}>
                  Current Visa Status &amp; Request Notes
                </label>
                <textarea
                  id="agent-modal-client-note"
                  rows={3}
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="e.g., Currently in BKK1 on 30-day Visa E, need 1-Year EB extension + ABA bank setup."
                  data-agent-id="agent-modal-client-note"
                  data-testid="agent-modal-client-note"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> {activeAgentModal.contactPhoneKh}
                </div>
                <button
                  type="submit"
                  data-agent-id="submit-agent-service-inquiry-btn"
                  data-testid="submit-agent-service-inquiry-btn"
                  className="px-5 py-2.5 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold text-xs shadow-md"
                >
                  Send Fast-Track Request
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
};
