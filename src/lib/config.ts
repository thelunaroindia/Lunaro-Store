// Central LUNARO configuration.
// Every static brand fact — nav labels, contact details, policy copy,
// SEO defaults — lives here so it is never scattered across components.
// Replace TODO-marked values with real data when it is available;
// nothing here is wired to fake functionality.
export const PRELAUNCH_MODE = true;

// Temporary purchase-flow test switch. While PRELAUNCH_MODE keeps every
// product page concealed, this unlocks ONE real, already-connected Shopify
// product (PURCHASE_TEST_PRODUCT_HANDLE) so the full
// Product → Cart → Fastr → Shopify order pipeline can be exercised end to
// end before launch. It touches nothing else — no cart/Fastr/Shopify logic,
// no homepage content, no other product handle.
//
// Set back to `false` the moment testing is done — that alone fully
// restores today's prelaunch restrictions with no other change required.
export const PURCHASE_TEST_MODE = false;

// Must be a real handle already live in the connected Shopify store — never
// a fabricated product. As of this writing the store has exactly one
// product connected via the Storefront API ("test product", handle "test"),
// so that is what this unlocks.
export const PURCHASE_TEST_PRODUCT_HANDLE = 'test';

// Drop 001's confirmed release date, as an ISO 8601 string (e.g.
// '2026-09-01T00:00:00+05:30'). Left null until a real date is approved —
// the Hero's date/countdown display simply doesn't render anything while
// this is null, rather than showing an invented date. Set this one value
// to go live; every component that reads it (Hero.tsx) picks it up
// immediately with no other code change.
export const DROP_DATE: string | null = null;

export const site = {
  name: 'LUNARO',
  domain: 'lunaro.in',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lunaro.in',
  tagline: 'CRAFTED IN DARKNESS.',
  description:
    'LUNARO is a premium oversized streetwear label from India, built from lunar silence, deep space and human ambition. Limited drops, garment-first design.',
  locale: 'en_IN',
  currency: 'INR',
} as const;

export const brandLines = {
  primary: 'CRAFTED IN DARKNESS.',
  supporting: [
    'WORN BEYOND EARTH.',
    'DESIGNED FOR THE UNKNOWN.',
    'GARMENTS FROM ANOTHER ORBIT.',
    'BUILT FOR THOSE WHO MOVE BEYOND.',
    'THE DARKNESS HAS A FORM.',
    'ENTER THE NEXT ORBIT.',
    'MADE UNDER A DIFFERENT SKY.',
    'LIMITED BY NOTHING.',
    'A NEW UNIFORM FOR THE UNKNOWN.',
  ],
} as const;

export const contact = {
  brandName: 'LUNARO',
  contactPerson: 'Mayank Yadav',
  email: 'thelunaroindia@gmail.com',
  phone: '+91 98118 31900',
  whatsapp: '+91 98118 31900',
  instagram: '@lunarohq',
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/lunarohq',
  country: 'India',
  // No physical office/warehouse address is published until one is provided.
} as const;

export const nav = {
  main: [
    { label: 'Shop', href: '/shop' },
    { label: 'New Drop', href: '/new-drop' },
    { label: 'Collections', href: '/collections' },
    { label: 'World', href: '/about' },
  ],
  utility: [
    { label: 'Search', href: '/search' },
    { label: 'Account', href: '/account' },
    { label: 'Wishlist', href: '/wishlist' },
  ],
  footerColumns: [
    {
      title: 'Shop',
      links: [
        { label: 'Shop All', href: '/shop' },
        { label: 'New Drop', href: '/new-drop' },
        { label: 'Collections', href: '/collections' },
        { label: 'Lookbook', href: '/lookbook' },
      ],
    },
    {
      title: 'LUNARO',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Transmissions', href: '/transmissions' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Size Guide', href: '/size-guide' },
        { label: 'Track Order', href: '/track-order' },
        { label: 'Shipping & Returns', href: '/shipping-returns' },
        { label: 'Refund Policy', href: '/refund-policy' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms & Conditions', href: '/terms' },
      ],
    },
  ],
} as const;

// Shown only until real Shopify products exist — every component that
// reads this is also wired to read live Shopify data first (see
// src/lib/shopify.ts). Missing imagery renders as CinematicPlaceholder
// (src/components/ui/CinematicPlaceholder.tsx), never a broken image or bare text.
export const placeholderProducts = [
  {
    handle: 'orbit-01-oversized-tee',
    title: 'ORBIT 01 OVERSIZED TEE',
    price: 1199,
    colour: 'Obsidian Black',
    story:
      'ORBIT 01 explores the tension between isolation and movement through a fragmented lunar transmission.',
  },
  {
    handle: 'eclipse-signal-tee',
    title: 'ECLIPSE SIGNAL TEE',
    price: 1199,
    colour: 'Obsidian Black',
    story: 'A signal caught mid-eclipse — graphic distortion frozen across 260 GSM cotton.',
  },
  {
    handle: 'void-explorer-tee',
    title: 'VOID EXPLORER TEE',
    price: 1199,
    colour: 'Deep Black',
    story: 'Built for those who read silence as instruction rather than absence.',
  },
  {
    handle: 'lunar-archive-tee',
    title: 'LUNAR ARCHIVE TEE',
    price: 1199,
    colour: 'Charcoal',
    story: 'A recovered fragment from an archive that has not yet been written.',
  },
] as const;

