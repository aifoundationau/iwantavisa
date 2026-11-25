# Data Contracts (`data-contracts.MD`) — I Want A Visa Cambodia (`www.iwantavisa.com`)

All UI, API, Admin Panel, and Agent inputs adhere to strict JSON/Zod schemas with `additionalProperties: false`, regex validation, input sanitization, integer-only token economy rules (`Math.round`), and Australian Privacy Act 1988 (APP) & Kingdom of Cambodia Law on Electronic Commerce compliance.

---

## 1. Agent Service Promotion Contract (`agentServices/{serviceId}`)

Used by verified visa, banking, Sangkat/FPCS, MPWT driver's license, and corporate registration agents to promote services, and managed via the Admin Panel.

- **Every agent service is a postcard** (see the display rules under section 7): the price is the sticker on the front, the back carries the description, what's included, turnaround, the agent's address and verified license.
- **Photos:** `imageUrls` holds up to **6** photos, cover first — each cropped to 16:9 and uploaded to imgbb from the Admin Panel. No photos = an illustrated "Greetings from {city}" front.
- **Share links** open the postcard back in the web app, pinned above the grid: `https://www.iwantavisa.com/?agent={id}`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AgentServicePromotion",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "agentName",
    "agencyTitle",
    "category",
    "serviceTitle",
    "description",
    "deliverables",
    "turnaroundDays",
    "tokenCost",
    "priceUsd",
    "priceAud",
    "city",
    "sangkatDistrict",
    "verifiedLicenseNo",
    "contactTelegram",
    "contactPhoneKh",
    "rating",
    "reviewCount",
    "isLockedFromCsv"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^AGT-[A-Z0-9-]{3,32}$"
    },
    "agentName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80,
      "pattern": "^[A-Za-z0-9 .,()-]+$"
    },
    "agencyTitle": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "category": {
      "type": "string",
      "enum": [
        "visa_extensions",
        "sangkat_fpcs",
        "bank_account",
        "driver_license_mpwt",
        "condo_relocation",
        "camdx_incorporation",
        "work_permit_fwcms"
      ]
    },
    "serviceTitle": {
      "type": "string",
      "minLength": 5,
      "maxLength": 120
    },
    "description": {
      "type": "string",
      "minLength": 10,
      "maxLength": 800
    },
    "deliverables": {
      "type": "array",
      "minItems": 1,
      "maxItems": 8,
      "items": {
        "type": "string",
        "minLength": 2,
        "maxLength": 120
      }
    },
    "turnaroundDays": {
      "type": "string",
      "minLength": 2,
      "maxLength": 40
    },
    "tokenCost": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100000,
      "description": "Strict integer only (Math.round, no decimals)"
    },
    "priceUsd": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50000
    },
    "priceAud": {
      "type": "integer",
      "minimum": 1,
      "maximum": 80000
    },
    "city": {
      "type": "string",
      "enum": ["Phnom Penh", "Siem Reap", "Sihanoukville", "Kampot", "Battambang"]
    },
    "sangkatDistrict": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80
    },
    "verifiedLicenseNo": {
      "type": "string",
      "pattern": "^KH-[A-Z]{2,6}-[0-9]{4,8}$"
    },
    "contactTelegram": {
      "type": "string",
      "pattern": "^@[A-Za-z0-9_]{4,32}$"
    },
    "contactPhoneKh": {
      "type": "string",
      "maxLength": 16,
      "pattern": "^(\\+855 ?|0)[1-9][0-9 ]{7,11}$",
      "description": "e.g. \"+855 12 990 112\", \"+85512990112\" or \"012 990 112\""
    },
    "rating": {
      "type": "number",
      "minimum": 1,
      "maximum": 5
    },
    "reviewCount": {
      "type": "integer",
      "minimum": 0
    },
    "isLockedFromCsv": {
      "type": "boolean"
    },
    "imageUrls": {
      "type": "array",
      "maxItems": 6,
      "uniqueItems": true,
      "items": { "type": "string", "format": "uri", "pattern": "^https://i\\.ibb\\.co/.+", "maxLength": 2048 },
      "description": "Optional postcard photos, cover first; each uploaded to imgbb (never stored on our server) after a 16:9 centre crop (max 1600×900 JPEG, EXIF/GPS stripped)"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "When the service was posted — the postcard's postmark"
    }
  }
}
```

---

## 2. Cambodia Rental Gallery Listing Contract (`rentalListings/{rentalId}`)

Posted via the Admin Panel and displayed in the Rentals Gallery with interactive Message Agent Postcards.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CambodiaRentalListing",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "title",
    "propertyType",
    "city",
    "sangkat",
    "priceUsdMonthly",
    "priceAudMonthly",
    "tokenDeposit",
    "bedrooms",
    "bathrooms",
    "areaSqm",
    "fpcsGuaranteed",
    "sangkatCertAssisted",
    "edcRateKhr",
    "imageUrl",
    "badgeText",
    "amenities",
    "agentName",
    "agentAgency",
    "agentTelegram",
    "postcardStampCode"
  ],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^RNT-[A-Z0-9-]{3,32}$"
    },
    "title": {
      "type": "string",
      "minLength": 5,
      "maxLength": 120
    },
    "propertyType": {
      "type": "string",
      "enum": ["Condo", "Serviced Apartment", "Pool Villa", "Shophouse Loft", "Riverside Studio"]
    },
    "city": {
      "type": "string",
      "enum": ["Phnom Penh", "Siem Reap", "Sihanoukville", "Kampot", "Koh Rong"]
    },
    "sangkat": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80
    },
    "priceUsdMonthly": {
      "type": "integer",
      "minimum": 100,
      "maximum": 25000
    },
    "priceAudMonthly": {
      "type": "integer",
      "minimum": 150,
      "maximum": 40000
    },
    "tokenDeposit": {
      "type": "integer",
      "minimum": 10,
      "maximum": 100000,
      "description": "Strict integer token value (Math.round)"
    },
    "bedrooms": {
      "type": "integer",
      "minimum": 0,
      "maximum": 12
    },
    "bathrooms": {
      "type": "integer",
      "minimum": 1,
      "maximum": 12
    },
    "areaSqm": {
      "type": "integer",
      "minimum": 18,
      "maximum": 2000
    },
    "fpcsGuaranteed": {
      "type": "boolean"
    },
    "sangkatCertAssisted": {
      "type": "boolean"
    },
    "edcRateKhr": {
      "type": "string",
      "maxLength": 40
    },
    "imageUrl": {
      "type": "string",
      "format": "uri"
    },
    "badgeText": {
      "type": "string",
      "maxLength": 50
    },
    "amenities": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 50
      }
    },
    "agentName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80
    },
    "agentAgency": {
      "type": "string",
      "minLength": 2,
      "maxLength": 80
    },
    "agentTelegram": {
      "type": "string",
      "pattern": "^@[A-Za-z0-9_]{4,32}$"
    },
    "postcardStampCode": {
      "type": "string",
      "pattern": "^KH-[A-Z0-9-]{3,16}$"
    }
  }
}
```

