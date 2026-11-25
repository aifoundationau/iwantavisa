import React, { useState } from 'react';
import {
  Cpu,
  Rocket,
  Users,
  ExternalLink,
  CheckCircle2,
  Send,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { COMMUNITY_CATEGORY_EMOJI, TECH_TRANSFORMATION_PILLARS } from '../data/cambodiaData';
import { generateUniqueId } from '../lib/merchants';
import {
  COMMUNITY_POST_CATEGORIES,
  CommunityPostCategory,
  CommunityPostFormSchema,
  TechCommunityPost,
  TechServiceInquiry,
  TechServiceInquirySchema,
} from '../types/contracts';
import { CommunityPostcard } from './CommunityPostcard';
import { PhotosUploadField } from './PhotosUploadField';
import { PostcardDialog } from './PostcardDialog';
import { PostcardGrid } from './PostcardGrid';
import { PriceBadge } from './PriceBadge';
import { SharedPostcardSpotlight } from './SharedPostcardSpotlight';

interface DigitalTechCommunityHubProps {
  communityPosts: TechCommunityPost[];
  onToggleRsvp: (postId: string) => void;
  onCreateCommunityPost: (post: TechCommunityPost) => void;
  onSubmitTechInquiry: (inquiry: TechServiceInquiry) => void;
  submittedInquiriesCount: number;
  /** Community post opened from a shared link (?post=COMM-…), pinned at the top. */
  sharedPostId: string | null;
  onDismissSharedPost: () => void;
}

export const DigitalTechCommunityHub: React.FC<DigitalTechCommunityHubProps> = ({
  communityPosts,
  onToggleRsvp,
  onCreateCommunityPost,
  onSubmitTechInquiry,
  submittedInquiriesCount,
  sharedPostId,
  onDismissSharedPost,
}) => {
  // Tech Entrepreneur Inquiry State
  const [founderName, setFounderName] = useState('');
  const [companyOrStartup, setCompanyOrStartup] = useState('');
  const [email, setEmail] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [serviceStream, setServiceStream] = useState(
    'CamDX Single-Window Company Registration'
  );
  const [teamSize, setTeamSize] = useState('2-10 Staff');
  const [projectBrief, setProjectBrief] = useState('');
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySubmittedMsg, setInquirySubmittedMsg] = useState<string | null>(null);

  // Community Post Creator State
  const [showPostForm, setShowPostForm] = useState(false);
  const [postAuthor, setPostAuthor] = useState('');
  const [postRole, setPostRole] = useState('');
  const [postHub, setPostHub] = useState('BKK1 Innovation Hub, Phnom Penh');
  const [postCategory, setPostCategory] = useState<CommunityPostCategory>('Meetup & Hackathon');
  const [postTitle, setPostTitle] = useState('');
  const [postSummary, setPostSummary] = useState('');
  const [postDate, setPostDate] = useState('Friday, Nov 27, 2026 • 6:00 PM ICT');
  // Up to 6 photos, uploaded to imgbb (16:9) by the photo field; the first is the cover.
  const [postPhotos, setPostPhotos] = useState<string[]>([]);
  const [postError, setPostError] = useState<string | null>(null);
  const [openedPostId, setOpenedPostId] = useState<string | null>(null);

  const findPost = (id: string | null) => (id ? communityPosts.find((p) => p.id === id) ?? null : null);
  const sharedPost = findPost(sharedPostId);
  const openedPost = findPost(openedPostId);
  // The shared postcard is pinned at the top, so don't repeat it on the board.
  const boardPosts = sharedPost ? communityPosts.filter((p) => p.id !== sharedPost.id) : communityPosts;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);
    setInquirySubmittedMsg(null);

    const parsed = TechServiceInquirySchema.safeParse({
      founderName,
      companyOrStartup,
      email,
      telegramHandle,
      serviceStream,
      teamSize,
      projectBrief,
    });

    if (!parsed.success) {
      setInquiryError(
        parsed.error.issues[0]?.message || 'Please complete all required fields.'
      );
      return;
    }

    const newInquiry: TechServiceInquiry = {
      id: `TECH-${Math.floor(10000 + Math.random() * 90000)}`,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    onSubmitTechInquiry(newInquiry);
    setInquirySubmittedMsg(
      `Thank you, ${founderName}! Your Digital Transformation & Tech Entrepreneur inquiry (${newInquiry.id}) has been logged for our Phnom Penh Tech Advisory Desk.`
    );
    setFounderName('');
    setCompanyOrStartup('');
    setEmail('');
    setTelegramHandle('');
    setProjectBrief('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);

    const parsed = CommunityPostFormSchema.safeParse({
      authorName: postAuthor,
      authorRole: postRole,
      hubLocation: postHub,
      category: postCategory,
      title: postTitle,
      summary: postSummary,
      eventDate: postDate,
      imageUrls: postPhotos,
    });
    if (!parsed.success) {
      setPostError(parsed.error.issues[0]?.message || 'Please check your post.');
      return;
    }

    const { imageUrls, ...fields } = parsed.data;
    const newPost: TechCommunityPost = {
      id: generateUniqueId('COMM', communityPosts.map((p) => p.id)),
      ...fields,
      avatarEmoji: COMMUNITY_CATEGORY_EMOJI[fields.category],
      attendeesCount: 1,
      rsvpJoined: true,
      createdAt: new Date().toISOString(),
      ...(imageUrls.length > 0 ? { imageUrls } : {}),
    };

    onCreateCommunityPost(newPost);
    setPostAuthor('');
    setPostRole('');
    setPostTitle('');
    setPostSummary('');
    setPostPhotos([]);
    setShowPostForm(false);
  };

  return (
    <section className="space-y-12" aria-labelledby="digital-transformation-heading">
      {/* Pinned community postcard from a shared link */}
      {sharedPostId && (
        <SharedPostcardSpotlight
          idBase="shared-post"
          heading={sharedPost ? `A postcard from ${sharedPost.authorName}` : 'This community post is no longer available'}
          missingHint={sharedPost ? undefined : 'It may have been taken down — see the latest posts on the community board below.'}
          dismissLabel="Dismiss shared community post"
          onDismiss={onDismissSharedPost}
          scrollKey={sharedPostId}
        >
          {sharedPost && (
            <CommunityPostcard post={sharedPost} idPrefix={`shared-${sharedPost.id}`} onToggleRsvp={onToggleRsvp} />
          )}
        </SharedPostcardSpotlight>
      )}

      {/* Hero Banner for Tech Entrepreneurs & Digital Transformation */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#0F2557] to-[#1E3A8A] text-white p-6 sm:p-10 shadow-2xl border border-amber-400/40">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 text-xs font-extrabold text-amber-300">
            <Cpu className="w-4 h-4" />
            Cambodia Digital Economy &amp; Society Framework (2021–2035) • CamDX • Bakong • Techo Startup Center
          </div>
          <h2
            id="digital-transformation-heading"
            className="text-2xl sm:text-4xl font-extrabold tracking-tight"
          >
            Digital Transformation, Tech Entrepreneur Advisory &amp; KhmerTech Community 🇰🇭🚀
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Cambodia allows <strong className="text-amber-300">100% foreign ownership</strong> of technology companies via{' '}
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">registrationservices.gov.kh (CamDX)</code>, operates a USD-denominated economy with nationwide{' '}
            <strong className="text-amber-300">NBC Bakong KHQR</strong> blockchain rails, and offers up to{' '}
            <strong className="text-amber-300">9-year Corporate Tax Holidays (CDC QIP)</strong>. Ask about our digital transformation services or join our Phnom Penh &amp; Siem Reap tech community below!
          </p>
        </div>
      </div>

      {/* 4 Digital Transformation & Tech Entrepreneur Service Pillars */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Enterprise &amp; Startup Solutions
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Digital Transformation &amp; Tech Founder Services in Cambodia
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Advisory rates in US dollars
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECH_TRANSFORMATION_PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl">{pillar.iconEmoji}</span>
                  <PriceBadge priceUsd={pillar.priceUsd} idPrefix={`tech-pillar-${pillar.id}`} />
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-xs font-khmer text-amber-700 dark:text-amber-400 mt-0.5">
                    {pillar.khmerTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>

                <ul className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl">
                  {pillar.deliverables.map((deliv, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={pillar.officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-agent-id={`tech-pillar-portal-${pillar.id}`}
                  data-testid={`tech-pillar-portal-${pillar.id}`}
                  aria-label={`Visit official portal for ${pillar.title}`}
                  className="text-xs font-bold text-[#0F2557] dark:text-amber-300 hover:underline inline-flex items-center gap-1"
                >
                  {pillar.governmentFramework} <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="#ask-tech-services-form"
                  onClick={() => setServiceStream(pillar.title)}
                  data-agent-id={`select-tech-pillar-btn-${pillar.id}`}
                  data-testid={`select-tech-pillar-btn-${pillar.id}`}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-900 dark:text-amber-300 hover:text-slate-950 text-xs font-extrabold transition-colors"
                >
                  Ask About This →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Interactive "Ask About Digital Transformation & Tech Services" Consultation Desk */}
      <div
        id="ask-tech-services-form"
        className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-800 dark:text-amber-300">
            <Rocket className="w-3.5 h-3.5" />
            Tech Entrepreneurs &amp; Enterprise Desk
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Ask About Digital Transformation &amp; Cambodia Tech Services
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether you are relocating a SaaS startup to Phnom Penh, registering a 100% foreign-owned entity on{' '}
            <strong>CamDX</strong>, integrating <strong>NBC Bakong KHQR</strong>, or deploying bilingual Khmer-English AI agents, our advisory team connects you with vetted technical architects and corporate lawyers.
          </p>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-extrabold text-slate-900 dark:text-white">
              🇰🇭 Why Tech Founders Choose Cambodia:
            </div>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li>• <strong>100% Foreign Ownership</strong> (No local nominee required)</li>
              <li>• <strong>USD Economy</strong> + Instant Bakong KHQR API rails</li>
              <li>• <strong>1-Year Multiple-Entry EB Visas</strong> + fast FWCMS quotas</li>
              <li>• <strong>Young, English-speaking</strong> university tech talent pool</li>
            </ul>
            <div className="pt-2 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              Active Founder Inquiries Logged: {submittedInquiriesCount}
            </div>
          </div>
        </div>

        <form onSubmit={handleInquirySubmit} className="lg:col-span-7 space-y-4">
          {inquirySubmittedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{inquirySubmittedMsg}</span>
            </div>
          )}

          {inquiryError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
              {inquiryError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Founder / Executive Name *
              </label>
              <input
                type="text"
                required
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="e.g., Sarah Chen"
                data-agent-id="tech-inquiry-founder-name"
                data-testid="tech-inquiry-founder-name"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Startup Name *
              </label>
              <input
                type="text"
                required
                value={companyOrStartup}
                onChange={(e) => setCompanyOrStartup(e.target.value)}
                placeholder="e.g., AngkorCloud AI Labs"
                data-agent-id="tech-inquiry-company-name"
                data-testid="tech-inquiry-company-name"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.io"
                data-agent-id="tech-inquiry-email"
                data-testid="tech-inquiry-email"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telegram Handle or WhatsApp *
              </label>
              <input
                type="text"
                required
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@FounderSarahKH"
                data-agent-id="tech-inquiry-telegram"
                data-testid="tech-inquiry-telegram"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Service Stream Required *
              </label>
              <select
                value={serviceStream}
                onChange={(e) => setServiceStream(e.target.value)}
                data-agent-id="tech-inquiry-service-select"
                data-testid="tech-inquiry-service-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="CamDX Single-Window Company Registration">
                  CamDX Single-Window Company Registration
                </option>
                <option value="NBC Bakong / KHQR Fintech API Integration">
                  NBC Bakong / KHQR Fintech API Integration
                </option>
                <option value="AI & Cloud Enterprise Digital Transformation">
                  AI &amp; Cloud Enterprise Digital Transformation
                </option>
                <option value="MLVT Foreign Quota & Tech Team Work Permits (FWCMS)">
                  MLVT Foreign Quota &amp; Tech Team Work Permits (FWCMS)
                </option>
                <option value="CDC Qualified Investment Project (QIP) Tax Holiday">
                  CDC Qualified Investment Project (QIP) Tax Holiday
                </option>
                <option value="Techo Startup Center & Venture Ecosystem Advisory">
                  Techo Startup Center &amp; Venture Ecosystem Advisory
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current / Planned Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                data-agent-id="tech-inquiry-teamsize-select"
                data-testid="tech-inquiry-teamsize-select"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                <option value="Solo Founder">Solo Founder / Digital Nomad</option>
                <option value="2-10 Staff">2–10 Seed Team</option>
                <option value="11-50 Staff">11–50 Growth Startup</option>
                <option value="50+ Enterprise">50+ Enterprise Transformation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Brief / Questions for Our Cambodia Digital Transformation Desk *
            </label>
            <textarea
              rows={3}
              required
              value={projectBrief}
              onChange={(e) => setProjectBrief(e.target.value)}
              placeholder="Tell us about your software product, CamDX incorporation timeline, Bakong KHQR integration needs, or AI automation goals..."
              data-agent-id="tech-inquiry-brief-textarea"
              data-testid="tech-inquiry-brief-textarea"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            />
          </div>

          <button
            type="submit"
            data-agent-id="submit-tech-service-inquiry-btn"
            data-testid="submit-tech-service-inquiry-btn"
            className="w-full py-3 px-5 rounded-xl bg-[#0F2557] hover:bg-[#17357A] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
            Submit Digital Transformation &amp; Tech Inquiry
          </button>
        </form>
      </div>

      {/* Cambodia Tech Community Hub (KhmerTech Builders) */}
      <div id="community" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Users className="w-4 h-4" />
              Phnom Penh • Siem Reap • Kampot Developer &amp; Founder Network
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Cambodia Tech Community Board (KhmerTech Builders) 🤝⚡
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Connect with local Khmer software engineers, international startup founders, AI builders, and digital nomads. Every post is a shareable postcard with photos — RSVP to upcoming meetups or post your own!
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowPostForm(!showPostForm);
              setPostError(null);
            }}
            data-agent-id="toggle-community-post-form-btn"
            data-testid="toggle-community-post-form-btn"
            aria-expanded={showPostForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-3 shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            {showPostForm ? 'Close Post Form' : '+ Post Meetup / Topic to Community'}
          </button>
        </div>

        {/* Create New Community Post Form */}
        {showPostForm && (
          <form
            onSubmit={handleCreatePost}
            className="rounded-3xl bg-emerald-50/70 dark:bg-slate-900 border-2 border-emerald-500/40 p-6 space-y-4 shadow-lg"
          >
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Share a Meetup, Hackathon, or Founder Question with the Cambodia Tech Community
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={postAuthor}
                onChange={(e) => setPostAuthor(e.target.value)}
                placeholder="Your Name *"
                aria-label="Your name"
                data-agent-id="community-post-author"
                data-testid="community-post-author"
                className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
              <input
                type="text"
                value={postRole}
                onChange={(e) => setPostRole(e.target.value)}
                placeholder="Your Role (e.g., Full-Stack Dev @ BKK1)"
                aria-label="Your role"
                data-agent-id="community-post-role"
                data-testid="community-post-role"
                className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as CommunityPostCategory)}
                aria-label="Category"
                data-agent-id="community-post-category"
                data-testid="community-post-category"
                className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                {COMMUNITY_POST_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {COMMUNITY_CATEGORY_EMOJI[category]} {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Event or Discussion Title *"
                aria-label="Event or discussion title"
                data-agent-id="community-post-title"
                data-testid="community-post-title"
                className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={postHub}
                  onChange={(e) => setPostHub(e.target.value)}
                  placeholder="Hub / Location"
                  aria-label="Hub or location"
                  data-agent-id="community-post-hub"
                  data-testid="community-post-hub"
                  className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  placeholder="Date & Time"
                  aria-label="Date and time"
                  data-agent-id="community-post-date"
                  data-testid="community-post-date"
                  className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            <textarea
              rows={2}
              required
              value={postSummary}
              onChange={(e) => setPostSummary(e.target.value)}
              placeholder="Describe the tech topic, stack, or meetup details *"
              aria-label="Description"
              data-agent-id="community-post-summary"
              data-testid="community-post-summary"
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            />

            <PhotosUploadField
              value={postPhotos}
              onChange={setPostPhotos}
              uploadName={`community ${postTitle || postHub}`}
              idPrefix="community-post-photos"
              label="Photos (optional)"
              hint="The first photo is the cover on the board. No photos? Your postcard gets an illustrated “Greetings from …” front."
            />

            {postError && (
              <div
                role="alert"
                data-testid="community-post-error"
                className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg"
              >
                {postError}
              </div>
            )}

            <button
              type="submit"
              data-agent-id="publish-community-post-btn"
              data-testid="publish-community-post-btn"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-md"
            >
              Publish to Cambodia Tech Community
            </button>
          </form>
        )}

        {/* Community postcards: 2 per row on every screen, 3 rows at a time, then More */}
        {boardPosts.length > 0 && (
          <PostcardGrid
            items={boardPosts}
            getKey={(post) => post.id}
            resetKey={sharedPost?.id ?? ''}
            testId="community-posts-grid"
            ariaLabel="Community postcards"
            noun="posts"
            renderItem={(post) => (
              <CommunityPostcard
                post={post}
                compact
                onOpen={(p) => setOpenedPostId(p.id)}
                onToggleRsvp={onToggleRsvp}
              />
            )}
          />
        )}
      </div>

      {/* The full postcard, opened from a compact card */}
      {openedPost && (
        <PostcardDialog
          titleId={`community-headline-open-${openedPost.id}`}
          testId="community-post-dialog"
          closeTestId="close-community-post-dialog-btn"
          onClose={() => setOpenedPostId(null)}
        >
          <CommunityPostcard post={openedPost} idPrefix={`open-${openedPost.id}`} onToggleRsvp={onToggleRsvp} />
        </PostcardDialog>
      )}
    </section>
  );
};