// The confirmed oversized-tee fabric spec — single source of truth so the
// PDP "Fabric & Finish" accordion and the homepage Construction section
// never drift from what's actually manufactured. Update here only when the
// real spec changes.
export const fabricDetails = [
  '260 GSM',
  'French Terry',
  '100% Cotton',
  '2x1 Lycra Rib',
  'Oversized Fit',
  'Bio Wash + Silicone Wash + Gold Finish',
] as const;

// Trackpant-specific facts (confirmed from live Shopify product data) —
// kept separate from fabricDetails so tee copy never leaks onto bottoms.
export const trackpantFabricDetails = [
  '260 GSM Terry',
  '90% Cotton / 10% Polyester',
  'Two Front Pockets',
] as const;

export const trackpantFitAndCare = [
  'Loose fit',
  'Designed for a relaxed silhouette',
  'Machine wash cold',
  'Wash with similar colours',
  'Do not bleach',
] as const;

// Sourced from the manufacturer's own "Oversized Classic T-Shirt" size-chart
// image, uploaded to the tee products' Shopify media. The source chart has
// no sleeve measurement — only chest and length are populated.
export const sizeGuide = {
  note:
    'LUNARO garments are cut oversized by design. If you prefer a closer fit, we recommend sizing down.',
  chart: [
    { size: 'XS', chest: 39, length: 27 },
    { size: 'S', chest: 41, length: 28 },
    { size: 'M', chest: 43, length: 29 },
    { size: 'L', chest: 45, length: 30 },
    { size: 'XL', chest: 47, length: 31 },
    { size: '2XL', chest: 49, length: 32 },
  ],
} as const;

// Sourced from the manufacturer's own sweatpants size-chart image, uploaded
// to both trackpant products' Shopify media (identical file on each).
export const bottomsSizeGuide = {
  note: 'Measurements are in inches, as provided by the manufacturer.',
  chart: [
    { size: 'S', waist: 30, hip: 36, outseam: 39, inseam: 27 },
    { size: 'M', waist: 32, hip: 38, outseam: 40, inseam: 27 },
    { size: 'L', waist: 34, hip: 40, outseam: 41, inseam: 27 },
    { size: 'XL', waist: 36, hip: 44, outseam: 42, inseam: 27 },
    { size: '2XL', waist: 38, hip: 46, outseam: 43, inseam: 27 },
  ],
} as const;

export const payments = {
  // "Pay Online" is whatever methods are enabled in Shopify Admin →
  // Settings → Payments — nothing here is a promise beyond what's actually
  // configured. "Wallets" is phrased as conditional since availability
  // depends on the payment gateway chosen.
  methods: ['UPI', 'Credit & Debit Cards', 'Net Banking', 'Wallets (where supported)'],
} as const;

export const policies = {
  shipping: {
    heading: 'Shipping & Returns',
    intro:
      'LUNARO ships across India. Shipping and fulfilment are handled through Shiprocket, connected directly to our Shopify backend.',
    // TODO: confirm final rates, timelines and courier partners before launch.
    points: [
      'Dispatch timelines are confirmed on the order confirmation page and in your confirmation email.',
      'Tracking details are sent once your order is picked up by our courier partner.',
      'Returns and exchanges are accepted within the window stated at checkout, subject to the garment being unworn and in original packaging.',
    ],
  },
  refund: {
    heading: 'Refund Policy',
    intro: 'Refunds are processed to the original payment method once a returned item is received and inspected.',
    points: [
      'Refund processing time depends on your bank or payment provider once approved.',
      'Cash-on-delivery orders are refunded via bank transfer or store credit, as selected at the time of return.',
      'Items marked final sale or part of a limited drop may not be eligible for return — this is stated on the product page where applicable.',
    ],
  },
  privacy: {
    heading: 'Privacy Policy',
    intro:
      'LUNARO collects only the information required to process orders, provide support and, where you opt in, send updates about new drops.',
    points: [
      'Payment details are handled by our payment gateway and Shopify — LUNARO does not store your card information.',
      'Shipping information is shared with Shiprocket solely to fulfil your order.',
      'You can request access to or deletion of your data by contacting us — see the Contact page.',
    ],
  },
  terms: {
    heading: 'Terms & Conditions',
    intro: 'By using lunaro.in and placing an order, you agree to the following terms.',
    points: [
      'All prices are listed in INR and include applicable taxes unless stated otherwise.',
      'LUNARO reserves the right to limit quantities on limited drops.',
      'Product imagery is representative; minor variation in colour may occur due to display settings and dye lots.',
    ],
  },
} as const;

export const faqs = [
  {
    q: 'How do LUNARO garments fit?',
    a: 'Every piece is cut oversized by design. Check the Size Guide for the full breakdown, and size down if you prefer a closer fit.',
  },
  {
    q: 'When will my order ship?',
    a: 'Dispatch timelines are shown at checkout and confirmed by email once your order is placed.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'LUNARO currently ships within India. International shipping will be announced on Transmissions if it becomes available.',
  },
  {
    q: 'How do limited drops work?',
    a: 'Each drop is produced in a limited run. Once a size or garment sells out, it will not be restocked unless stated otherwise.',
  },
  {
    q: 'How do I track my order?',
    a: 'Use the Track Order page with your order number and email, or the tracking link sent to you once your order ships.',
  },
] as const;

export const seoDefaults = {
  titleTemplate: '%s | LUNARO',
  defaultTitle: 'LUNARO — Crafted in Darkness',
  description: site.description,
  ogImage: '/og/lunaro-default.jpg', // TODO: replace with a real Higgsfield-derived OG still
} as const;
