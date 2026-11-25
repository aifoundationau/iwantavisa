import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  MapPin,
  ArrowRight,
  Landmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  CAMBODIA_GUIDES,
  CAMBODIA_VISA_MATRIX,
  OFFICIAL_CAMBODIA_PORTALS,
} from '../data/cambodiaData';
import { GuideCategorySlug } from '../types/contracts';
import { PriceBadge } from './PriceBadge';

interface CambodiaGuidesHubProps {
  onJumpToAgents: () => void;
  onJumpToRentals: () => void;
}

type GuideSubView = 'guide' | 'matrix' | 'directory';

export const CambodiaGuidesHub: React.FC<CambodiaGuidesHubProps> = ({
  onJumpToAgents,
  onJumpToRentals,
}) => {
  const [hubTab, setHubTab] = useState<GuideSubView>('guide');
  const [activeGuideSlug, setActiveGuideSlug] = useState<GuideCategorySlug>(
    'sangkat-residence-fpcs'
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showProcessSteps, setShowProcessSteps] = useState(false);
  const [showWhereToApply, setShowWhereToApply] = useState(false);
  const [showBonusTips, setShowBonusTips] = useState(false);
  const [showBannerDetails, setShowBannerDetails] = useState(false);

  const activeGuide =
    CAMBODIA_GUIDES.find((g) => g.slug === activeGuideSlug) || CAMBODIA_GUIDES[0];

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalDocs = activeGuide.documentsNeeded.length;
  const completedDocs = activeGuide.documentsNeeded.filter(
    (_, idx) => checkedItems[`${activeGuide.id}-doc-${idx}`]
  ).length;
  const completionPct = Math.round((completedDocs / Math.max(1, totalDocs)) * 100);

  return (
    <section className="space-y-6" aria-labelledby="cambodia-guides-heading">
      {/* Slim Conversion Notice Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F2557] via-[#1E3A8A] to-[#881337] text-white p-4 shadow-md border border-amber-400/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 id="cambodia-guides-heading" className="text-sm sm:text-base font-extrabold">
                100% Converted from Thailand Docs → Official Cambodia Standards 🇰🇭
              </h2>
              <p className="text-[11px] text-blue-200">
                Official guides for e-Arrival (arrival.gov.kh), Sangkat/FPCS, ABA Banking &amp; MPWT Driving Licences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowBannerDetails(!showBannerDetails)}
              data-agent-id="guides-banner-toggle-details"
              data-testid="guides-banner-toggle-details"
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 transition-all font-bold"
            >
              {showBannerDetails ? 'Hide Notes ▲' : 'Official Sources ▼'}
            </button>
            <button
              type="button"
              onClick={onJumpToAgents}
              data-agent-id="guides-banner-hire-agent-btn"
              data-testid="guides-banner-hire-agent-btn"
              aria-label="Browse Verified Cambodia Agents"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3 py-1.5 shadow transition-all"
            >
              🤝 Hire Agent <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showBannerDetails && (
          <div className="mt-3 pt-3 border-t border-white/20 text-xs text-blue-100 space-y-1.5 animate-fadeIn">
            <p>
              Every guide has been re-engineered using verified data from{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200">arrival.gov.kh</code>,{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200">evisa.gov.kh</code>,{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200">immigration.gov.kh (FPCS)</code>,{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200">mpwt.gov.kh</code>, and{' '}
              <code className="bg-white/10 px-1 py-0.5 rounded text-amber-200">fwcms.mlvt.gov.kh</code>.
            </p>
          </div>
        )}
      </div>

      {/* Sub-view switcher: Guide vs Visa Matrix vs Gov Directory */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setHubTab('guide')}
          data-agent-id="guides-subtab-active-guide"
          data-testid="guides-subtab-active-guide"
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all text-center ${
            hubTab === 'guide'
              ? 'bg-[#0F2557] text-amber-300 shadow'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          📄 1. Active Guide &amp; Checklist
        </button>
        <button
          type="button"
          onClick={() => setHubTab('matrix')}
          data-agent-id="guides-subtab-visa-matrix"
          data-testid="guides-subtab-visa-matrix"
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all text-center ${
            hubTab === 'matrix'
              ? 'bg-[#0F2557] text-amber-300 shadow'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🛂 2. Cambodia Visa Matrix (6 Types)
        </button>
        <button
          type="button"
          onClick={() => setHubTab('directory')}
          data-agent-id="guides-subtab-gov-directory"
          data-testid="guides-subtab-gov-directory"
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all text-center ${
            hubTab === 'directory'
              ? 'bg-[#0F2557] text-amber-300 shadow'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          🏛️ 3. Official Gov.kh Portals (8)
        </button>
      </div>

      {/* Subview 1: Active Guide & Interactive Checklist */}
      {hubTab === 'guide' && (
        <div className="space-y-6">
          {/* Category Guide Selector Pills */}
          <div
            role="tablist"
            aria-label="Cambodia Official Expat Guides"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
          >
            {CAMBODIA_GUIDES.map((guide) => {
              const isSelected = guide.slug === activeGuide.slug;
              return (
                <button
                  key={guide.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-agent-id={`select-guide-tab-${guide.slug}`}
                  data-testid={`select-guide-tab-${guide.slug}`}
                  onClick={() => setActiveGuideSlug(guide.slug)}
                  className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0F2557] text-white border-amber-400 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-amber-400/60'
                  }`}
                >
                  <span className="text-xl mb-1">{guide.badgeEmoji}</span>
                  <div className="text-[11px] font-extrabold line-clamp-1">
                    {guide.title.split('—')[0]}
                  </div>
                  <div
                    className={`text-[10px] font-khmer truncate ${
                      isSelected ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {guide.khmerSubtitle.slice(0, 16)}...
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Guide Detail Card */}
          <article
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
            aria-labelledby="active-guide-title"
          >
            {/* Guide Header */}
            <header className="p-5 sm:p-6 bg-amber-50/70 dark:bg-slate-800/60 border-b border-amber-200/70 dark:border-slate-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 dark:bg-emerald-400/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {activeGuide.replacedThaiDocNote}
                  </div>
                  <h3
                    id="active-guide-title"
                    className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
                  >
                    <span>{activeGuide.badgeEmoji}</span>
                    <span>{activeGuide.title}</span>
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-3xl leading-snug">
                    {activeGuide.summary}
                  </p>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Turnkey Rate:
                  </span>
                  <PriceBadge priceUsd={activeGuide.costBreakdown.priceUsd} idPrefix={`guide-${activeGuide.slug}`} />
                </div>
              </div>

              {/* Official Portals for this Guide */}
              <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-700 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  🏛️ Portal:
                </span>
                {activeGuide.officialPortals.map((portal) => (
                  <a
                    key={portal.url + portal.label}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-agent-id={`official-portal-link-${portal.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    data-testid={`official-portal-link-${portal.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    aria-label={`Open official Cambodian portal ${portal.label}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-[#0F2557] dark:text-amber-300 hover:border-amber-500 transition-all shadow-sm"
                  >
                    <span>{portal.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-75" />
                  </a>
                ))}
              </div>
            </header>

            {/* Main Content Grid: Checklist + Fast Actions */}
            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Document Checklist */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-amber-600" />
                      Required Documents (Click to check off)
                    </h4>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                      {completedDocs}/{totalDocs} ({completionPct}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {activeGuide.documentsNeeded.map((doc, idx) => {
                    const checkKey = `${activeGuide.id}-doc-${idx}`;
                    const isChecked = !!checkedItems[checkKey];
                    return (
                      <div
                        key={checkKey}
                        onClick={() => toggleCheck(checkKey)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleCheck(checkKey);
                          }
                        }}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        data-agent-id={`guide-doc-checkbox-${activeGuide.slug}-${idx}`}
                        data-testid={`guide-doc-checkbox-${activeGuide.slug}-${idx}`}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {doc.emoji} {doc.item}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                doc.mandatory
                                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {doc.mandatory ? 'Mandatory' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                            {doc.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Turnkey Booking & Accordion Step Details */}
              <div className="lg:col-span-5 space-y-4">
                {/* 💸 Cost & Agent Turnkey Box */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0F2557] to-[#1E3A8A] text-white p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-amber-300">
                      💸 Cost &amp; Agent Fast-Track
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/10">
                      <span className="block text-slate-300 font-bold">Official Fee:</span>
                      <span className="font-extrabold text-amber-300">
                        {activeGuide.costBreakdown.officialFee}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-300/30">
                      <span className="block text-amber-200 font-bold">Agent Rate:</span>
                      <span className="font-extrabold text-white">
                        {activeGuide.costBreakdown.agentAssistedFee}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onJumpToAgents}
                    data-agent-id={`book-agent-from-guide-${activeGuide.slug}`}
                    data-testid={`book-agent-from-guide-${activeGuide.slug}`}
                    aria-label={`Book a verified Cambodia agent for ${activeGuide.title}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-md"
                  >
                    🤝 Hire Verified Agent for This Service →
                  </button>
                </div>

                {/* Collapsible Accordion: 5-Step Process */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowProcessSteps(!showProcessSteps)}
                    className="w-full p-3 text-left font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>🔁 Step-by-Step Procedure ({activeGuide.processSteps.length} Steps)</span>
                    {showProcessSteps ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {showProcessSteps && (
                    <ol className="p-3 pt-0 space-y-2 border-t border-slate-200 dark:border-slate-800">
                      {activeGuide.processSteps.map((step) => (
                        <li
                          key={step.stepNumber}
                          className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#0F2557] text-amber-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {step.stepNumber}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {step.emoji} {step.title}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                              {step.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* Collapsible Accordion: Where to Apply */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowWhereToApply(!showWhereToApply)}
                    className="w-full p-3 text-left font-extrabold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      🏢 Where to Apply: {activeGuide.whereToApply.title}
                    </span>
                    {showWhereToApply ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {showWhereToApply && (
                    <div className="p-3 pt-0 space-y-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <ul className="space-y-1">
                        {activeGuide.whereToApply.locations.map((loc, i) => (
                          <li key={i} className="text-slate-700 dark:text-slate-300">
                            • {loc}
                          </li>
                        ))}
                      </ul>
                      <div className="p-2 rounded-lg bg-amber-500/15 text-[11px] font-semibold text-amber-950 dark:text-amber-200">
                        {activeGuide.whereToApply.proTip}
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Accordion: Expat Pro Tips */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBonusTips(!showBonusTips)}
                    className="w-full p-3 text-left font-extrabold text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <span>💡 Expat Pro Tips ({activeGuide.bonusTips.length})</span>
                    {showBonusTips ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                  {showBonusTips && (
                    <ul className="p-3 pt-0 space-y-1 border-t border-emerald-500/20 text-xs">
                      {activeGuide.bonusTips.map((tip, i) => (
                        <li key={i} className="text-emerald-950 dark:text-emerald-200 text-[11px]">
                          ✓ {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Subview 2: Cambodia Visa Matrix */}
      {hubTab === 'matrix' && (
        <div className="space-y-4" id="visas">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                🇰🇭 Visa Classification
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Cambodia Visa &amp; Extension Matrix (T, E, EB, ER, ES, CM2H)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agent-assisted prices in US dollars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMBODIA_VISA_MATRIX.map((visa) => (
              <article
                key={visa.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0F2557] text-amber-300 font-extrabold text-xs">
                      {visa.code}
                    </span>
                    <PriceBadge priceUsd={visa.agentAssistedUsd} idPrefix={`visa-card-${visa.id}`} />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {visa.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Best for:</strong> {visa.targetAudience}
                  </p>
                  <div className="text-[11px] space-y-0.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                    <div>
                      <strong>Duration:</strong> {visa.initialStay}
                    </div>
                    <div>
                      <strong>Renewal:</strong> {visa.extensionOptions}
                    </div>
                    <div>
                      <strong>Work Rights:</strong> {visa.workAllowed}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={visa.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-agent-id={`visa-matrix-portal-${visa.id}`}
                    data-testid={`visa-matrix-portal-${visa.id}`}
                    aria-label={`Official government portal for ${visa.name}`}
                    className="text-xs font-bold text-[#0F2557] dark:text-amber-300 hover:underline inline-flex items-center gap-1"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={onJumpToAgents}
                    data-agent-id={`visa-matrix-agent-btn-${visa.id}`}
                    data-testid={`visa-matrix-agent-btn-${visa.id}`}
                    aria-label={`Apply for ${visa.name} with verified agent`}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-900 dark:text-amber-300 hover:text-slate-950 text-xs font-extrabold transition-colors"
                  >
                    Apply via Agent →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Subview 3: Official Cambodian Websites Directory */}
      {hubTab === 'directory' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2.5">
            <Landmark className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Official Royal Government of Cambodia (.gov.kh) Portals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified primary government sources for visa, tax, banking &amp; company incorporation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OFFICIAL_CAMBODIA_PORTALS.map((portal) => (
              <a
                key={portal.url}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                data-agent-id={`gov-kh-directory-${portal.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                data-testid={`gov-kh-directory-${portal.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                aria-label={`Visit official Cambodian website ${portal.name}`}
                className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300">
                      {portal.badge}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {portal.name}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
                    {portal.purpose}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-blue-700 dark:text-amber-300 truncate pt-1">
                  {portal.url}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