---

## 3. Rental Message Agent Postcard Inquiry Contract (`postcardMessages/{messageId}`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RentalPostcardMessage",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "rentalId",
    "rentalTitle",
    "recipientAgent",
    "senderName",
    "senderEmail",
    "telegramOrWhatsApp",
    "currentVisaType",
    "moveInDate",
    "leaseDurationMonths",
    "needsFpcsAndSangkat",
    "message",
    "createdAt"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^PCARD-[0-9]{4,12}$" },
    "rentalId": { "type": "string" },
    "rentalTitle": { "type": "string", "maxLength": 120 },
    "recipientAgent": { "type": "string", "maxLength": 80 },
    "senderName": { "type": "string", "minLength": 2, "maxLength": 80 },
    "senderEmail": { "type": "string", "format": "email", "maxLength": 120 },
    "telegramOrWhatsApp": { "type": "string", "minLength": 3, "maxLength": 40 },
    "currentVisaType": {
      "type": "string",
      "enum": ["Visa E (Ordinary)", "EB (Business/Work)", "ER (Retirement)", "CM2H (10-Yr Golden Visa)", "Tourist (T) / Arriving Soon"]
    },
    "moveInDate": { "type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" },
    "leaseDurationMonths": { "type": "integer", "minimum": 1, "maximum": 60 },
    "needsFpcsAndSangkat": { "type": "boolean" },
    "message": { "type": "string", "minLength": 5, "maxLength": 600 },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## 4. Digital Transformation & Tech Entrepreneur Service Inquiry Contract (`techServiceInquiries/{inquiryId}`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TechServiceInquiry",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "founderName",
    "companyOrStartup",
    "email",
    "telegramHandle",
    "serviceStream",
    "teamSize",
    "projectBrief",
    "createdAt"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^TECH-[0-9]{4,12}$" },
    "founderName": { "type": "string", "minLength": 2, "maxLength": 80 },
    "companyOrStartup": { "type": "string", "minLength": 2, "maxLength": 100 },
    "email": { "type": "string", "format": "email", "maxLength": 120 },
    "telegramHandle": { "type": "string", "minLength": 2, "maxLength": 40 },
    "serviceStream": {
      "type": "string",
      "enum": [
        "CamDX Single-Window Company Registration",
        "NBC Bakong / KHQR Fintech API Integration",
        "AI & Cloud Enterprise Digital Transformation",
        "MLVT Foreign Quota & Tech Team Work Permits (FWCMS)",
        "CDC Qualified Investment Project (QIP) Tax Holiday",
        "Techo Startup Center & Venture Ecosystem Advisory"
      ]
    },
    "teamSize": { "type": "string", "enum": ["Solo Founder", "2-10 Staff", "11-50 Staff", "50+ Enterprise"] },
    "projectBrief": { "type": "string", "minLength": 10, "maxLength": 1000 },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## 5. Cambodia Tech Community Post & Event Contract (`communityPosts/{postId}`)

