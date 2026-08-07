# Booking Link — v1 Build Spec

**Goal:** a hosted inquiry page per business → structured form → saves to DB → redirects the guest into WhatsApp with a pre-filled, clean message to the owner. No WhatsApp API, no ban risk.

**Stack (v1):** Next.js (App Router) + Prisma + Supabase Postgres, deployed to Vercel. No separate NestJS backend yet — server actions handle writes. Schema follows the usual conventions (`cuid()` IDs, `createdAt`/`updatedAt`, enums for status/type) so it lifts into a Nest module cleanly when it grows.

---

## Prisma Schema

```prisma
model Business {
  id        String   @id @default(cuid())
  slug      String   @unique          // public link: /b/imani-stays
  name      String
  whatsapp  String                    // owner number, intl digits only: 234816...
  vertical  Vertical @default(SHORTLET)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inquiries Inquiry[]
}

model Inquiry {
  id          String        @id @default(cuid())
  businessId  String
  business    Business      @relation(fields: [businessId], references: [id])

  guestName   String
  location    String?
  guests      Int?
  checkIn     DateTime?
  checkOut    DateTime?
  bedrooms    Int?
  listingType ListingType?  // real estate only
  budget      String?        // free text — "150k", "100-200k". DON'T parse to Int in v1.
  note        String?

  status      InquiryStatus @default(NEW)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([businessId, status])
}

enum Vertical      { SHORTLET  REAL_ESTATE }
enum ListingType   { RENT  BUY }
enum InquiryStatus { NEW  CONTACTED  BOOKED  LOST }
```

One `Inquiry` table serves both verticals — nullable fields, form config decides which show.

---

## Form Fields (config per vertical)

**Short-let** (lifted straight from Imani's own auto-reply):
- Name
- Preferred location
- Number of guests
- Check-in date
- Check-out date
- Budget (optional)
- Note (optional)

**Real estate** (Shalom):
- Name
- Looking to: Rent / Buy
- Area / location
- Bedrooms
- Budget
- Timeframe / note (optional)

---

## The wa.me Redirect (the core logic)

Format: `https://wa.me/<number>?text=<url-encoded message>`

```ts
function buildWaLink(ownerNumber: string, i: InquiryInput): string {
  const lines = [
    "New booking inquiry from your page:",
    `Name: ${i.guestName}`,
    i.location   && `Location: ${i.location}`,
    i.guests     && `Guests: ${i.guests}`,
    i.bedrooms   && `Bedrooms: ${i.bedrooms}`,
    i.listingType&& `Looking to: ${i.listingType}`,
    i.checkIn    && `Check-in: ${fmt(i.checkIn)}`,
    i.checkOut   && `Check-out: ${fmt(i.checkOut)}`,
    i.budget     && `Budget: ${i.budget}`,
    i.note       && `Note: ${i.note}`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(lines)}`;
}
```

**Flow:** submit → server action saves the `Inquiry` → returns the wa.me URL → guest is sent to WhatsApp. Because the *guest* sends it, the owner receives it as a normal message and gets the guest's number automatically.

---

## Three gotchas that will actually bite you

1. **Normalize the owner number on save.** `wa.me` needs intl digits, no `+`, no spaces. Nigerian input `0816...` → store as `234816...` (strip leading 0, prepend `234`). Do it once at business setup, not per inquiry.

2. **Save BEFORE you redirect.** Persist the inquiry in the server action, *then* hand back the URL. That way even guests who bail before hitting send in WhatsApp are still captured in the owner's dashboard — that's your "nothing lost" promise made real.

3. **In-app browsers (this is the big one).** Your traffic comes from *inside* the TikTok/IG app's webview, where a silent auto-redirect to `wa.me` often gets blocked. Don't rely on auto-redirect — after submit, show a big visible **"Send on WhatsApp"** button linking to the wa.me URL (`target="_blank"`). One tap, reliable, works everywhere.

---

## Week 1 build order

1. Schema + migration, Supabase connected.
2. Public inquiry page `/b/[slug]` — fetch business by slug, render the vertical's form.
3. Server action: validate → save `Inquiry` → return wa.me URL.
4. Result screen with the "Send on WhatsApp" button.
5. Seed a demo `Business` for "Imani Stays" → this is the live link you put in the pilot message.

Dashboard (inquiry list + status dropdown) is Week 2 — the demo doesn't need it.