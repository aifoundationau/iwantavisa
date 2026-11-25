import React from 'react';
import { CheckCircle2, Clock, MapPin, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { AGENT_SERVICE_CATEGORY_META, MERCHANT_CITY_STAMP_CODES } from '../data/cambodiaData';
import { buildAgentServiceShareUrl } from '../lib/share';
import { AgentServicePromotion } from '../types/contracts';
import { PostcardAddress, PostcardFrame, postcardLayout, PostcardStamps } from './PostcardFrame';
import { RatingBadge } from './StarRating';

interface AgentServicePostcardProps {
  service: AgentServicePromotion;
  /** Keeps element IDs unique when one service renders twice (grid + dialog, spotlight, preview). */
  idPrefix?: string;
  /** A card in the 2-up grid: compact face below lg, full postcard from lg up. */
  compact?: boolean;
  /** Tapping the front opens the full postcard (photos, deliverables, contact, share links). */
  onOpen?: (service: AgentServicePromotion) => void;
  /** Request the service / message the agent. */
  onMessage?: (service: AgentServicePromotion) => void;
}

/** A verified agent's service as a postcard: price sticker, photos, deliverables and contact. */
export const AgentServicePostcard: React.FC<AgentServicePostcardProps> = ({
  service,
  idPrefix = service.id,
  compact = false,
  onOpen,
  onMessage,
}) => {
  const L = postcardLayout(compact);
  const meta = AGENT_SERVICE_CATEGORY_META[service.category];
  const price = `$${Math.round(service.priceUsd).toLocaleString('en-US')}`;

  return (
    <PostcardFrame
      testId={`agent-service-postcard-${idPrefix}`}
      idPrefix={idPrefix}
      headlineId={`agent-headline-${idPrefix}`}
      compact={compact}
      photos={service.imageUrls ?? []}
      photoAlt={`${service.serviceTitle} — ${service.agencyTitle}`}
      art={{ emoji: service.avatarEmoji, place: service.city }}
      chip={{ emoji: meta.emoji, label: meta.label }}
      sticker={{ text: price, testId: `price-badge-agent-srv-${idPrefix}` }}
      open={
        onOpen && {
          onOpen: () => onOpen(service),
          label: `Open postcard: ${service.serviceTitle} — ${service.agentName}`,
          testId: `agent-open-btn-${idPrefix}`,
        }
      }
      kicker="✈️ Par Avion • Agent Service"
      headline={service.serviceTitle}
      byline={`${service.agentName} · ${service.city}`}
      message={
        <>
          <p className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${L.wideOnly}`}>
            {service.description}
          </p>
          {service.deliverables.length > 0 && (
            <ul aria-label="What's included" className={`space-y-1 pt-0.5 ${L.wideOnly}`}>
              {service.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-px"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <p
            className={`items-center gap-1 pt-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 ${L.wideOnlyFlex}`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            Turnaround: {service.turnaroundDays}
          </p>
        </>
      }
      address={
        <>
          <PostcardStamps
            postmarkLabel={`${MERCHANT_CITY_STAMP_CODES[service.city]} • KH`}
            postedAt={service.createdAt}
            stampEmoji={service.avatarEmoji}
            stampCode={service.verifiedLicenseNo}
          />
          <PostcardAddress
            heading="From the agent"
            name={service.agentName}
            lines={[
              { text: service.agencyTitle },
              {
                icon: <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-px" aria-hidden="true" />,
                text: `${service.sangkatDistrict}, ${service.city}`,
              },
              {
                icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-px" aria-hidden="true" />,
                text: `Verified license ${service.verifiedLicenseNo}`,
              },
              {
                icon: <Send className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />,
                text: `${service.contactTelegram} · ${service.contactPhoneKh}`,
                mono: true,
              },
            ]}
          />
        </>
      }
      actions={
        <>
          <span
            data-testid={`agent-rating-${idPrefix}`}
            className={`text-[10px] sm:text-[11px] ${compact ? 'mr-auto lg:mr-0' : ''}`}
          >
            <RatingBadge summary={{ average: service.rating, count: service.reviewCount }} shortBelowLg={compact} />
          </span>
          {onMessage && (
            <button
              type="button"
              onClick={() => onMessage(service)}
              aria-label={`Request ${service.serviceTitle} from ${service.agentName}`}
              title={`Request service from ${service.agentName}`}
              data-agent-id={`message-agent-service-btn-${idPrefix}`}
              data-testid={`message-agent-service-btn-${idPrefix}`}
              className={`inline-flex items-center rounded-lg bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 text-[11px] font-extrabold hover:opacity-95 ${L.messageBtn}`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className={L.messageWord}>Request service</span>
            </button>
          )}
        </>
      }
      share={{
        url: buildAgentServiceShareUrl(service.id),
        title: `${service.serviceTitle} — ${service.agencyTitle}`,
        text: `📮 ${service.serviceTitle} (${price}) with ${service.agentName}, ${service.city} 🇰🇭 via I Want A Visa Cambodia`,
      }}
      compactShareTestId={`agent-compact-share-btn-${idPrefix}`}
    />
  );
};
