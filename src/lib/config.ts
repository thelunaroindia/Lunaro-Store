// Central LUNARO configuration.
// Every static brand fact — nav labels, contact details, policy copy,
// SEO defaults — lives here so it is never scattered across components.
// Replace TODO-marked values with real data when it is available;
// nothing here is wired to fake functionality.
export const PRELAUNCH_MODE = true;
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
  email: 'mayankyadavv95@gmail.com',
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
    story: 'A signal caught mid-eclipse — graphic distortion frozen across 240 GSM cotton.',
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

export const fabricDetails = [
  '240 GSM PREMIUM COTTON',
  'OVERSIZED SILHOUETTE',
  'LIMITED ARTWORK',
  'BUILT FOR REPEAT WEAR',
] as const;

export const sizeGuide = {
  note:
    'LUNARO garments are cut oversized by design. If you prefer a closer fit, we recommend sizing down.',
  // Figures shown as "—" until the final size chart is measured and confirmed.
  chart: [
    { size: 'S', chest: '—', length: '—', sleeve: '—' },
    { size: 'M', chest: '—', length: '—', sleeve: '—' },
    { size: 'L', chest: '—', length: '—', sleeve: '—' },
    { size: 'XL', chest: '—', length: '—', sleeve: '—' },
    { size: 'XXL', chest: '—', length: '—', sleeve: '—' },
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
  titleTemplate: '%s — LUNARO',
  defaultTitle: 'LUNARO — Crafted in Darkness',
  description: site.description,
  ogImage: '/og/lunaro-default.jpg', // TODO: replace with a real Higgsfield-derived OG still
} as const;