- **Every community post is a postcard** (see the display rules under section 7): the event day ("NOV 12", read from `eventDate`) is the sticker; RSVP sits on the card.
- **Photos:** `imageUrls` holds up to **6** photos, cover first — cropped to 16:9 and uploaded to imgbb from the post form. No photos = an illustrated "Greetings from {city named in hubLocation}" front.
- **Share links** open the postcard back in the web app, pinned at the top of the Tech Community: `https://www.iwantavisa.com/?post={id}`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TechCommunityPost",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "authorName",
    "authorRole",
    "hubLocation",
    "category",
    "title",
    "summary",
    "eventDate",
    "attendeesCount",
    "createdAt"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^COMM-[0-9A-Z-]{3,20}$" },
    "authorName": { "type": "string", "minLength": 2, "maxLength": 80 },
    "authorRole": { "type": "string", "minLength": 2, "maxLength": 80 },
    "hubLocation": { "type": "string", "maxLength": 80 },
    "category": {
      "type": "string",
      "enum": ["Meetup & Hackathon", "Founder Q&A", "AI & DevOps", "Fintech & Bakong", "Co-Living & Nomads"]
    },
    "title": { "type": "string", "minLength": 5, "maxLength": 140 },
    "summary": { "type": "string", "minLength": 10, "maxLength": 800 },
    "eventDate": { "type": "string", "maxLength": 40 },
    "attendeesCount": { "type": "integer", "minimum": 1, "maximum": 5000 },
    "imageUrls": {
      "type": "array",
      "maxItems": 6,
      "uniqueItems": true,
      "items": { "type": "string", "format": "uri", "pattern": "^https://i\\.ibb\\.co/.+", "maxLength": 2048 },
      "description": "Optional postcard photos, cover first; each uploaded to imgbb after a 16:9 centre crop (max 1600×900 JPEG, EXIF/GPS stripped)"
    },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## 6. Merchant Profile Contract (`merchantProfiles/{merchantId}`)

Created when a merchant signs in to the Merchant Desk (Admin Panel). On sign-in the browser's geolocation is auto-detected and matched **on-device** to the nearest postcard city (coordinates are never sent to a third-party geocoder); the merchant can adjust the city and street before saving. Saving a location rewrites `city` / `addressLine` on **every** `merchantOffers` document with the same `merchantId`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MerchantProfile",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "businessName",
    "contact",
    "city",
    "addressLine",
    "locationSource",
    "locationUpdatedAt"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^MER-[0-9]{4,12}$" },
    "businessName": { "type": "string", "minLength": 2, "maxLength": 80 },
    "contact": {
      "type": "string",
      "minLength": 3,
      "maxLength": 80,
      "description": "Public Telegram / WhatsApp / phone for the business"
    },
    "city": {
      "type": "string",
      "enum": ["Phnom Penh", "Siem Reap", "Sihanoukville", "Kampot", "Koh Rong", "Battambang"]
    },
    "addressLine": { "type": "string", "minLength": 2, "maxLength": 100 },
    "geo": {
      "type": "object",
      "additionalProperties": false,
      "required": ["lat", "lng", "accuracyM"],
      "description": "Saved only when the merchant accepts an auto-detected location",
      "properties": {
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lng": { "type": "number", "minimum": -180, "maximum": 180 },
        "accuracyM": { "type": "number", "minimum": 0, "maximum": 100000 }
      }
    },
    "locationSource": { "type": "string", "enum": ["auto-detected", "manual"] },
    "locationUpdatedAt": { "type": "string", "format": "date-time" }
  }
}
```

---

## 7. Merchant Offer Postcard Contract (`merchantOffers/{offerId}`)

Merchants post offers for anything a traveller needs as shareable postcards. `businessName`, `contact`, `city` and `addressLine` are denormalized from the merchant profile so the public board can filter by city.

- **Share links** always point back to the web app: `https://www.iwantavisa.com/?offer={id}` (base from `VITE_APP_DOMAIN`). A query parameter is used rather than a `#hash` so a future server route can render per-offer OpenGraph previews.
- **LinkedIn Pulse links** must be `https://linkedin.com/pulse/…` or `https://{subdomain}.linkedin.com/pulse/…`; tracking query strings and fragments are stripped before saving.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MerchantOffer",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "merchantId",
    "businessName",
    "contact",
    "city",
    "addressLine",
    "category",
    "headline",
    "dealBadge",
    "message",
    "postcardStampCode",
    "createdAt"
  ],
  "properties": {
    "id": { "type": "string", "pattern": "^OFR-[0-9]{4,12}$" },
    "merchantId": { "type": "string", "pattern": "^MER-[0-9]{4,12}$" },
    "businessName": { "type": "string", "minLength": 2, "maxLength": 80 },
    "contact": { "type": "string", "minLength": 3, "maxLength": 80 },
    "city": {
      "type": "string",
      "enum": ["Phnom Penh", "Siem Reap", "Sihanoukville", "Kampot", "Koh Rong", "Battambang"]
    },
    "addressLine": { "type": "string", "minLength": 2, "maxLength": 100 },
    "category": {
      "type": "string",
      "description": "28 traveller needs, shown in 8 groups (Visas & paperwork, Places to stay, Staying connected, Getting around, Food & drink, Health & wellbeing, Things to do, Everyday help)",
      "enum": [
        "visa_services", "licences", "documents_printing", "travel_insurance",
        "hotels_hostels", "rental_accommodation",
        "phone_service", "wifi_service", "coworking", "repairs",
        "taxis_transfers", "bus_boat_tickets", "car_hire", "motorcycle_rentals",
        "restaurants", "bars_nightlife",
        "health_clinics", "massage", "beauty_salons", "fitness",
        "tours_transport", "classes_experiences", "diving_watersports", "shopping_souvenirs",
        "money_exchange", "laundry", "courier_shipping", "other"
      ]
    },
    "headline": { "type": "string", "minLength": 5, "maxLength": 100 },
    "dealBadge": {
      "type": "string",
      "minLength": 2,
      "maxLength": 24,
      "description": "Sticker on the postcard front, e.g. \"20% OFF\", \"FREE SIM\", \"$7/DAY\""
    },
    "message": { "type": "string", "minLength": 10, "maxLength": 500 },
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "pattern": "^https://i\\.ibb\\.co/.+",
      "maxLength": 2048,
      "description": "Optional postcard front photo, uploaded to imgbb (never stored on our server) after a 16:9 centre crop (max 1600×900 JPEG); omitted = illustrated \"Greetings from {city}\" card"
    },
    "linkedInPulseUrl": {
      "type": "string",
      "pattern": "^https://([a-z0-9-]+\\.)?linkedin\\.com/pulse/[^/?#]+",
      "maxLength": 2048
    },
    "postcardStampCode": {
      "type": "string",
      "pattern": "^KH-[A-Z0-9-]{3,16}$",
      "description": "City segment (PNH, REP, KOS, KMT, KRG, BBM) is re-stamped when the merchant moves city"
    },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

### Display rules for every postcard grid (merchant offers, category rankings, rentals, Merchant Desk, agent services, community posts)

- **2 postcards per row on every screen, Android and iPhone included**, shown **3 rows (6 postcards) at a time**; a **More** button adds the next 3 rows and scrolls them to the top of the screen. Changing a filter or category starts again from the first 3 rows.
- Below the `lg` breakpoint (phones, tablets) each card shows its **compact face**: 16:9 front, headline, sender · city, rating (or RSVP), Message / Request and one Share button (the phone's share sheet). Tapping the front opens the **full postcard** (message, postmark, address, every share link). From `lg` up the grid shows full postcards.
- **Several photos** (agent services and community posts, up to 6): grid cards show the cover (first photo) with a photo count; the full postcard lets people swipe sideways or use ‹ › to browse them all ("2 / 3" counter and dots). Merchant offers and rentals carry one photo.
- On phones the sticky header slides away while scrolling down (so 3 rows fit on one screen) and returns on any scroll up.

## 8. Registered Person Contract (`userProfiles/{uid}`)

Registration details for a signed-in person (**contains PII**). The document ID is the Firebase Auth uid; only the owner and the superadmin can read it. Every Google account is a **supporter** from its first log-in, with or without this document; registering only adds the details below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "UserProfile",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "name", "email", "phone", "telegram", "location", "role", "registeredAt"],
  "properties": {
    "id": { "type": "string", "minLength": 1, "maxLength": 128, "description": "Firebase Auth uid" },
    "name": { "type": "string", "minLength": 2, "maxLength": 80 },
    "email": { "type": "string", "format": "email", "description": "Lower-case; must equal the Google account email" },
    "phone": { "type": "string", "minLength": 8, "maxLength": 24, "pattern": "^\\+?[0-9 ()-]+$" },
    "telegram": { "type": "string", "pattern": "^@[A-Za-z][A-Za-z0-9_]{3,31}$" },
    "address": { "type": "string", "minLength": 1, "maxLength": 160, "description": "Optional for travellers, required for merchants" },
    "location": {
      "type": "object",
      "additionalProperties": false,
      "required": ["label", "source"],
      "properties": {
        "label": { "type": "string", "minLength": 2, "maxLength": 120, "description": "City-level, matched on-device, e.g. \"Siem Reap, Cambodia 🇰🇭\"" },
        "source": { "type": "string", "enum": ["auto-detected", "manual"] },
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lng": { "type": "number", "minimum": -180, "maximum": 180 },
        "accuracyM": { "type": "number", "minimum": 0 }
      }
    },
    "role": { "type": "string", "enum": ["traveller", "merchant"], "description": "Only the superadmin can change it after creation" },
    "merchantId": { "type": "string", "pattern": "^MER-[0-9]{4,12}$" },
    "merchantBusiness": { "type": "object", "description": "MerchantProfile snapshot (section 6), restored at sign-in until merchantProfiles persist" },
    "registeredAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## 9. Merchant Review Contract (`merchantReviews/{reviewId}`)

Anyone signed in can review any business except their own. **Every review starts `pending`; only the superadmin approves or rejects it**, and only approved reviews are public or counted in ratings (Bayesian average, prior 3.5 × 3).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MerchantReview",
  "type": "object",
  "additionalProperties": false,
  "required": ["merchantId", "reviewerUid", "reviewerName", "rating", "comment", "status", "createdAt"],
  "properties": {
    "id": { "type": "string", "pattern": "^REV-[0-9]{4,12}$" },
    "merchantId": { "type": "string", "pattern": "^MER-[0-9]{4,12}$" },
    "reviewerUid": { "type": "string", "maxLength": 128 },
    "reviewerName": { "type": "string", "maxLength": 40, "description": "Shortened for privacy, e.g. \"Alex M.\"" },
    "rating": { "type": "integer", "minimum": 1, "maximum": 5 },
    "comment": { "type": "string", "minLength": 10, "maxLength": 600 },
    "status": { "type": "string", "enum": ["pending", "approved", "rejected"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "moderatedAt": { "type": "string", "format": "date-time" },
    "moderatedBy": { "type": "string", "maxLength": 128 }
  }
}
```

## 10. Merchant Message Contract (`merchantMessages/{messageId}`)

Private conversation between a signed-in person and a merchant (all messages with the same `merchantId` + `userId`). Only the two participants and the superadmin can read it; the recipient may only set `readByRecipient` to `true`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MerchantMessage",
  "type": "object",
  "additionalProperties": false,
  "required": ["merchantId", "merchantUid", "userId", "userName", "from", "body", "sentAt", "readByRecipient"],
  "properties": {
    "id": { "type": "string", "pattern": "^MSG-[0-9]{4,12}$" },
    "merchantId": { "type": "string", "pattern": "^MER-[0-9]{4,12}$" },
    "merchantUid": { "type": "string", "maxLength": 128, "description": "Owner of the merchant profile" },
    "userId": { "type": "string", "maxLength": 128 },
    "userName": { "type": "string", "maxLength": 80 },
    "offerId": { "type": "string", "pattern": "^OFR-[0-9]{4,12}$", "description": "Postcard the conversation started from" },
    "offerHeadline": { "type": "string", "maxLength": 120 },
    "from": { "type": "string", "enum": ["user", "merchant"] },
    "body": { "type": "string", "minLength": 1, "maxLength": 1000 },
    "sentAt": { "type": "string", "format": "date-time" },
    "readByRecipient": { "type": "boolean" }
  }
}
```

## 11. Supporter Token Wallet Contract (`tokenWallets/{uid}`)

**1 token = US$1**, bought in packs of **10, 50 or 100**; **tokens never expire**. Written **only by Cloud Functions** (`functions/`): `onSupporterCreated` creates the wallet at a person's first Google log-in, and `stripeWebhook` adds tokens after Stripe confirms a payment. The owner and the superadmin can read it; nobody can write it from the browser.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TokenWallet",
  "type": "object",
  "additionalProperties": false,
  "required": ["uid", "balance", "updatedAt"],
  "properties": {
    "uid": { "type": "string", "maxLength": 128 },
    "balance": { "type": "integer", "minimum": 0, "description": "Whole tokens; 1 token = US$1; never expire" },
    "supporterSince": { "type": "string", "format": "date-time", "description": "First Google log-in (server timestamp)" },
    "updatedAt": { "type": "string", "format": "date-time" }
  }
}
```

## 12. Token Purchase Contract (`tokenPurchases/{stripeCheckoutSessionId}`)

One receipt per paid Stripe Checkout Session; the document ID makes webhook retries harmless (a session is credited once). Credited only when the session is `paid`, in `usd`, for exactly `tokens × 100` cents, and its metadata and `client_reference_id` name the same buyer. Readable by the buyer and the superadmin; written only by `stripeWebhook`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TokenPurchase",
  "type": "object",
  "additionalProperties": false,
  "required": ["uid", "tokens", "amountUsd", "stripeCheckoutSessionId", "createdAt"],
  "properties": {
    "uid": { "type": "string", "maxLength": 128 },
    "tokens": { "type": "integer", "enum": [10, 50, 100] },
    "amountUsd": { "type": "integer", "enum": [10, 50, 100] },
    "stripeCheckoutSessionId": { "type": "string", "pattern": "^cs_(test|live)_" },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

### Currency

Every price is **USD only**. The footer shows the day's rate locked at **$1 = … ៛ KHR** (Frankfurter v2, cached 6 hours).
